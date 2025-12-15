<!-- 添加节点信息的模态框 -->
<template>
  <a-modal
    v-model:visible="openNodeAddModal"
    title="添加节点"
    width="400px"
    title-align="start"
    @cancel="handleCancel"
    @before-ok="handleOk"
    :mask-closable="false"
    :footer="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="节点名称" field="name">
        <a-input v-model="form.name" placeholder="请输入节点名称" />
      </a-form-item>
      <a-form-item label="节点类型" field="nodeType">
        <div class="flex items-center"  style="width: 250px;">
          <a-select
            v-model="form.nodeType"
            placeholder="请选择节点类型"
            class="w-full"
            style="width: 120px"
          >
            <a-option
              v-for="type in nodeTypes"
              :key="type.name"
              :value="type.name"
            >
              <div class="flex items-center">
                <div
                  class="type-color w-8 h-4 rounded-full mr-2"
                  :style="{ backgroundColor: type.color }"
                ></div>
                {{ type.name }}
              </div>
            </a-option>
          </a-select>
          <a-button
            type="text"
            size="small"
            @click="handleOpenTypeManager"
            class="ml-2"
          >
            管理
          </a-button>
        </div>
      </a-form-item>
      <!--<a-form-item label="节点描述" field="description">
        <a-textarea
          v-model="form.description"
          placeholder="请输入节点描述"
          :auto-size="{ minRows: 3, maxRows: 5 }"
        />
      </a-form-item>-->
    </a-form>

    <!-- 节点类型管理组件 -->
    <node-type-manager
      v-model:visible="showTypeManager"
      @refresh="handleTypeManagerRefresh"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { storeToRefs } from 'pinia';
//import { useNodeTypesStore } from '@/stores/nodeTypes';
import {useEditStore} from "@/stores/edit.ts";
import NodeTypeManager from './nodeTypeManager.vue';
import axios from "axios";
import type Node from "@/types/node.ts"

const props = defineProps({});
const openNodeAddModal = defineModel();
const formRef = ref();
const showTypeManager = ref(false);

// 初始化store并获取响应式状态
const editStore = useEditStore();
// 使用storeToRefs获取响应式的nodeTypes
const { nodeTypes } = storeToRefs(editStore);

const form = ref({
  name: "",
  description: "",
  nodeType: "默认" // 默认使用"默认"类型
});

const rules = ref({
  name: [{ required: true, message: "请输入节点名称" }],
  nodeType: [{ required: true, message: "请选择节点类型" }]
  // description字段已被注释，移除必填规则
});

const emit = defineEmits(["confirm", "cancel"]);

//确认创建节点
const handleOk = async () => {
  try {
    console.log('开始验证表单...');
    // 使用validate的正确调用方式
    await formRef.value.validate();
    console.log('表单验证通过！');
    
    // 使用已初始化的editStore
    const sequence = editStore.getSequence();
    const article = editStore.getArticleTitle();
    const node_name = form.value.name;
    const node_label = form.value.nodeType;

    const node: Node = {
      label: node_label,
      name: node_name,
      sequence: sequence,
      article: article
    };

    console.log('准备添加节点:', node);
    // 添加节点到store
    editStore.addNode(node);
    
    // 发送确认事件
    emit("confirm", { ...form.value });
    
    // 重置表单
    formRef.value.resetFields();
    
    console.log('节点添加成功！');
    // 不需要手动关闭模态框，返回true后a-modal会自动关闭
    return true;
  } catch (error) {
    console.error('表单验证失败:', error);
    return false;
  }
};

const handleCancel = () => {
  openNodeAddModal.value = false;
  formRef.value.resetFields();
  emit("cancel");
};

// 打开节点类型管理
const handleOpenTypeManager = () => {
  showTypeManager.value = true;
};

// 节点类型管理刷新，重新加载节点类型数据
const handleTypeManagerRefresh = () => {
  editStore.getAllNodeTypes();
};

// 组件挂载时初始化
onMounted(() => {
  editStore.getAllNodeTypes()
});
</script>
<style scoped lang="scss">
.type-color {
  display: inline-block;
}
</style>
