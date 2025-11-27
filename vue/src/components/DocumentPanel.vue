<template>
  <div class="document-panel w-1/3 h-full border-r border-gray-200 bg-white flex flex-col">
    <!-- 文档上传区域 -->
    <div class="upload-section p-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold mb-2">文档上传</h3>
      <div class="upload-options mb-3 flex items-center gap-4">
        <label class="flex items-center gap-1 cursor-pointer">
          <input 
            type="radio" 
            v-model="contentMode" 
            value="frontend" 
            class="mr-1"
          />
          <span class="text-sm">前端直接解析</span>
        </label>
        <label class="flex items-center gap-1 cursor-pointer">
          <input 
            type="radio" 
            v-model="contentMode" 
            value="backend" 
            class="mr-1"
          />
          <span class="text-sm">后端API解析</span>
        </label>
      </div>
      <input
        type="file"
        id="document-upload"
        accept=".doc,.docx,.pdf,.wps"
        class="hidden"
        @change="handleFileUpload"
      />
      <label for="document-upload" class="upload-btn px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-colors">
        选择文档
      </label>
      <div class="file-info mt-2 text-sm text-gray-600" v-if="selectedFileName">
        已选择: {{ selectedFileName }}
      </div>
      <div class="loading-indicator mt-2 text-sm text-blue-500" v-if="isLoading">
        正在处理文档...
      </div>
    </div>
    
    <!-- 文档内容显示区域 -->
    <div class="document-content p-4 flex-1 overflow-auto">
      <h3 class="text-lg font-semibold mb-2">文档内容</h3>
      <div v-if="documentContent" class="content-display">
        {{ documentContent }}
      </div>
      <div v-else class="empty-state text-center text-gray-400 py-8">
        请上传文档查看内容
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { uploadDocument } from '@/services/graphApi';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// 文档上传相关
const selectedFileName = ref('');
const documentContent = ref('');
const contentMode = ref('frontend'); // 'frontend' 或 'backend'
const isLoading = ref(false);

// 处理文件上传
const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (file) {
    selectedFileName.value = file.name;
    isLoading.value = true;
    
    try {
      if (contentMode.value === 'frontend') {
        // 前端直接解析
        await parseFileFrontend(file);
      } else {
        // 后端API调用
        await parseFileBackend(file);
      }
    } catch (error) {
      Message.error(`处理文档失败: ${error.message}`);
      documentContent.value = `处理文档失败: ${error.message}`;
    } finally {
      isLoading.value = false;
    }
  }
};

// 前端直接解析文件
const parseFileFrontend = async (file) => {
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  try {
    switch (fileExtension) {
      case 'pdf':
        documentContent.value = await parsePdfFrontend(file);
        break;
      case 'doc':
      case 'docx':
        documentContent.value = await parseDocFrontend(file);
        break;
      case 'wps':
        documentContent.value = await parseWpsFrontend(file);
        break;
      default:
        documentContent.value = `不支持的文件类型: ${fileExtension}\n\n文件信息:\n文件名: ${file.name}\n文件大小: ${(file.size / 1024).toFixed(2)} KB\n文件类型: ${file.type || '未知'}`;
    }
  } catch (error) {
    documentContent.value = `前端解析失败: ${error.message}\n\n文件信息:\n文件名: ${file.name}\n文件大小: ${(file.size / 1024).toFixed(2)} KB\n文件类型: ${file.type || '未知'}`;
  }
};

// 前端解析PDF
const parsePdfFrontend = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      text += `第 ${i} 页:\n${pageText}\n\n`;
    }
    
    return text || `PDF文件内容（共 ${pdf.numPages} 页）`;
  } catch (error) {
    return `PDF文件解析失败: ${error.message}\n\n文件名: ${file.name}\n文件大小: ${(file.size / 1024).toFixed(2)} KB`;
  }
};

// 前端解析DOC/DOCX
const parseDocFrontend = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '文档内容为空';
  } catch (error) {
    return `Word文件解析失败: ${error.message}\n\n文件名: ${file.name}\n文件大小: ${(file.size / 1024).toFixed(2)} KB`;
  }
};

// 前端解析WPS
const parseWpsFrontend = async (file) => {
  // WPS文件在前端解析比较复杂，通常需要转换格式
  return `WPS文件预览:\n\n文件名: ${file.name}\n文件大小: ${(file.size / 1024).toFixed(2)} KB\n\n提示: WPS文件在前端直接解析较为复杂，建议使用后端API解析或转换为其他格式。`;
};

// 后端API调用解析文件
const parseFileBackend = async (file) => {
  try {
    const result = await uploadDocument(file);
    if (result && result.content) {
      documentContent.value = result.content;
    } else {
      documentContent.value = `后端返回数据格式异常:\n${JSON.stringify(result, null, 2)}`;
    }
  } catch (error) {
    throw new Error(`后端API调用失败: ${error.message}`);
  }
};
</script>

<style scoped>
.document-panel {
  width: 33.333%;
  height: 100%;
  border-right: 1px solid #e4e7ed;
  background-color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.upload-section {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fafafa;
}

.upload-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.upload-btn {
  display: inline-block;
  padding: 8px 16px;
  background-color: #165dff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.upload-btn:hover {
  background-color: #4080ff;
}

.file-info {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  background-color: #f0f2f5;
  padding: 6px 12px;
  border-radius: 4px;
  display: inline-block;
}

.document-content {
  padding: 16px;
  flex: 1;
  overflow: auto;
}

.document-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.content-display {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  background-color: #fafafa;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  max-height: 100%;
  overflow: auto;
}

.empty-state {
  text-align: center;
  color: #909399;
  padding: 40px 20px;
  font-size: 14px;
}
</style>