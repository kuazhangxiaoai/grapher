<template>
  <div class="card-list-container">
    <div class="header">
      <h1>{{ title }}</h1>
      <div class="header-right">
          <div class="user-info">
            <span class="username">欢迎, {{ userStore.user?.username || '用户' }}</span>
            <a-button type="text" @click="handleLogout" class="logout-button">
              退出
            </a-button>
          </div>
          <a-button 
            type="primary" 
            @click="handleAddClick" 
            class="add-button"
            :disabled="items.length >= 20"
          >
            <template #icon>
              <icon-plus />
            </template>
            {{ addButtonText || '新增项目' }}
          </a-button>
          <div v-if="items.length >= 20" class="limit-hint">最多只能创建20个项目</div>
        </div>
    </div>

    <div class="card-list">
      <a-card
        v-for="item in items"
        :key="item.id"
        class="item-card"
      >
        <div class="card-content">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="item-description" v-if="item.descript">{{ item.descript }}</p>
          <p class="item-description empty" v-else>无描述</p>
          <div class="meta-info">
            <span class="create-time">创建时间: {{ formatDate(item.createTime) }}</span>
          </div>
          <div class="card-actions">
            <a-button type="primary" @click="handleNavigateToEdit(item)">
              编辑
            </a-button>
            <a-button @click="handleEdit(item)">
              修改
            </a-button>
            <a-button danger @click="handleDelete(item.id, item.name)">
              删除
            </a-button>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:visible="showModal"
      :title="isEditMode ? '编辑项目' : '新增项目'"
      @ok="handleSubmit"
      @cancel="resetForm"
    >
      <a-form layout="vertical" :model="formData">
        <a-form-item label="项目名称" required>
          <a-input v-model="formData.name" placeholder="请输入项目名称" />
        </a-form-item>
        <a-form-item label="项目描述">
          <a-textarea 
            v-model="formData.description" 
            placeholder="请输入项目描述" 
            :rows="3" 
          />
        </a-form-item>
        <a-form-item label="创建时间">
          <a-date-picker
            v-model="formData.createTime"
            format="YYYY-MM-DD HH:mm:ss"
            show-time
            placeholder="请选择创建时间"
          />
        </a-form-item>
        <a-form-item label="图数据库名称">
          <a-select
              v-model="formData.graph_db"
              placeholder="请选择图数据库名称"
              :options="availableGraphDB"></a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {ref, defineProps, defineEmits, onMounted} from 'vue';
import { useRouter } from 'vue-router';
import { Message, Modal } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
import { useUserStore } from '@/stores/user';
import axios from "axios";

const router = useRouter();
// 定义组件属性
const props = defineProps<{
  title?: string;
  items: Array<{
    id: string | number;
    name: string;
    descript?: string;
    createTime: string | Date;
  }>;
  addButtonText?: string;
}>();



// 初始化用户信息
const userStore = useUserStore();
userStore.initUser();

// 定义事件
const emit = defineEmits<{
  (e: 'add', item: any): void;
  (e: 'edit', item: any): void;
  (e: 'navigateToEdit', item: any): void;
  (e: 'delete', id: string | number): void;
}>();

// 弹窗状态
const showModal = ref(false);
const isEditMode = ref(false);
const availableGraphDB = ref([] as string[]);

// 表单数据
const formData = ref({
  id: '',
  name: '',
  description: '',
  createTime: new Date(),
  graph_db: ''
});

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString();
};

// 跳转到编辑页面
const handleNavigateToEdit = (item: any) => {
  emit('navigateToEdit', item);
};

// 处理用户退出
const handleLogout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '确定要退出登录吗？',
    type: 'warning',
    onOk: () => {
      userStore.logout();
      Message.success('退出登录成功');
      // 跳转到登录页
      router.push('/auth');
    }
  });
};

// 打开修改弹窗
const handleEdit = (item: any) => {
  isEditMode.value = true;
  formData.value = { 
    ...item, 
    createTime: new Date(item.createTime),
    description: item.description || ''
  };
  showModal.value = true;
};

// 处理删除
const handleDelete = (id: string | number, name: string) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除项目 "${name}" 吗？`,
    type: 'warning',
    onOk: () => {
      emit('delete', id);
      const project = useUserStore().getProjectByName(name)
      const username = JSON.parse(localStorage.getItem('grapher-user')).username;
      useUserStore().deleteProject(project, username)
      Message.success('项目删除成功');
    }
  });
};

// 处理提交
const handleSubmit = () => {
  if (!formData.value.name.trim()) {
    Message.error('请输入项目名称');
    return;
  }

  // 检查项目数量限制
  if (!isEditMode.value && props.items.length >= 20) {
    Message.error('最多只能创建20个项目');
    return;
  }

  const item = {
    ...formData.value,
    createTime: formData.value.createTime.toISOString()
  };

  if (isEditMode.value) {
    emit('edit', item);
    Message.success('项目编辑成功');
  } else {
    emit('add', item);
    const username = JSON.parse(localStorage.getItem('grapher-user')).username;
    const project_info = {
      id: formData.value.name,
      name: formData.value.name,
      descript: formData.value.description,
      graph_db: formData.value.graph_db,
      create_time: formData.value.createTime.toISOString()
    } as Project
    userStore.createProject(project_info, username.toString())
    //axios.post("/api/user/createProject", {
    //  project_name: project_name,
    //  graph_db: graph_db,
    //  username: username
    //}).then(res => {
    //  Message.success('项目创建成功');
    //})

  }

  resetForm();
};

// 处理添加项目点击
const handleAddClick = () => {
  if (props.items.length < 20) {
    showModal.value = true;
  }
};

// 重置表单
const resetForm = () => {
  showModal.value = false;
  formData.value = {
    id: '',
    name: '',
    description: '',
    createTime: new Date(),
    graph_db: ''
  };
  isEditMode.value = false;
};

onMounted(()=>{
  axios.get('/api/user/getAvailGraphDB').then(res => {
    availableGraphDB.value = res.data;
  })
})

</script>

<style scoped>
.card-list-container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f0f5ff;
  border-radius: 20px;
  font-size: 14px;
  color: #1890ff;
  box-shadow: 0 1px 3px rgba(24, 144, 255, 0.2);
}

.username {
  font-weight: 500;
}

.logout-button {
  font-size: 13px;
  padding: 4px 12px;
  color: #ff4d4f;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  transform: translateY(-1px);
}

.add-button {
  font-weight: 500;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.add-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.limit-hint {
  margin-left: 12px;
  font-size: 12px;
  color: #ff4d4f;
  line-height: 32px;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.item-card {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  background: white;
}

.item-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
  border-color: #1890ff;
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.item-name {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.item-description {
  margin: 0 0 18px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-description.empty {
  color: #999;
  font-style: italic;
}

.meta-info {
  margin-bottom: 20px;
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
}

.create-time {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.card-actions a-button {
  border-radius: 6px;
  font-size: 13px;
  padding: 6px 16px;
  transition: all 0.3s ease;
}

.card-actions a-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>