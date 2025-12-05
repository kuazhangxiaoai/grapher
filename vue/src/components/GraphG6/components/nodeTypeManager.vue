<template>
  <div class="node-type-manager">
    <a-modal
      v-model:visible="visible"
      title="节点类型管理"
      width="600px"
      title-align="start"
      @cancel="handleCancel"
      @before-ok="handleOk"
      :mask-closable="false"
      :footer="false"
    >
      <!-- 节点类型列表 -->
      <div class="node-type-list mb-6">
        <h4 class="text-lg font-semibold mb-4">节点类型列表</h4>
        <a-space direction="vertical" :size="16" class="w-full">
          <div
            v-for="type in nodeTypes"
            :key="type.id"
            class="node-type-item flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center">
              <div
                class="type-color w-4 h-4 rounded-full mr-3"
                :style="{ backgroundColor: type.color }"
              ></div>
              <span class="type-name font-medium">{{ type.name }}</span>
              <span class="type-color-code text-sm text-gray-500 ml-2">{{ type.color }}</span>
            </div>
            <div class="flex items-center">
              <a-button
                type="text"
                size="small"
                @click="handleEditType(type)"
                class="mr-2"
              >
                编辑
              </a-button>
              <a-button
                type="text"
                size="small"
                status="danger"
                @click="handleDeleteType(type.id)"
              >
                删除
              </a-button>
            </div>
          </div>
        </a-space>
      </div>

      <!-- 新增/编辑节点类型表单 -->
      <div class="node-type-form">
        <h4 class="text-lg font-semibold mb-4">
          {{ editingType ? '编辑节点类型' : '新增节点类型' }}
        </h4>
        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
          <a-space direction="vertical" :size="16" class="w-full">
            <a-form-item label="类型名称" field="name">
              <a-input v-model="form.name" placeholder="请输入节点类型名称" />
            </a-form-item>
            <a-form-item label="背景颜色" field="color">
              <div class="flex items-center">
                <a-input
                  v-model="form.color"
                  placeholder="请输入颜色值，如 #1783FF"
                  class="w-1/2 mr-3"
                />
                <div
                  class="color-preview w-12 h-12 rounded-lg border"
                  :style="{ backgroundColor: form.color }"
                ></div>
              </div>
            </a-form-item>
          </a-space>
          <div class="mt-4 flex justify-end">
            <a-button @click="handleResetForm">重置</a-button>
            <a-button
              type="primary"
              @click="handleSaveType"
              :loading="saving"
              class="ml-2"
            >
              保存
            </a-button>
          </div>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {useEditStore} from "@/stores/edit.ts";
//import { useNodeTypesStore } from '@/stores/nodeTypes';
import { Message } from '@arco-design/web-vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'refresh'): void;
}>();

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

//const { nodeTypes, addNodeType, updateNodeType, deleteNodeType } = useNodeTypesStore();
const {nodeTypes} = useEditStore();

const formRef = ref();
const saving = ref(false);
const editingType = ref<any>(null);

const form = ref({
  name: '',
  color: '#1783FF',
});

const rules = ref({
  name: [{ required: true, message: '请输入节点类型名称' }],
  color: [{ required: true, message: '请输入颜色值' }],
});

// 重置表单
const handleResetForm = () => {
  formRef.value.resetFields();
  editingType.value = null;
};

// 编辑节点类型
const handleEditType = (type: any) => {
  editingType.value = type;
  form.value = { ...type };
};

// 删除节点类型
const handleDeleteType = (id: string) => {
  //deleteNodeType(id);
  Message.success('节点类型删除成功');
  emit('refresh');
};

// 保存节点类型
const handleSaveType = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    if (editingType.value) {
      // 更新现有类型
      //updateNodeType(editingType.value.id, form.value);
      Message.success('节点类型更新成功');
    } else {
      // 添加新类型
      //addNodeType(form.value);
      Message.success('节点类型添加成功');
    }
    handleResetForm();
    emit('refresh');
  } catch (error) {
    Message.error('操作失败，请重试');
  } finally {
    saving.value = false;
  }
};

// 关闭模态框
const handleCancel = () => {
  visible.value = false;
  handleResetForm();
};

// 确认关闭
const handleOk = () => {
  visible.value = false;
  handleResetForm();
  return true;
};

// 组件挂载时初始化
onMounted(() => {
  useEditStore().getAllNodeTypes()
});

</script>

<style scoped lang="scss">
.node-type-manager {
  .node-type-item {
    transition: all 0.3s;
    &:hover {
      background-color: #f0f0f0;
    }
  }
  
  .color-preview {
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      transform: scale(1.1);
    }
  }
}
</style>
