<template>
  <div class="graph-list-container">
    <div class="header">
      <h1>图谱列表</h1>
      <a-button type="primary" @click="showCreateModal = true">
        <template #icon>
          <icon-plus />
        </template>
        新增图谱
      </a-button>
    </div>

    <div class="graph-list">
      <a-card
        v-for="graph in graphList"
        :key="graph.id"
        class="graph-card"
      >
        <div class="card-content">
          <h3>{{ graph.name }}</h3>
          <p class="description">{{ graph.description }}</p>
          <div class="meta-info">
            <span class="node-count">节点数: {{ graph.nodeCount }}</span>
            <span class="edge-count">边数: {{ graph.edgeCount }}</span>
            <span class="create-time">{{ formatDate(graph.createTime) }}</span>
          </div>
          <div class="card-actions">
            <a-button type="primary" @click="viewGraph(graph.id)">
              查看
            </a-button>
            <a-button danger @click="deleteGraph(graph.id)">
              删除
            </a-button>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 新增图谱弹窗 -->
    <a-modal
      v-model:visible="showCreateModal"
      title="新增图谱"
      @ok="handleCreateGraph"
      @cancel="showCreateModal = false"
    >
      <a-form layout="vertical">
        <a-form-item label="图谱名称">
          <a-input v-model="newGraph.name" placeholder="请输入图谱名称" />
        </a-form-item>
        <a-form-item label="图谱描述">
          <a-textarea v-model="newGraph.description" placeholder="请输入图谱描述" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Message, Modal } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
import { getGraphList, createGraph, deleteGraph as deleteGraphApi } from '@/services/graphApi';

const router = useRouter();

// 图谱列表数据
const graphList = ref([]);

// 新增图谱弹窗
const showCreateModal = ref(false);
const newGraph = ref({
  name: '',
  description: ''
});

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// 查看图谱
const viewGraph = (graphId: string) => {
  router.push({
    name: 'Home',
    params: { id: graphId }
  });
};

// 删除图谱
const deleteGraph = (graphId: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这个图谱吗？',
    type: 'warning',
    onOk: async () => {
      try {
        await deleteGraphApi(graphId);
        graphList.value = graphList.value.filter(graph => graph.id !== graphId);
        Message.success('图谱删除成功');
      } catch (error) {
        Message.error('删除图谱失败');
      }
    }
  });
};

// 新增图谱
const handleCreateGraph = async () => {
  if (!newGraph.value.name) {
    Message.error('请输入图谱名称');
    return;
  }
  
  try {
    const createdGraph = await createGraph(newGraph.value);
    graphList.value.push(createdGraph);
    showCreateModal.value = false;
    Message.success('图谱创建成功');
    
    // 重置表单
    newGraph.value = {
      name: '',
      description: ''
    };
  } catch (error) {
    Message.error('创建图谱失败');
  }
};

// 加载图谱列表
const loadGraphList = async () => {
  try {
    const data = await getGraphList();
    graphList.value = data;
  } catch (error) {
    Message.error('获取图谱列表失败');
    // 出错时使用模拟数据兜底
    graphList.value = [
      {
        id: '1',
        name: '示例图谱1',
        description: '这是一个示例图谱，包含基本的节点和边',
        nodeCount: 10,
        edgeCount: 15,
        createTime: new Date().toISOString()
      },
      {
        id: '2',
        name: '示例图谱2',
        description: '这是另一个示例图谱，用于演示功能',
        nodeCount: 20,
        edgeCount: 25,
        createTime: new Date().toISOString()
      }
    ];
  }
};

onMounted(() => {
  loadGraphList();
});
</script>

<style scoped>
.graph-list-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.graph-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.graph-card {
  height: 100%;
}

.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-content h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.description {
  margin: 0 0 15px 0;
  color: #666;
  flex: 1;
}

.meta-info {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #999;
}

.card-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>