<template>
  <div class="summary-container h-screen flex overflow-hidden">
    <!-- 左侧分组和文章列表 -->
    <div class="left-panel w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-4">分组管理</h2>
        <!-- 分组和文章列表组件 -->
        <ArticleList 
          :articles="articles" 
          @select-article="selectArticle"
          @select-directory="selectDirectory"
          @add-directory="handleAddDirectory"
          @delete-directory="handleDeleteDirectory"
        />
      </div>
    </div>
    
    <!-- 右侧编辑区域 -->
    <div class="right-panel w-2/3 flex flex-col bg-gray-50">
      <div class="flex-1 p-6 overflow-y-auto">
        <!-- 富文本编辑框组件 -->
        <RichEditor 
          v-model="currentContent" 
          :disabled="!selectedArticle"
        />
      </div>
      
      <!-- 底部按钮区域 -->
      <div class="border-t border-gray-200 bg-white p-4 flex justify-end space-x-3">
        <a-button @click="handleBack">返回</a-button>
        <a-button type="primary" @click="handleSave">保存</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ArticleList from './components/ArticleList.vue';
import RichEditor from './components/RichEditor.vue';

// 模拟文章数据
const articles = ref([
  {
    id: '1',
    title: '产品概述',
    group: '基础信息',
    content: '<h1>产品概述</h1><p>这是产品的基本介绍...</p>'
  },
  {
    id: '2',
    title: '核心功能',
    group: '基础信息',
    content: '<h1>核心功能</h1><p>产品的核心功能包括...</p>'
  },
  {
    id: '3',
    title: '技术架构',
    group: '技术文档',
    content: '<h1>技术架构</h1><p>系统采用的技术架构...</p>'
  },
  {
    id: '4',
    title: 'API接口',
    group: '技术文档',
    content: '<h1>API接口</h1><p>系统提供的API接口...</p>'
  }
  ,
  {
    id: '5',
    title: '技术架构',
    group: '技术文档',
    content: '<h1>技术架构</h1><p>系统采用的技术架构...</p>'
  },
  {
    id: '6',
    title: 'API接口',
    group: '技术文档',
    content: '<h1>API接口</h1><p>系统提供的API接口...</p>'
  },
]);

const selectedArticle = ref(null);
const currentContent = ref('');

// 选择文章
const selectArticle = (articleId: string) => {
  selectedArticle.value = articleId;
  const article = articles.value.find(a => a.id === articleId);
  if (article) {
    currentContent.value = article.content;
  } else {
    currentContent.value = '';
  }
};

// 选择目录
const selectDirectory = (directoryId: string) => {
  selectedArticle.value = null;
  // 这里可以根据目录ID生成或获取对应的目录内容
  // 暂时显示目录信息作为示例
  currentContent.value = `<h1>目录内容</h1><p>您选择了目录: ${directoryId}</p>`;
};

// 保存文章
const handleSave = () => {
  if (selectedArticle.value) {
    const articleIndex = articles.value.findIndex(a => a.id === selectedArticle.value);
    if (articleIndex !== -1) {
      articles.value[articleIndex].content = currentContent.value;
      console.log('保存成功:', articles.value[articleIndex]);
    }
  }
};

// 返回
const handleBack = () => {
  console.log('返回');
};

// 新建分组
const handleAddDirectory = (directoryName: string) => {
  console.log('新建分组:', directoryName);
  // 这里可以添加分组到数据源
};

// 删除分组
const handleDeleteDirectory = (directoryId: string) => {
  console.log('删除分组:', directoryId);
  // 这里可以从数据源删除分组
};
</script>

<style scoped>
.summary-container {
  height: 100vh;
}

.left-panel {
  min-width: 300px;
}
</style>