<template>
  <div class="node-type-property-manager">
    <a-modal
      v-model:visible="visible"
      title="节点属性管理"
      width="600px"
      title-align="start"
      @cancel="handleCancel"
      @before-ok="handleOk"
      :mask-closable="false"
      :footer="false"
    >
      <!-- 新增节点属性表单 -->
      <div class="node-type-property-form mb-6">
        <h4 class="text-lg font-semibold mb-4" style="padding-bottom: 10px">
          新增节点属性
        </h4>
        <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
          <a-space direction="vertical" :size="16" class="w-full">
            <a-form-item label="属性名称" field="name">
              <div class="flex items-center">
                <a-input v-model="form.name" placeholder="请输入属性名称" />
                <a-button
                  type="primary"
                  size="small"
                  @click="handleAddProperty"
                  class="ml-2"
                  icon="plus"
                >
                  添加
                </a-button>
              </div>
            </a-form-item>
            <div class="flex space-x-4">
              <a-form-item label="键" field="key" class="flex-1">
                <a-input v-model="form.key" placeholder="请输入键" />
              </a-form-item>
              <a-form-item label="值" field="value" class="flex-1">
                <a-input v-model="form.value" placeholder="请输入值" />
              </a-form-item>
            </div>
          </a-space>
        </a-form>
      </div>

      <!-- 节点属性列表 -->
      <div class="node-type-property-list mb-6">
        <h4 class="text-lg font-semibold mb-4">节点属性列表</h4>
        <a-space direction="vertical" :size="16" class="w-full scroll-y">
          <div
            v-for="(property, index) in nodeTypeProperties"
            :key="index"
            class="node-type-property-item flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex flex-col">
              <span class="property-name font-medium">{{ property.name }}</span>
              <div class="flex items-center mt-1">
                <span class="property-key text-sm text-gray-500 mr-4"
                  >键: {{ property.key }}</span
                >
                <span class="property-value text-sm text-gray-500"
                  >值: {{ property.value }}</span
                >
              </div>
            </div>
            <div class="flex items-center">
              <a-button
                type="text"
                size="small"
                @click="handleEditProperty(index)"
                class="mr-2"
              >
                编辑
              </a-button>
              <a-button
                type="text"
                size="small"
                status="danger"
                @click="handleDeleteProperty(index)"
              >
                删除
              </a-button>
            </div>
          </div>
        </a-space>
      </div>

      <!-- 操作按钮 -->
      <div class="mt-4 flex justify-end">
        <a-button @click="handleResetAll">重置</a-button>
        <a-button
          type="primary"
          @click="handleSaveAll"
          :loading="saving"
          class="ml-2"
        >
          保存
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Message } from "@arco-design/web-vue";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "refresh"): void;
}>();

const visible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const formRef = ref();
const saving = ref(false);
const editingIndex = ref<number | null>(null);
const nodeTypeProperties = ref<any[]>([]);

const form = ref({
  name: "",
  key: "",
  value: "",
});

const rules = ref({
  name: [{ required: true, message: "请输入属性名称" }],
  key: [{ required: true, message: "请输入键" }],
  value: [{ required: true, message: "请输入值" }],
});

// 重置表单
const handleResetForm = () => {
  formRef.value.resetFields();
  editingIndex.value = null;
};

// 重置所有
const handleResetAll = () => {
  nodeTypeProperties.value = [];
  handleResetForm();
  Message.success("节点属性已重置");
};

// 编辑节点属性
const handleEditProperty = (index: number) => {
  editingIndex.value = index;
  form.value = { ...nodeTypeProperties.value[index] };
};

// 删除节点属性
const handleDeleteProperty = (index: number) => {
  nodeTypeProperties.value.splice(index, 1);
  Message.success("节点属性删除成功");
};

// 添加节点属性
const handleAddProperty = async () => {
  try {
    await formRef.value.validate();

    // 检查是否已存在同名属性
    const isDuplicate = nodeTypeProperties.value.some(
      (property) => property.name === form.value.name,
    );
    if (isDuplicate) {
      Message.error("属性名称已存在，请输入不同的名称");
      return;
    }
    if (
      form.value.name == "" ||
      form.value.key == "" ||
      form.value.value == ""
    ) {
      Message.error("请填写属性名称、键、值");
      return;
    }

    // 添加新属性
    nodeTypeProperties.value.push({ ...form.value });
    Message.success("节点属性添加成功");

    // 重置表单
    handleResetForm();
  } catch (error) {
    console.error("表单验证失败:", error);
  }
};

// 保存所有节点属性
const handleSaveAll = async () => {
  try {
    saving.value = true;

    // 这里可以添加保存到后端的逻辑
    console.log("保存节点属性:", nodeTypeProperties.value);

    Message.success("节点属性保存成功");
    emit("refresh");
  } catch (error) {
    Message.error("保存失败，请重试");
    console.error("保存节点属性失败:", error);
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
  // 初始化节点属性列表
  if (nodeTypeProperties.value.length === 0) {
    nodeTypeProperties.value = [];
  }
});
</script>

<style scoped lang="scss">
.node-type-property-manager {
  .node-type-property-item {
    transition: all 0.3s;
    &:hover {
      background-color: #f0f0f0;
    }
  }
}

.scroll-y {
  height: 250px;
  overflow-y: auto;
}
</style>
