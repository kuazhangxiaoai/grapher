<template>
  <div class="article-list">
    <!-- 按组分组显示 -->
    <div 
      v-for="group in groupedArticles" 
      :key="group.name"
      class="mb-4"
    >
      <div class="font-medium text-gray-700 mb-2 px-2">
        {{ group.name }}
      </div>
      <div class="space-y-1">
        <div
          v-for="article in group.articles"
          :key="article.id"
          class="px-2 py-2 rounded cursor-pointer transition-colors"
          :class="{
            'bg-blue-50 text-blue-600': selectedArticleId === article.id,
            'hover:bg-gray-100': selectedArticleId !== article.id
          }"
          @click="selectArticle(article.id)"
        >
          {{ article.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue';

interface Article {
  id: string;
  title: string;
  group: string;
  content: string;
}

const props = defineProps<{
  articles: Article[];
}>();

const emit = defineEmits<{
  (e: 'select-article', articleId: string): void;
}>();

const selectedArticleId = ref<string | null>(null);

// 按组分组文章
const groupedArticles = computed(() => {
  const groups: Record<string, Article[]> = {};
  
  props.articles.forEach(article => {
    if (!groups[article.group]) {
      groups[article.group] = [];
    }
    groups[article.group].push(article);
  });
  
  return Object.entries(groups).map(([name, articles]) => ({
    name,
    articles
  }));
});

// 选择文章
const selectArticle = (articleId: string) => {
  selectedArticleId.value = articleId;
  emit('select-article', articleId);
};
</script>

<style scoped>
.article-list {
  font-size: 14px;
}
</style>