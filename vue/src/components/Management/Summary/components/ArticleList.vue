<template>
  <div class="article-list">
    <!-- 顶部操作栏 -->
    <div class="flex justify-between items-center mb-4 px-2">
      <h3 class="font-medium text-gray-700">分组与文章</h3>
      <a-button type="primary" size="small" @click="showAddModal = true">新建分组</a-button>
    </div>
    
    <!-- 分组和文章列表 -->
    <div class="space-y-2 h-[85vh] overflow-y-auto">
      <!-- 分组项 -->
      <div 
        v-for="directory in directories" 
        :key="directory.id"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden"
        @drop="handleDrop(directory.id, $event)"
        @dragover.prevent
        @dragenter.prevent
      >
        <div class="flex items-center justify-between p-3">
          <div class="flex items-center space-x-2 cursor-pointer select-none" @click="toggleDirectory(directory.id)">
            <IconFolder class="text-blue-500" />
            <span class="font-medium">{{ directory.name }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <a-button 
              size="small" 
              type="text" 
              class="w-8 h-8 p-0 flex items-center justify-center"
              @click="toggleDirectory(directory.id)"
              :tooltip="directory.expanded ? '收起' : '展开'"
            >
               <template v-if="!directory.expanded" #icon><IconCaretRight /></template>
               <template v-else #icon><IconCaretDown /></template>
            </a-button>
            <a-button 
              size="small" 
              @click="handleDeleteClick(directory.id)"
            >
              <template #icon><IconDelete /></template>
            </a-button>
          </div>
        </div>
        
        <!-- 分组内文章列表 -->
        <div 
          v-if="directory.expanded"
          class="pl-8 pr-3 pb-3 space-y-2"
        >
          <div 
            v-for="articleId in directory.articles" 
            :key="articleId"
            class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors"
            :class="{
              'bg-blue-50 text-blue-600 border border-blue-200': selectedArticleId === articleId,
              'hover:bg-gray-100 border border-transparent': selectedArticleId !== articleId
            }"
            @click="selectArticle(articleId)"
          >
            <div class="flex items-center space-x-2">
              <IconFile class="text-gray-400" />
              <span>{{ getArticleTitle(articleId) }}</span>
            </div>
            <div class="flex space-x-2">
              <a-button 
                size="small" 
                @click.stop="removeArticleFromDirectory(directory.id, articleId)"
              >
                <template #icon><IconClose /></template>
              </a-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 一级文章项 -->
      <div 
        v-for="article in rootArticles" 
        :key="article.id"
        class="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors"
        :class="{
          'bg-blue-50 text-blue-600 border border-blue-200': selectedArticleId === article.id,
          'hover:bg-gray-100 border border-transparent': selectedArticleId !== article.id
        }"
        @click="selectArticle(article.id)"
        draggable="true"
        @dragstart="handleDragStart(article.id, $event)"
      >
        <div class="flex items-center space-x-2">
              <IconFile class="text-gray-400" />
              <span>{{ article.title }}</span>
            </div>
      </div>
    </div>
    
    <!-- 新建分组弹框 -->
    <a-modal
      v-model:visible="showAddModal"
      title="新建分组"
      @ok="handleAddDirectoryConfirm"
      @cancel="showAddModal = false"
    >
      <div class="p-2">
        <a-form layout="vertical">
          <a-form-item label="分组名称">
            <a-input v-model:value="newDirectoryName" placeholder="请输入分组名称" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
    
    <!-- 删除分组弹框 -->
    <a-modal
      v-model:visible="showDeleteModal"
      title="删除分组"
      type="warning"
      @ok="handleDeleteDirectoryConfirm"
      @cancel="showDeleteModal = false"
    >
      <div class="p-2">
        <p>确定要删除这个分组吗？</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang='ts'>
import { ref, computed } from 'vue';
import { IconFolder, IconFile, IconDelete, IconClose, IconCaretRight, IconCaretDown, IconCaretUp } from '@arco-design/web-vue/es/icon';
import { Modal, Form, Input } from '@arco-design/web-vue';

interface Article {
  id: string;
  title: string;
  group: string;
  content: string;
}

interface Directory {
  id: string;
  name: string;
  expanded: boolean;
  articles: string[];
}

const props = defineProps<{
  articles: Article[];
}>();

const emit = defineEmits<{
  (e: 'select-article', articleId: string): void;
  (e: 'add-directory', directoryName: string): void;
  (e: 'delete-directory', directoryId: string): void;
}>();

const selectedArticleId = ref<string | null>(null);
const draggedArticleId = ref<string | null>(null);

// 分组列表
const directories = ref<Directory[]>([
  {
    id: 'dir1',
    name: '基础信息',
    expanded: false,
    articles: []
  },
  {
    id: 'dir2', 
    name: '技术文档',
    expanded: false,
    articles: []
  }
]);

// 新建分组相关状态
const showAddModal = ref(false);
const newDirectoryName = ref('');

// 删除分组相关状态
const showDeleteModal = ref(false);
const directoryToDelete = ref<string>('');

// 计算根级文章（不在任何分组中的文章）
const rootArticles = computed(() => {
  const articleIdsInDirectories = directories.value.flatMap(dir => dir.articles);
  return props.articles.filter(article => !articleIdsInDirectories.includes(article.id));
});

// 选择文章
const selectArticle = (articleId: string) => {
  selectedArticleId.value = articleId;
  emit('select-article', articleId);
};

// 切换分组展开/收起状态
const toggleDirectory = (directoryId: string) => {
  const directory = directories.value.find(dir => dir.id === directoryId);
  if (directory) {
    directory.expanded = !directory.expanded;
  }
};

// 打开删除弹框
const handleDeleteClick = (directoryId: string) => {
  directoryToDelete.value = directoryId;
  showDeleteModal.value = true;
};

// 新建分组确认
const handleAddDirectoryConfirm = () => {
  if (newDirectoryName.value && newDirectoryName.value.trim()) {
    const directoryName = newDirectoryName.value.trim();
    const newDirectory: Directory = {
      id: `dir${Date.now()}`,
      name: directoryName,
      expanded: false,
      articles: []
    };
    directories.value.push(newDirectory);
    emit('add-directory', directoryName);
    // 重置表单
    newDirectoryName.value = '';
    showAddModal.value = false;
  }
};

// 删除分组确认
const handleDeleteDirectoryConfirm = () => {
  if (directoryToDelete.value) {
    const index = directories.value.findIndex(dir => dir.id === directoryToDelete.value);
    if (index !== -1) {
      directories.value.splice(index, 1);
      emit('delete-directory', directoryToDelete.value);
    }
    showDeleteModal.value = false;
  }
};

// 处理拖拽开始
const handleDragStart = (articleId: string, event: DragEvent) => {
  draggedArticleId.value = articleId;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
};

// 处理拖拽放置
const handleDrop = (directoryId: string, event: DragEvent) => {
  event.preventDefault();
  if (draggedArticleId.value) {
    const directory = directories.value.find(dir => dir.id === directoryId);
    if (directory && !directory.articles.includes(draggedArticleId.value)) {
      directory.articles.push(draggedArticleId.value);
      // 确保分组展开
      directory.expanded = true;
    }
    draggedArticleId.value = null;
  }
};

// 从分组中移除文章
const removeArticleFromDirectory = (directoryId: string, articleId: string) => {
  const directory = directories.value.find(dir => dir.id === directoryId);
  if (directory) {
    const index = directory.articles.indexOf(articleId);
    if (index !== -1) {
      directory.articles.splice(index, 1);
    }
  }
};

// 根据文章ID获取标题
const getArticleTitle = (articleId: string) => {
  const article = props.articles.find(art => art.id === articleId);
  return article ? article.title : '';
};
</script>

<style scoped>
.article-list {
  font-size: 14px;
}

/* 分组项样式 */
.article-list > div {
  transition: all 0.2s ease;
}

.article-list > div:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 文章项样式 */
.article-list > div > div:not(:first-child) {
  transition: all 0.2s ease;
}

/* 选中状态样式 */
.article-list > div > div.bg-blue-50,
.article-list > div > div > div.bg-blue-50 {
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
}

/* 拖拽目标样式 */
.article-list > div > div:nth-child(2):hover {
  background-color: rgba(59, 130, 246, 0.05);
}
</style>