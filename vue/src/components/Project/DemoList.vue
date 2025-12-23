<template>
  <div class="demo-list-page">
    <card-list
      title="项目列表"
      :items="projects"
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
import {useUserStore} from "@/stores/user.ts";
import {useEditStore} from "@/stores/edit.ts";
import {storeToRefs} from "pinia";
const router = useRouter();
const userStore = useUserStore();
const editStore = useEditStore();
// 项目列表数据
const {projects} = storeToRefs(userStore);

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
  const username = JSON.parse(localStorage.getItem('grapher-user')).username;
  //projectList.value = userStore.createProject(item, username);

  // 新增成功后跳转到Home页面
  //router.push('/');
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
const handleDelete = (name: string | number) => {
  //projectList.value = projectList.value.filter(item => item.id !== id);
  //userStore.deleteProject(id);
};

// 跳转到编辑页面
const handleNavigateToEdit = (item: any) => {
  // 跳转到Home页面
  const project_name = item.name;
  // 重置editStore状态，确保每次进入画布页面都显示当前项目的初始状态
  editStore.resetState();
  editStore.setProjectName(project_name);
  localStorage.setItem('grapher-project', project_name)
  router.push('/');
};

onMounted(() => {
  const username = JSON.parse(localStorage.getItem('grapher-user')).username;
  userStore.getProjectList(username)
})

</script>

<style scoped>
.demo-list-page {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>