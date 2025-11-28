<template>
  <div
    class="document-panel w-2/5 h-full border-r border-gray-200 bg-white flex flex-col"
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
        <span class="ml-2 text-xs text-gray-500"
          >(提示：框选PDF文字后按 Ctrl+C 复制，自动弹出节点添加窗口)</span
        >
      </div>
    </div>

    <!-- 文档内容显示区域 -->
    <div class="document-content flex-1 overflow-hidden">
      <!-- PDF预览区域（vue-office-pdf） -->
      <div
        v-if="pdfPreviewUrl"
        ref="pdfContainer"
        class="content-display h-full flex flex-col"
      >
        <PdfViewer :pdfUrl="pdfPreviewUrl" style="width: 100%; height: 600px" />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state text-center text-gray-400 py-12">
        <div class="mb-4 text-gray-300 text-4xl">📄</div>
        <p class="mb-2">请上传PDF文档查看内容</p>
        <p class="text-sm">支持 .pdf 格式（框选文字后按Ctrl+C触发添加节点）</p>
      </div>
    </div>
  </div>

  <!-- 节点信息设置模态框 -->
  <a-modal
    v-model:visible="showNodeModal"
    title="设置节点信息"
    @ok="handleNodeModalOk"
    @cancel="handleNodeModalCancel"
    width="500px"
  >
    <a-form layout="vertical">
      <a-form-item label="节点名称">
        <a-input v-model="nodeForm.name" placeholder="请输入节点名称" />
      </a-form-item>
      <a-form-item label="节点类型">
        <a-select v-model="nodeForm.type" placeholder="请选择节点类型">
          <a-option value="entity">实体</a-option>
          <a-option value="concept">概念</a-option>
          <a-option value="event">事件</a-option>
          <a-option value="attribute">属性</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="节点描述">
        <a-textarea
          v-model="nodeForm.description"
          placeholder="请输入节点描述"
          :rows="4"
        />
      </a-form-item>
      <a-form-item label="原始文本">
        <a-textarea
          v-model="nodeForm.originalText"
          placeholder="原始文本"
          :rows="3"
          :disabled="true"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Message } from "@arco-design/web-vue";
import PdfViewer from "./PdfViewer.vue";
// 文档上传相关
const selectedFileName = ref("");
const pdfPreviewUrl = ref("");
const currentFile = ref<File | null>(null);
const pdfContainer = ref<HTMLDivElement | null>(null);
let textSelectionHandler: (e: MouseEvent) => void;

// 节点模态框相关
const showNodeModal = ref(false);
const nodeForm = ref({
  name: "",
  type: "entity",
  description: "",
  originalText: "",
});

// 定义emit事件
const emit = defineEmits(["addNode"]);

// 生成唯一ID
const generateId = () =>
  "node_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

// 处理节点模态框确认
const handleNodeModalOk = () => {
  if (!nodeForm.value.name.trim()) {
    Message.warning("请输入节点名称");
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
  Message.success("节点已添加到图谱");
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

// 处理文件上传
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      Message.error("请上传PDF格式的文件");
      target.value = "";
      return;
    }

    selectedFileName.value = file.name;
    currentFile.value = file;

    try {
      if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value);
      pdfPreviewUrl.value = URL.createObjectURL(file);
    } catch (error) {
      console.error("生成PDF预览URL失败:", error);
      Message.error("文件解析失败，请尝试重新上传");
    }
  }
};

// 读取剪贴板文本
const readClipboardText = async () => {
  try {
    const text = await navigator.clipboard.readText();
    return text.trim();
  } catch (error) {
    console.error("读取剪贴板失败:", error);
    Message.warning("读取剪贴板失败，请手动复制后重试");
    return "";
  }
};

// 复制文字后自动弹窗
const handleCopyToOpenModal = async (e: ClipboardEvent) => {
  if (!pdfContainer.value) return;

  const selection: any = window.getSelection();
  const selectedText = selection?.toString().trim() || "";
  if (!selectedText) return;

  const range = selection.getRangeAt(0);
  if (!pdfContainer.value.contains(range.commonAncestorContainer)) return;

  setTimeout(async () => {
    const text = await readClipboardText();
    console.log(text);
    if (text) {
      nodeForm.value.originalText = text;
      nodeForm.value.name = text.substring(0, 20);
      showNodeModal.value = true;
    }
  }, 120);
};

// 监听PDF文本选择（可选）
const setupTextSelectionListener = () => {
  if (!pdfContainer.value) return;

  if (textSelectionHandler)
    document.removeEventListener("mouseup", textSelectionHandler);

  textSelectionHandler = (e: MouseEvent) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || "";
    if (selectedText) nodeForm.value.originalText = selectedText;
  };

  document.addEventListener("mouseup", textSelectionHandler);
};

// PDF渲染完成回调
const handlePdfRendered = () => {
  Message.success("PDF加载完成，框选文字后按Ctrl+C即可添加节点");
  setupTextSelectionListener();
}; // 主页面向 iframe 发送“获取选中文字”指令

// 监听 iframe 返回的选中文字并复制
window.addEventListener("message", (e) => {
  if (e.data.type === "SELECTED_TEXT") {
    const text = e.data.content;
    if (text) {
      // 调用剪贴板 API 复制
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert("复制成功：" + text);
        })
        .catch((err) => {
          console.error("复制失败：", err);
        });
    }
  }
});
// 生命周期
onMounted(() => {
  document.addEventListener("copy", handleCopyToOpenModal);
});

onUnmounted(() => {
  document.removeEventListener("copy", handleCopyToOpenModal);
  if (textSelectionHandler)
    document.removeEventListener("mouseup", textSelectionHandler);
  if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value);
  currentFile.value = null;
});

// 监听PDF URL变化
watch(pdfPreviewUrl, (newVal) => {
  if (newVal) resetNodeForm();
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
.tip {
  margin-top: 4px;
  color: #9ca3af;
}
.content-display {
  width: 100%;
  height: 100%;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.empty-state p {
  margin: 0;
  line-height: 1.5;
}
.transition-colors {
  transition: background-color 0.2s ease;
}
</style>
