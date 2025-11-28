<template>
  <div
    style="width: 50vw"
    class="document-panel w-1/2 h-full border-r border-gray-200 bg-white flex flex-col"
  >
    <!-- 文档上传区域 -->
    <div class="upload-section p-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold mb-2">PDF文档上传</h3>
      <input
        type="file"
        id="document-upload"
        accept=".pdf"
        class="hidden"
        @change="handleFileUpload"
      />
      <label
        for="document-upload"
        class="upload-btn px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-colors"
      >
        选择PDF文档
      </label>
      <div class="file-info mt-2 text-sm text-gray-600" v-if="selectedFileName">
        已选择: {{ selectedFileName }}
        <span class="ml-2 text-xs text-gray-500">(可直接选择文字进行复制)</span>
      </div>
    </div>

    <!-- 文档内容显示区域 -->
    <div class="document-content flex-1 overflow-auto">
      <!-- PDF HTML 渲染区域 -->
      <div
        v-if="pdfHtmlContent"
        ref="pdfContent"
        class="pdf-html-content p-6"
        v-html="pdfHtmlContent"
        @mouseup="handleTextSelection"
      ></div>

      <!-- 加载状态 -->
      <div v-else-if="isLoading" class="loading-state text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">正在解析PDF文档...</p>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state text-center text-gray-400 py-12">
        <div class="mb-4 text-gray-300 text-4xl">📄</div>
        <p class="mb-2">请上传PDF文档查看内容</p>
        <p class="text-sm">支持 .pdf 格式（选择文字后按Ctrl+C触发添加节点）</p>
      </div>
    </div>

    <!-- 搜索框 -->
    <div
      v-if="pdfHtmlContent"
      class="search-section p-3 border-t border-gray-200 bg-gray-50"
    >
      <div class="flex items-center space-x-2">
        <input
          v-model="searchText"
          type="text"
          placeholder="搜索文档内容..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="handleSearch"
        />
        <button
          @click="clearSearch"
          class="px-3 py-2 text-gray-600 hover:text-gray-800"
        >
          清除
        </button>
      </div>
      <div
        v-if="searchResults.length > 0"
        class="search-results mt-2 text-sm text-gray-600"
      >
        找到 {{ searchResults.length }} 个结果
        <button @click="prevResult" class="ml-2 px-2 py-1 bg-blue-100 rounded">
          上一个
        </button>
        <button @click="nextResult" class="ml-1 px-2 py-1 bg-blue-100 rounded">
          下一个
        </button>
      </div>
    </div>
  </div>

  <!-- 节点信息设置模态框 -->
  <el-modal
    v-model:visible="showNodeModal"
    title="设置节点信息"
    @ok="handleNodeModalOk"
    @cancel="handleNodeModalCancel"
    width="500px"
  >
    <el-form layout="vertical">
      <el-form-item label="节点名称">
        <el-input v-model="nodeForm.name" placeholder="请输入节点名称" />
      </el-form-item>
      <el-form-item label="节点类型">
        <el-select v-model="nodeForm.type" placeholder="请选择节点类型">
          <el-option value="entity">实体</el-option>
          <el-option value="concept">概念</el-option>
          <el-option value="event">事件</el-option>
          <el-option value="attribute">属性</el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="节点描述">
        <el-textarea
          v-model="nodeForm.description"
          placeholder="请输入节点描述"
          :rows="4"
        />
      </el-form-item>
      <el-form-item label="原始文本">
        <el-textarea
          v-model="nodeForm.originalText"
          placeholder="原始文本"
          :rows="3"
          :disabled="true"
        />
      </el-form-item>
    </el-form>
  </el-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as pdfjsLib from "pdfjs-dist";

// PDF.js worker 配置
pdfjsLib.GlobalWorkerOptions.workerSrc = "/package/pdf.worker.min.js";

// 文档相关
const selectedFileName = ref("");
const pdfHtmlContent = ref("");
const isLoading = ref(false);
const pdfContent = ref<HTMLDivElement | null>(null);

// 搜索相关
const searchText = ref("");
const searchResults = ref<HTMLElement[]>([]);
const currentResultIndex = ref(-1);

// 节点模态框相关
const showNodeModal = ref(false);
const nodeForm = ref({
  name: "",
  type: "entity",
  description: "",
  originalText: "",
});

const emit = defineEmits(["addNode"]);

// 生成唯一ID
const generateId = () =>
  "node_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

// 处理节点模态框确认
const handleNodeModalOk = () => {
  if (!nodeForm.value.name.trim()) {
    return;
  }

  const nodeData = {
    id: generateId(),
    data: {
      name: nodeForm.value.name.trim(),
      type: nodeForm.value.type,
      description: nodeForm.value.description.trim(),
      originalText: nodeForm.value.originalText.trim(),
      createdAt: new Date().toISOString(),
    },
  };

  emit("addNode", nodeData);
  showNodeModal.value = false;
  resetNodeForm();
};

// 处理节点模态框取消
const handleNodeModalCancel = () => {
  showNodeModal.value = false;
  resetNodeForm();
};

// 重置节点表单
const resetNodeForm = () => {
  nodeForm.value = {
    name: "",
    type: "entity",
    description: "",
    originalText: "",
  };
};

// 分析字体样式
const analyzeFontStyle = (fontName: string, size: number) => {
  const style: any = {
    fontSize: `${size}px`,
    fontWeight: "normal",
    fontStyle: "normal",
    fontFamily: fontName || "inherit",
  };

  // 检测加粗
  if (fontName) {
    const lowerFontName = fontName.toLowerCase();
    if (
      lowerFontName.includes("bold") ||
      lowerFontName.includes("black") ||
      lowerFontName.includes("heavy")
    ) {
      style.fontWeight = "bold";
    }

    // 检测斜体
    if (lowerFontName.includes("italic") || lowerFontName.includes("oblique")) {
      style.fontStyle = "italic";
    }
  }

  // 根据字号判断文本类型
  if (size > 16) {
    style.type = "heading";
    style.fontWeight = "bold";
  } else if (size > 12) {
    style.type = "subheading";
    style.fontWeight = "600";
  } else {
    style.type = "normal";
  }

  return style;
};

// 解析PDF为HTML（带样式）
const parsePdfToHtml = async (file: File) => {
  isLoading.value = true;
  pdfHtmlContent.value = "";

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let htmlContent = '<div class="pdf-document">';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const textContent = await page.getTextContent();

      // 创建页面容器
      htmlContent += `<div class="pdf-page page-${pageNum}" style="width: ${viewport.width}px; height: ${viewport.height}px;">`;
      htmlContent += `<div class="page-header">第 ${pageNum} 页</div>`;
      htmlContent += '<div class="page-content">';

      // 按行组织文本
      const lines: any[] = [];

      textContent.items.forEach((item: any) => {
        const transform = item.transform;
        const x = transform[4];
        const y = transform[5];
        const fontSize = Math.sqrt(
          transform[0] * transform[0] + transform[1] * transform[1]
        );
        const fontStyle = analyzeFontStyle(item.fontName, fontSize);

        const textItem = {
          text: item.str,
          x: x,
          y: y,
          fontSize: fontSize,
          fontStyle: fontStyle,
          width: item.width,
          height: item.height,
        };

        // 找到对应的行
        let lineIndex = lines.findIndex(
          (line) => Math.abs(line.y - y) < 5 && Math.abs(line.x - x) < 200
        );

        if (lineIndex === -1) {
          lines.push({
            y: y,
            x: x,
            items: [textItem],
            style: fontStyle,
          });
        } else {
          lines[lineIndex].items.push(textItem);
        }
      });

      // 按Y坐标排序（从大到小，因为PDF坐标原点在左下角）
      lines.sort((a, b) => b.y - a.y);

      // 渲染每一行
      lines.forEach((line, lineIndex) => {
        // 按X坐标排序
        line.items.sort((a: any, b: any) => a.x - b.x);

        // 判断行类型
        let lineClass = "text-line";
        if (line.style.type === "heading") {
          lineClass += " heading-line";
        } else if (line.style.type === "subheading") {
          lineClass += " subheading-line";
        }

        htmlContent += `<div class="${lineClass}" style="position: absolute; top: ${
          viewport.height - line.y
        }px; left: ${line.x}px;">`;

        line.items.forEach((item: any, itemIndex: number) => {
          const style = `font-size: ${item.fontStyle.fontSize}; font-weight: ${item.fontStyle.fontWeight}; font-style: ${item.fontStyle.fontStyle}; font-family: ${item.fontStyle.fontFamily}`;

          htmlContent += `<span class="text-item" style="${style}" data-page="${pageNum}" data-line="${lineIndex}" data-item="${itemIndex}">${item.text}</span>`;
        });

        htmlContent += "</div>";
      });

      htmlContent += "</div></div>";
    }

    htmlContent += "</div>";
    pdfHtmlContent.value = htmlContent;

    await nextTick();
    setupTextSelection();
  } catch (error) {
    console.error("PDF解析失败:", error);
    pdfHtmlContent.value =
      '<div class="error-message">PDF解析失败，请尝试其他文件</div>';
  } finally {
    isLoading.value = false;
  }
};

// 处理文件上传
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      target.value = "";
      return;
    }

    selectedFileName.value = file.name;
    parsePdfToHtml(file);
  }
};

// 文本选择处理
const handleTextSelection = () => {
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();

  if (selectedText && selectedText.length > 2) {
    // 至少2个字符
    nodeForm.value.originalText = selectedText;
    nodeForm.value.name = selectedText.substring(0, 30);

    // 延迟显示模态框，避免干扰复制操作
    setTimeout(() => {
      showNodeModal.value = true;
    }, 300);
  }
};

// 设置文本选择监听
const setupTextSelection = () => {
  if (pdfContent.value) {
    pdfContent.value.addEventListener("mouseup", handleTextSelection);
  }
};

// 搜索功能
const handleSearch = () => {
  if (!searchText.value.trim()) {
    clearSearch();
    return;
  }

  const contentElement = pdfContent.value;
  if (!contentElement) return;

  // 清除之前的高亮
  clearHighlights();

  const searchTerm = searchText.value.toLowerCase();
  const textElements = contentElement.querySelectorAll(".text-item");
  const results: HTMLElement[] = [];

  textElements.forEach((element) => {
    const text = element.textContent?.toLowerCase() || "";
    if (text.includes(searchTerm)) {
      const html = element.innerHTML;
      const highlightedHtml = html.replace(
        new RegExp(searchText.value, "gi"),
        (match) => `<mark class="search-highlight">${match}</mark>`
      );
      element.innerHTML = highlightedHtml;
      results.push(element as HTMLElement);
    }
  });

  searchResults.value = results;
  currentResultIndex.value = results.length > 0 ? 0 : -1;

  if (results.length > 0) {
    scrollToResult(0);
  }
};

// 清除高亮
const clearHighlights = () => {
  const highlights = pdfContent.value?.querySelectorAll(".search-highlight");
  highlights?.forEach((highlight) => {
    const parent = highlight.parentNode;
    if (parent) {
      parent.replaceChild(
        document.createTextNode(highlight.textContent || ""),
        highlight
      );
      parent.normalize();
    }
  });
};

// 清除搜索
const clearSearch = () => {
  searchText.value = "";
  searchResults.value = [];
  currentResultIndex.value = -1;
  clearHighlights();
};

// 上一个结果
const prevResult = () => {
  if (searchResults.value.length === 0) return;

  currentResultIndex.value =
    currentResultIndex.value > 0
      ? currentResultIndex.value - 1
      : searchResults.value.length - 1;

  scrollToResult(currentResultIndex.value);
};

// 下一个结果
const nextResult = () => {
  if (searchResults.value.length === 0) return;

  currentResultIndex.value =
    currentResultIndex.value < searchResults.value.length - 1
      ? currentResultIndex.value + 1
      : 0;

  scrollToResult(currentResultIndex.value);
};

// 滚动到搜索结果
const scrollToResult = (index: number) => {
  if (searchResults.value[index]) {
    searchResults.value[index].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // 添加当前结果高亮
    searchResults.value.forEach((result, i) => {
      const parentLine = result.closest(".text-line");
      if (parentLine) {
        parentLine.classList.toggle("current-result", i === index);
      }
    });
  }
};

onUnmounted(() => {
  if (pdfContent.value) {
    pdfContent.value.removeEventListener("mouseup", handleTextSelection);
  }
});
</script>

<style scoped>
.document-panel {
  box-sizing: border-box;
}

.upload-section {
  box-sizing: border-box;
}

.upload-btn {
  display: inline-block;
  box-sizing: border-box;
  cursor: pointer;
}

.upload-btn:hover {
  background-color: #2563eb;
}

.file-info {
  line-height: 1.4;
}

.pdf-html-content {
  font-family: "SimSun", "NSimSun", "FangSong", "KaiTi", serif;
  line-height: 1.6;
  color: #333;
}

.loading-state {
  color: #666;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.search-highlight {
  background-color: #ffeb3b;
  padding: 2px 0;
}

.current-result .search-highlight {
  background-color: #ff9800;
  box-shadow: 0 0 0 2px #ff9800;
}
</style>

<style>
/* PDF 文档样式 */
.pdf-document {
  max-width: 100%;
  margin: 0 auto;
  background: white;
  position: relative;
}

.pdf-page {
  position: relative;
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.page-header {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  z-index: 10;
}

.page-content {
  position: relative;
  width: 100%;
  height: calc(100% - 40px);
}

/* 文本行样式 */
.text-line {
  position: absolute;
  white-space: nowrap;
  line-height: 1.2;
  margin: 0;
  padding: 0;
}

/* 标题行样式 */
.heading-line {
  font-weight: bold !important;
  color: #1a365d;
  margin-bottom: 8px !important;
}

.heading-line .text-item {
  font-weight: bold !important;
  font-size: 18px !important;
}

/* 子标题样式 */
.subheading-line {
  font-weight: 600 !important;
  color: #2d3748;
  margin-bottom: 6px !important;
}

.subheading-line .text-item {
  font-weight: 600 !important;
  font-size: 16px !important;
}

/* 普通文本样式 */
.text-line .text-item {
  display: inline;
  white-space: pre;
  word-break: keep-all;
  font-family: inherit;
}

.text-item::selection {
  background: rgba(0, 100, 255, 0.3);
}

/* 搜索高亮样式 */
.search-highlight {
  background-color: #ffeb3b;
  border-radius: 2px;
  padding: 1px 0;
}

.current-result .search-highlight {
  background-color: #ff9800;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.3);
}

/* 确保文本可选择 */
.pdf-html-content {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pdf-page {
    padding: 15px;
    margin-bottom: 20px;
  }

  .heading-line .text-item {
    font-size: 16px !important;
  }

  .subheading-line .text-item {
    font-size: 14px !important;
  }
}

/* 字体回退方案 */
.text-item {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

/* 加粗文本视觉增强 */
.text-item[style*="font-weight: bold"],
.text-item[style*="font-weight: 700"] {
  text-shadow: 0.5px 0 0 currentColor;
}

/* 斜体文本 */
.text-item[style*="font-style: italic"] {
  opacity: 0.9;
}
</style>
