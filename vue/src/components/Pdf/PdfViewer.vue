<template>
  <div class="pdf-viewer" ref="viewerRef">
    <div id="pageContainer"></div>
    <!--<div id="hc" class="highlight">
    </div>-->
  </div>

</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, watch, computed} from "vue";
import {storeToRefs} from "pinia";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import {useEditStore} from "../../stores/edit.ts";
import axios from "axios";

// --- Worker 设置 ---
pdfjsLib.GlobalWorkerOptions.workerSrc = "/package/pdf.worker.min.js";
const props = defineProps<{
  pdfUrl: string | null;
}>();

const emit = defineEmits(["pdfRendered", "textSelected"]);
const editStore = useEditStore()
const {rects, currentPDFPage} = storeToRefs(editStore)
const viewerRef = ref<HTMLDivElement>();
let pdfInstance: any = null;
let rendering = false;

//---------------------获取页数----------------------
const getPageCount = async () => {
  const loadingTask = pdfjsLib.getDocument({
    url: props.pdfUrl,
    cMapUrl: "/package/cmaps/",
    cMapPacked: true,
  });
  pdfInstance = await loadingTask.promise
  return pdfInstance.numPages
}


// -------------------- 渲染单页 --------------------
async function renderPage(page: any, index: number) {
  const scale = 1;
  const viewport = page.getViewport({ scale });
  const outputScale = window.devicePixelRatio || 1;

  //const pageContainer = document.createElement("div");
  const pageContainer = document.getElementById("pageContainer");
  pageContainer.className = "page-container";
  pageContainer.style.position = "relative";
  pageContainer.style.display = "inline-block";
  pageContainer.style.margin = "20px auto";
  pageContainer.style.width = viewport.width + "px";
  pageContainer.style.height = viewport.height + "px";
  pageContainer.innerHTML = ""

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
  textLayerDiv.id = "textLayerDiv"
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
  highlightLayerDiv.id = "highlightLayer"
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
  renderHightLightLayer(textContent, viewport,highlightLayerDiv, rects.value, index)
  // 高 DPI 修正（可选，PDF.js 计算好了通常不需要）
  // if (outputScale !== 1) {
  //   textLayerDiv.style.transform = `scale(${1 / outputScale})`;
  //   textLayerDiv.style.transformOrigin = "0 0";
  // }
}

//--------------------渲染高亮层-------------------------
const renderHightLightLayer = (textContent, viewPort, hightLightElem, rectangles, pageIndex) =>{
  const highlightLayerDiv = hightLightElem;
  highlightLayerDiv.style.width = viewPort.width + "px";
  highlightLayerDiv.style.height = viewPort.height + "px";

  // 清除现有的高亮块
  highlightLayerDiv.innerHTML = "";

  rectangles.forEach((item) => {
    // pageIndex从0开始，item.page从1开始，需要转换
    if(item.page === (pageIndex + 1)){
      // 直接使用item中的坐标，因为已经在创建时考虑了相对位置
      const div = document.createElement("div");
      div.className = "highlightBlock";
      div.style.position = "absolute";
      div.style.backgroundColor = item.color;
      div.style.left = item.x + "px";
      div.style.top = item.y + "px";
      div.style.width = item.width + "px";
      div.style.height = item.height + "px";
      highlightLayerDiv.appendChild(div);
      div.addEventListener("click", () =>{
        console.log("click-this");
      })
    }
  })
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
    renderPage(page, i);
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

const updateHightLightLayer = async (pageIndex, rectList) => {
  const highlightLayerDiv = document.getElementById("highlightLayer");
  highlightLayerDiv.innerHTML = "";

  const scale = 1
  const page = await pdfInstance.getPage(pageIndex);
  const viewport = page.getViewport({ scale });

  // highlight Layer 渲染
  const textContent = await page.getTextContent();
  //console.log(useEditStore().rects);
  renderHightLightLayer(textContent, viewport, highlightLayerDiv, rectList,  pageIndex - 1)
}

onMounted(async () => {
  handleTextSelection();
  //if (props.pdfUrl) renderPDF();
  if(props.pdfUrl){
    const loadingTask = pdfjsLib.getDocument({
      url: props.pdfUrl,
      cMapUrl: "/package/cmaps/",
      cMapPacked: true,
    });
    pdfInstance = await loadingTask.promise;
    const page = await pdfInstance.getPage(1)
    const pageNum = await pdfInstance.numPages;
    useEditStore().setTotalPages(pageNum);
    renderPage(page, 1)
    document.getElementById("pageContainer").click()
  }
});

watch([props.pdfUrl, currentPDFPage], async ([new_A, new_B], [oldA, oldB]) => {
  const loadingTask = pdfjsLib.getDocument({
    url: props.pdfUrl,
    cMapUrl: "/package/cmaps/",
    cMapPacked: true,
  });
  pdfInstance = await loadingTask.promise;
  const page = await pdfInstance.getPage(new_B);
  renderPage(page, new_B);
  const pageNum = await pdfInstance.numPages;
  useEditStore().setTotalPages(pageNum);

  const currentPage = useEditStore().currentPDFPage;
  updateHightLightLayer(currentPage, newVal);
})

watch(rects, async (newVal, oldVal) =>{
  const currentPage = useEditStore().currentPDFPage;
  updateHightLightLayer(currentPage, newVal);
})

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
  z-index: 999;
}
.highlightBlock{
  //position: absolute;
  border-radius: 2px;
  z-index: 999;
}
.highlightBlock:hover{
  cursor: pointer;
}
</style>
