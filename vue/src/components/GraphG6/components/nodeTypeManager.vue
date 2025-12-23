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
        <a-space direction="vertical" :size="16" class="w-full scroll-y">
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
                <a-color-picker
                  v-model="form.color"
                  showText
                  size="medium"
                  placeholder="请选择颜色值"
                />
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
import { storeToRefs } from 'pinia';
import axios from "axios";
import {useEditStore} from "@/stores/edit.ts";
import { Message } from '@arco-design/web-vue';
import type {NodeType} from "@/stores/nodeTypes.ts";

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

// 初始化store并获取响应式状态
const editStore = useEditStore();
// 使用storeToRefs获取响应式的nodeTypes
const { nodeTypes } = storeToRefs(editStore);

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
const handleDeleteType = async (id: string) => {
  try {
    // 调用删除节点类型的API
    await axios.post("/api/graph/deleteNodeType", { id });
    Message.success('节点类型删除成功');
    // 删除成功后重新加载节点类型数据
    editStore.getAllNodeTypes();
    emit('refresh');
  } catch (error) {
    Message.error('删除节点类型失败');
  }
};

// 保存节点类型
const handleSaveType = async () => {
  // const valid = await formRef.value.validate();
  if(!form.value.name){
    Message.error('请输入节点类型名称');
    return;
  }
  // if (!valid) return;

  saving.value = true;
  try {
    if (editingType.value) {
      // 更新现有类型，使用表单中的最新数据
      const nodeType: NodeType = {
        id: editingType.value.id,
        name: form.value.name,
        color: form.value.color
      }
      await editStore.updateNodeType(nodeType);
      Message.success('节点类型更新成功');
    } else {
      // 使用form.value代替this.form
      const nodeType: NodeType = {
        name: form.value.name,
        color: form.value.color
      }
      await editStore.addNodeType(nodeType);
      Message.success('节点类型添加成功');
    }
    // 保存成功后重新加载节点类型数据
    editStore.getAllNodeTypes();
    handleResetForm();
    emit('refresh');
  } catch (error) {
    Message.error('操作失败，请重试');
    console.error('保存节点类型失败:', error);
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
 .scroll-y{
    height: 250px;
    overflow-y: auto;
  }
</style>
