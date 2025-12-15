<template>
  <div class="pdf-viewer" ref="viewerRef">
    <div id="pageContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { storeToRefs } from "pinia";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import { useEditStore } from "../../stores/edit.ts";
import { RectangleType } from "../../types/rect.ts";

// --- Worker 设置 ---
pdfjsLib.GlobalWorkerOptions.workerSrc = "/package/pdf.worker.min.js";

const props = defineProps<{
  pdfUrl: string | null;
}>();
const emit = defineEmits(["pdfRendered"]);

const editStore = useEditStore();
const { rects, currentPDFPage } = storeToRefs(editStore);

const viewerRef = ref<HTMLDivElement>();
let pdfInstance: any = null;
let rendering = false;
let mouseUpHandler: any = null;
let globalClickHandler: ((e: MouseEvent) => void) | null = null;

// -------------------- 渲染单页 --------------------
async function renderPage(page: any, index: number) {
  const scale = 1;
  const viewport = page.getViewport({ scale });
  const outputScale = window.devicePixelRatio || 1;

  const pageContainer: HTMLElement = document.getElementById("pageContainer")!;
  pageContainer.className = "page-container";
  pageContainer.style.position = "relative";
  pageContainer.style.display = "inline-block";
  pageContainer.style.margin = "20px auto";
  pageContainer.style.width = viewport.width + "px";
  pageContainer.style.height = viewport.height + "px";
  pageContainer.innerHTML = "";

  // Canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = viewport.width + "px";
  canvas.style.height = viewport.height + "px";
  pageContainer.appendChild(canvas);

  // Text Layer
  const textLayerDiv: HTMLElement = document.createElement("div");
  textLayerDiv.className = "textLayer";
  textLayerDiv.style.position = "absolute";
  textLayerDiv.style.top = "0";
  textLayerDiv.style.left = "0";
  textLayerDiv.style.width = viewport.width + "px";
  textLayerDiv.style.height = viewport.height + "px";
  textLayerDiv.style.zIndex = "5";
  // 保持文字可选中
  textLayerDiv.style.pointerEvents = "auto";
  pageContainer.appendChild(textLayerDiv);

  // Highlight Layer
  const highlightLayerDiv: HTMLElement = document.createElement("div");
  highlightLayerDiv.className = "highlightLayer";
  highlightLayerDiv.style.position = "absolute";
  highlightLayerDiv.style.top = "0";
  highlightLayerDiv.style.left = "0";
  highlightLayerDiv.style.width = viewport.width + "px";
  highlightLayerDiv.style.height = viewport.height + "px";
  highlightLayerDiv.style.pointerEvents = "none"; // 允许鼠标事件穿透到文字层
  highlightLayerDiv.style.zIndex = "10";
  highlightLayerDiv.style.background = "rgba(0,0,0,0)";
  pageContainer.appendChild(highlightLayerDiv);

  // Canvas 渲染
  const renderContext = {
    canvasContext: context,
    viewport,
    transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
  };
  await page.render(renderContext).promise;

  // Text Layer 渲染
  const textContent = await page.getTextContent();
  const textLayer = pdfjsLib.renderTextLayer({
    textContent,
    container: textLayerDiv,
    viewport,
    textDivs: [],
    enhanceTextSelection: true,
  });
  await textLayer.promise;

  // 渲染高亮层
  renderHightLightLayer(textContent, viewport, highlightLayerDiv, rects.value, index);
}

// -------------------- 渲染高亮层 --------------------
const renderHightLightLayer = (
  textContent: any,
  viewPort: any,
  hightLightElem: HTMLElement,
  rectangles: any[],
  pageIndex: number
) => {
  const highlightLayerDiv = hightLightElem;
  highlightLayerDiv.style.width = viewPort.width + "px";
  highlightLayerDiv.style.height = viewPort.height + "px";
  highlightLayerDiv.innerHTML = "";

  rectangles.forEach((item, index) => {
    if (item.page === pageIndex + 1) {
      const div = document.createElement("div");
      div.className = "highlightBlock";
      div.style.position = "absolute";
      div.style.pointerEvents = "none"; // 允许鼠标事件穿透
      div.style.cursor = "pointer";
      div.style.backgroundColor = "transparent";
      div.style.borderBottom = `2px solid ${item.color || "yellow"}`;
      div.style.left = item.x + "px";
      div.style.top = item.y + "px";
      div.style.width = item.width + "px";
      div.style.height = item.height + "px";

      if (item.text) div.dataset.text = item.text;
      if (item.id) div.dataset.id = item.id;
      div.dataset.index = String(index);

      highlightLayerDiv.appendChild(div);
    }
  });

  installGlobalMouseHandlers();
};

// -------------------- 全局鼠标事件处理 --------------------
function installGlobalMouseHandlers() {
  if (globalClickHandler) return;

  // 点击事件处理
  globalClickHandler = (e: MouseEvent) => {
    const pageContainer = document.getElementById("pageContainer");
    if (!pageContainer) return;
    const containerRect = pageContainer.getBoundingClientRect();
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;

    if (clickX < 0 || clickY < 0 || clickX > containerRect.width || clickY > containerRect.height) return;

    const currentRects = rects.value || [];
    const currentPage = editStore.currentPDFPage;

    for (let i = 0; i < currentRects.length; i++) {
      const item = currentRects[i];
      if (item.page !== currentPage) continue;

      // 扩大点击区域，垂直方向扩大到整个文字行
      const expandHeightUp = 25; // 向上扩大的高度，确保覆盖文字部分
      const expandHeightDown = 10; // 向下扩大的高度
      const left = item.x;
      const top = Math.max(0, item.y - expandHeightUp); // 向上扩大更多，覆盖文字部分
      const right = item.x + item.width;
      const bottom = item.y + item.height + expandHeightDown; // 向下扩大适当高度
      if (clickX >= left && clickX <= right && clickY >= top && clickY <= bottom) {
        console.log("点击到高亮区域", item);
       
        if (item.text) {
          // 打开编辑框
          editStore.openGraphEditor();
          // 设置选中的文字内容
          editStore.setSequence(item.text);
          // 删除之前的编辑态矩形
          editStore.deleteEditingRect();
          // 重新添加当前点击的矩形作为编辑态
          const rectToEdit = {
            ...item,
            type: RectangleType.EDITING
          };
          editStore.addRect(rectToEdit);
          editStore.queryGraphBySeq(item.text);
        }
        return;
      }
    }
  };

  // 鼠标移动事件处理 - 用于动态设置光标样式
  const handleMouseMove = (e: MouseEvent) => {
    const pageContainer = document.getElementById("pageContainer");
    if (!pageContainer) return;
    
    const containerRect = pageContainer.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;

    if (mouseX < 0 || mouseY < 0 || mouseX > containerRect.width || mouseY > containerRect.height) {
      // 鼠标移出页面容器，设置默认光标
      pageContainer.style.cursor = "default";
      // 同时重置文本层的光标样式
      const textLayer = pageContainer.querySelector(".textLayer");
      if (textLayer) {
        (textLayer as HTMLElement).style.cursor = "default";
      }
      return;
    }

    const currentRects = rects.value || [];
    const currentPage = editStore.currentPDFPage;
    let isOverHighlight = false;

    for (const item of currentRects) {
      if (item.page !== currentPage) continue;

      // 扩大检测区域，垂直方向扩大到整个文字行
      const expandHeightUp = 25; // 向上扩大的高度，确保覆盖文字部分
      const expandHeightDown = 10; // 向下扩大的高度
      const left = item.x;
      const top = Math.max(0, item.y - expandHeightUp); // 向上扩大更多，覆盖文字部分
      const right = item.x + item.width;
      const bottom = item.y + item.height + expandHeightDown; // 向下扩大适当高度

      if (mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom) {
        isOverHighlight = true;
        break;
      }
    }

    // 获取文本层元素
    const textLayer = pageContainer.querySelector(".textLayer");
    
    if (isOverHighlight) {
      // 悬停在高亮区域上，显示指针光标
      pageContainer.style.cursor = "pointer";
      if (textLayer) {
        (textLayer as HTMLElement).style.cursor = "pointer";
        // 设置文本层内部span元素的光标样式
        const textSpans = textLayer.querySelectorAll("span");
        textSpans.forEach(span => {
          (span as HTMLElement).style.cursor = "pointer";
        });
      }
    } else {
      // 非高亮区域，文字部分显示文本选择光标，其他区域显示默认光标
      pageContainer.style.cursor = "default";
      if (textLayer) {
        (textLayer as HTMLElement).style.cursor = "text";
        // 设置文本层内部span元素的光标样式为文本选择光标
        const textSpans = textLayer.querySelectorAll("span");
        textSpans.forEach(span => {
          (span as HTMLElement).style.cursor = "text";
        });
      }
    }
  };

  document.addEventListener("click", globalClickHandler);
  document.addEventListener("mousemove", handleMouseMove);

  // 保存mousemove事件处理器，以便在卸载时移除
  (globalClickHandler as any).mousemoveHandler = handleMouseMove;
}

function uninstallGlobalClickHandler() {
  if (!globalClickHandler) return;
  document.removeEventListener("click", globalClickHandler);
  // 移除鼠标移动事件监听器
  const mousemoveHandler = (globalClickHandler as any).mousemoveHandler;
  if (mousemoveHandler) {
    document.removeEventListener("mousemove", mousemoveHandler);
  }
  globalClickHandler = null;
}

// -------------------- 更新高亮 --------------------
const updateHightLightLayer = async (pageIndex: number, rectList: any[]) => {
  const pageContainer: HTMLElement = document.getElementById("pageContainer")!;
  if (!pageContainer || !pdfInstance) return;

  let highlightLayerDiv: any = pageContainer.querySelector(".highlightLayer");
  if (!highlightLayerDiv) {
    const page = await pdfInstance.getPage(pageIndex);
    const viewport = page.getViewport({ scale: 1 });
    highlightLayerDiv = document.createElement("div");
    highlightLayerDiv.className = "highlightLayer";
    highlightLayerDiv.style.position = "absolute";
    highlightLayerDiv.style.top = "0";
    highlightLayerDiv.style.left = "0";
    highlightLayerDiv.style.width = viewport.width + "px";
    highlightLayerDiv.style.height = viewport.height + "px";
    highlightLayerDiv.style.pointerEvents = "none";
    highlightLayerDiv.style.zIndex = "10";
    highlightLayerDiv.style.background = "rgba(0,0,0,0)";
    pageContainer.appendChild(highlightLayerDiv);
  }

  highlightLayerDiv.innerHTML = "";

  const page = await pdfInstance.getPage(pageIndex);
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();
  renderHightLightLayer(textContent, viewport, highlightLayerDiv, rectList, pageIndex - 1);
};

// -------------------- 生命周期 --------------------
onMounted(async () => {

  if (props.pdfUrl) {
    const loadingTask = pdfjsLib.getDocument({
      url: props.pdfUrl,
      cMapUrl: "/package/cmaps/",
      cMapPacked: true,
    });
    pdfInstance = await loadingTask.promise;

    const page = await pdfInstance.getPage(1);
    const pageNum = await pdfInstance.numPages;
    editStore.setTotalPages(pageNum);

    renderPage(page, 1);

    editStore.clearAllRects();
    await editStore.queryRects();

    setTimeout(() => {
      const currentPage = editStore.currentPDFPage;
      updateHightLightLayer(currentPage, rects.value);
    }, 100);
  }
});

watch([props.pdfUrl, currentPDFPage], async ([newA, newB]) => {
  if (!newB || !props.pdfUrl) return;

  const loadingTask = pdfjsLib.getDocument({
    url: props.pdfUrl,
    cMapUrl: "/package/cmaps/",
    cMapPacked: true,
  });
  pdfInstance = await loadingTask.promise;
  const page = await pdfInstance.getPage(newB);
  renderPage(page, newB);

  const pageNum = await pdfInstance.numPages;
  editStore.setTotalPages(pageNum);

  editStore.clearAllRects();
  await editStore.queryRects();

  setTimeout(() => {
    const currentPage = editStore.currentPDFPage;
    updateHightLightLayer(currentPage, rects.value);
  }, 100);
});

watch(rects, async (newVal) => {
  if (newVal.length > 0 && pdfInstance) {
    const currentPage = editStore.currentPDFPage;
    updateHightLightLayer(currentPage, newVal);
  }
});

onBeforeUnmount(() => {
  if (mouseUpHandler) document.removeEventListener("mouseup", mouseUpHandler);
  uninstallGlobalClickHandler();
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
}

.textLayer ::selection {
  background: rgba(0, 0, 255, 0.3);
}

.textLayer span {
  color: transparent;
}

.highlightBlock {
  border-radius: 2px;
  pointer-events: none;
  cursor: pointer;
}
</style>
