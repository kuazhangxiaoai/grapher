<template>
  <div
    class="document-panel w-2/5 h-full border-r border-gray-200 bg-white flex flex-col"
  >
    <!-- 文档上传区域 -->
    <div class="upload-section p-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold mb-2">PDF文档上传</h3>
      <div class="upload-container">
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
    
        <div class="file-list-button" @click="handleFileList">
          文件列表
        </div>
        <div class="last-page-button" @click="lastPDFPage">上一页</div>
        <div class="next-page-button" @click="nextPDFPage">下一页</div>
        <div class="jump-page-button" @click="jumpPDFPage">跳页至</div>
        <div class="edit-button" @click="handleCopyToOpenModal">自由编辑</div>
      </div>
    </div>

    <!-- 文档内容显示区域 -->
    <div class="document-content flex-1 overflow-hidden">
      <!-- PDF预览区域（vue-office-pdf） -->
      <div
          id="pdfPreviewer"
          v-if="pdfPreviewUrl"
          ref="pdfContainer"
          class="content-display h-full flex flex-col"
      >
        <PdfViewer 
          :pdfUrl="pdfPreviewUrl" 
          style="width: 100%; height: 600px;" 
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state text-center text-gray-400 py-12">
        <div class="mb-4 text-gray-300 text-4xl">📄</div>
        <p class="mb-2">请上传PDF文档查看内容</p>
        <p class="text-sm">支持 .pdf 格式（框选文字后按Ctrl+C触发添加节点）</p>
      </div>
    </div>
  </div>
  <!--上传文件信息模态框-->
  <a-modal
    v-model:visible="showFileModel"
    title="上传文档"
    @ok="hanleFileUploadOk"
    @cancel="hanleFileUploadCancel"
    width="500px"
  >
    <a-form layout="vertical" :model="FileUploadForm">
        <a-form-item label="文章标题:">
          <a-input v-model="FileUploadForm.title" placeholder="请输入文章标题"></a-input>
        </a-form-item>
        <a-form-item label="发表时间:">
          <a-date-picker v-model="FileUploadForm.publishTime" style="width: 100%;"></a-date-picker>
        </a-form-item>
      </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { watch } from "vue";
import PdfViewer from "./PdfViewer.vue";
import { useEditStore } from "@/stores/edit.ts";
import { usePdfUpload } from "@/hooks/usePdfUpload.ts";
import { usePdfNavigation } from "@/hooks/usePdfNavigation.ts";
import { useTextSelection } from "@/hooks/useTextSelection.ts";

// 定义emit事件
const emit = defineEmits(["addNode"]);

// 获取store状态
const { pdfPreviewUrl } = storeToRefs(useEditStore());

// 使用hooks
const {
  selectedFileName,
  showFileModel,
  FileUploadForm,
  handleFileUpload,
  hanleFileUploadOk,
  hanleFileUploadCancel
} = usePdfUpload();

const {
  lastPDFPage,
  nextPDFPage,
  jumpPDFPage,
  handleFileList
} = usePdfNavigation();

const {
  pdfContainer,
  showNodeModal,
  nodeForm,
  handleCopyToOpenModal,
  handleNodeModalOk: handleNodeModalOkHook,
  handleNodeModalCancel,
  resetNodeForm
} = useTextSelection();


// 处理节点模态框确认
const handleNodeModalOk = () => {
  const nodeData = handleNodeModalOkHook();
  if (nodeData) {
    emit("addNode", nodeData);
  }
};

// 监听PDF URL变化
watch(pdfPreviewUrl, (newVal) => {
  if (newVal) resetNodeForm();
});
</script>

<style scoped>
@import url("./assets/documentPanel.css");
</style>
