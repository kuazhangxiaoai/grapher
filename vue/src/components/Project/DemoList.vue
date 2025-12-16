<template>
  <div class="demo-list-page">
    <card-list
      title="项目列表"
      :items="projectList"
      add-button-text="新增项目"
      @add="handleAdd"
      @edit="handleEdit"
      @navigate-to-edit="handleNavigateToEdit"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CardList from './CardList.vue';

const router = useRouter();

// 项目列表数据
const projectList = ref([
  {
    id: '1',
    name: '项目1',
    description: '这是第一个项目',
    createTime: new Date().toISOString()
  },
  {
    id: '2',
    name: '项目2',
    description: '这是第二个项目，用于测试',
    createTime: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    name: '项目3',
    createTime: new Date(Date.now() - 172800000).toISOString()
  }
]);

// 生成唯一ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// 新增项目
const handleAdd = (newItem: any) => {
  const item = {
    ...newItem,
    id: generateId()
  };
  projectList.value.push(item);
  // 新增成功后跳转到Home页面
  router.push('/');
};

// 编辑项目
const handleEdit = (updatedItem: any) => {
  const index = projectList.value.findIndex(item => item.id === updatedItem.id);
  if (index !== -1) {
    projectList.value[index] = updatedItem;
    // 修改成功后留在当前页面，不跳转
  }
};

// 删除项目
const handleDelete = (id: string | number) => {
  projectList.value = projectList.value.filter(item => item.id !== id);
};

// 跳转到编辑页面
const handleNavigateToEdit = (item: any) => {
  // 跳转到Home页面
  router.push('/');
};
</script>

<style scoped>
.demo-list-page {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>