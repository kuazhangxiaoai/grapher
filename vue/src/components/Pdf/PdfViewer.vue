<template>
  <div class="pdf-viewer" ref="viewerRef">
    <div id="highlight-container" class="highlight"></div>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
// --- Worker 设置 ---
pdfjsLib.GlobalWorkerOptions.workerSrc = "/package/pdf.worker.min.js";

const props = defineProps<{
  pdfUrl: string | null;
}>();

const emit = defineEmits(["pdfRendered", "textSelected"]);

const viewerRef = ref<HTMLDivElement>();
let pdfInstance: any = null;
let rendering = false;

// -------------------- 渲染单页 --------------------
async function renderPage(page: any) {
  const scale = 1;
  const viewport = page.getViewport({ scale });
  const outputScale = window.devicePixelRatio || 1;

  const pageContainer = document.createElement("div");
  pageContainer.className = "page-container";
  pageContainer.style.position = "relative";
  pageContainer.style.display = "inline-block";
  pageContainer.style.margin = "20px auto";
  pageContainer.style.width = viewport.width + "px";
  pageContainer.style.height = viewport.height + "px";

  // Canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = viewport.width + "px";
  canvas.style.height = viewport.height + "px";
  pageContainer.appendChild(canvas);

  // Text Layer
  const textLayerDiv = document.createElement("div");
  textLayerDiv.className = "textLayer";
  textLayerDiv.style.position = "absolute";
  textLayerDiv.style.top = "0";
  textLayerDiv.style.left = "0";
  textLayerDiv.style.width = viewport.width + "px";
  textLayerDiv.style.height = viewport.height + "px";
  textLayerDiv.style.zIndex = 9;
  textLayerDiv.style.pointerEvents = "auto";
  pageContainer.appendChild(textLayerDiv);

  //Highlight Layer
  const highlightLayerDiv = document.createElement("div");
  highlightLayerDiv.className = "highlightLayer";
  highlightLayerDiv.style.position = "absolute";
  highlightLayerDiv.style.top = "0";
  highlightLayerDiv.style.left = "0";
  highlightLayerDiv.style.width = viewport.width + "px";
  highlightLayerDiv.style.height = viewport.height + "px";
  highlightLayerDiv.style.pointerEvents = "auto";
  highlightLayerDiv.style.zIndex = 1;
  highlightLayerDiv.style.background = "rgba(0,0,0,0)";
  pageContainer.appendChild(highlightLayerDiv);

  viewerRef.value!.appendChild(pageContainer);

  // Canvas 渲染
  const renderContext = {
    canvasContext: context,
    viewport,
    transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null
  };
  await page.render(renderContext).promise;

  // Text Layer 渲染
  const textContent = await page.getTextContent();
  const textLayer = pdfjsLib.renderTextLayer({
    textContent,
    container: textLayerDiv,
    viewport,
    textDivs: [],
    enhanceTextSelection: true
  });
  await textLayer.promise;

  // 高 DPI 修正（可选，PDF.js 计算好了通常不需要）
  // if (outputScale !== 1) {
  //   textLayerDiv.style.transform = `scale(${1 / outputScale})`;
  //   textLayerDiv.style.transformOrigin = "0 0";
  // }
}


// -------------------- 渲染整个 PDF --------------------
let mouseUpHandler: any = null;

async function renderPDF() {
  if (!props.pdfUrl || rendering) return;
  rendering = true;

  viewerRef.value!.innerHTML = "";

  const loadingTask = pdfjsLib.getDocument({
    url: props.pdfUrl,
    cMapUrl: "/package/cmaps/",
    cMapPacked: true,
  });

  pdfInstance = await loadingTask.promise;

  const totalPages = pdfInstance.numPages;

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfInstance.getPage(i);
    // 不 await，异步渲染，提高滚动流畅度
    renderPage(page);
  }

  rendering = false;

  emit("pdfRendered");
}

// -------------------- 文本选中事件 --------------------
function handleTextSelection() {
  mouseUpHandler = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (!selectedText) return;
    emit("textSelected", selectedText);
  };
  document.addEventListener("mouseup", mouseUpHandler);
}

onMounted(() => {
  handleTextSelection();
  if (props.pdfUrl) renderPDF();
});

watch(
  () => props.pdfUrl,
  () => renderPDF()
);

onBeforeUnmount(() => {
  if (mouseUpHandler) document.removeEventListener("mouseup", mouseUpHandler);
});
</script>

<style scoped>
.pdf-viewer {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  position: relative;
  background-color: #f5f5f5;
}

.page-container {
  margin: 20px auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
  position: relative;
}

.textLayer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto;
  /* opacity: 0.5;  */
  /* mix-blend-mode: multiply; */
}

.textLayer ::selection {
  background: rgba(0, 0, 255, 0.3);
}

.textLayer span {
  color: transparent;
}

.highlight{
  width: 100%;
  height: 100%;
  overflow-y: auto;
  position: absolute;
  background-color: #f5f5f5;
}
</style>
