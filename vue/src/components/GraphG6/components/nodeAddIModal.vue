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
//import { useNodeTypesStore } from '@/stores/nodeTypes';
import {useEditStore} from "@/stores/edit.ts";
import NodeTypeManager from './nodeTypeManager.vue';
import axios from "axios";
import type Node from "@/types/node.ts"

const props = defineProps({});
const openNodeAddModal = defineModel();
const formRef = ref();
const showTypeManager = ref(false);

// 使用节点类型管理
const { nodeTypes } = useEditStore();

const form = ref({
  name: "",
  description: "",
  nodeType: "默认" // 默认使用"默认"类型
});

const rules = ref({
  name: [{ required: true, message: "请输入节点名称" }],
  entityType: [{ required: true, message: "请选择节点类型" }],
  description: [{ required: true, message: "请输入节点描述" }]
});

const emit = defineEmits(["confirm", "cancel"]);

//确认创建节点
const handleOk = async done => {
  const valid = await formRef.value.validate();
  const sequence = useEditStore().getSequence();
  const article = useEditStore().getArticleTitle();
  const node_name = form.value.name;
  const node_label = form.value.nodeType;

  const node: Node = {
    label: node_label,
    name: node_name,
    sequence: sequence,
    article: article
  }

  useEditStore().addNode(node)

  if (valid) {
    done(false);
    return;
  }

  // 先保存表单数据的副本，防止后续清除影响
  const formData = { ...form.value };

  // 发送事件（传递副本）
  emit("confirm", formData);
  openNodeAddModal.value = false;
  formRef.value.resetFields();
  console.log(useEditStore().rects);
  done(true);
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

// 节点类型管理刷新
const handleTypeManagerRefresh = () => {
  // 类型列表会自动更新，无需额外操作
};

// 组件挂载时初始化
onMounted(() => {
  useEditStore().getAllNodeTypes()
});
</script>
<style scoped lang="scss">
.type-color {
  display: inline-block;
}
</style>
