<!-- 添加连线名称的模态框 -->
<template>
  <a-modal
    v-model:visible="openEdgeNameModal"
    title="添加连线"
    width="400px"
    title-align="start"
    @cancel="handleCancel"
    @before-ok="handleOk"
    :mask-closable="false"
    :footer="true"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="连线名称" field="name">
        <a-input
          v-model="form.name"
          placeholder="请输入连线名称（必须以中文或英文字母开头，可包含中文、英文、数字和下划线）"
        />
      </a-form-item>
      <a-form-item label="连线属性" field="edgeProperty">
        <div class="flex items-center" style="width: 250px">
          <a-select
            v-model="form.edgeProperty"
            placeholder="请选择连线属性"
            class="w-full"
            style="width: 120px"
          >
            <a-option
              v-for="property in edgeProperties"
              :key="property.name"
              :value="property.name"
            >
              {{ property.name }}
            </a-option>
          </a-select>
          <a-button
            type="text"
            size="small"
            @click="handleOpenPropertyManager"
            class="ml-2"
          >
            管理
          </a-button>
        </div>
      </a-form-item>
      <!--<a-form-item label="连线描述" field="description">
        <a-input v-model="form.description" placeholder="请输入连线描述" />
      </a-form-item>
      <a-form-item label="权重" field="weight">
        <a-input-number v-model="form.weight" placeholder="请输入权重" />
      </a-form-item> -->
    </a-form>

    <!-- 连线属性管理组件 -->
    <edge-property-manager
      v-model:visible="showPropertyManager"
      @refresh="handlePropertyManagerRefresh"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import EdgePropertyManager from "./edgePropertyManager.vue";
const props = defineProps({});
const openEdgeNameModal = defineModel();
const formRef = ref();
const showPropertyManager = ref(false);
const edgeProperties = ref([
  { name: "默认", key: "default", value: "default" },
]);

const form = ref({
  name: "",
  description: "",
  weight: 1,
  edgeProperty: "默认",
});
const rules = ref({
  name: [
    { required: true, message: "请输入连线名称" },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5a-zA-Z0-9_]*$/,
      message:
        "连线名称必须以中文或英文字母开头，可包含中文、英文、数字和下划线",
    },
  ],
  description: [{ required: false, message: "请输入连线描述" }],
  weight: [{ required: false, message: "请输入权重" }],
  edgeProperty: [{ required: true, message: "请选择连线属性" }],
});

const emit = defineEmits(["confirm", "cancel"]);

const handleOk = async (done) => {
  const valid = await formRef.value.validate();
  if (valid) {
    done(false);
    return;
  }
  // 先保存表单数据的副本，防止后续清除影响
  const formData = { ...form.value };

  emit("confirm", formData);
  openEdgeNameModal.value = false;
  formRef.value.resetFields();
  done(true);
};

const handleCancel = () => {
  openEdgeNameModal.value = false;
  formRef.value.resetFields();
  emit("cancel");
};

// 打开连线属性管理
const handleOpenPropertyManager = () => {
  showPropertyManager.value = true;
};

// 连线属性管理刷新，重新加载连线属性数据
const handlePropertyManagerRefresh = () => {
  // 这里可以从 store 或 API 获取最新的连线属性数据
  // 暂时使用默认数据，实际项目中应该从 edgePropertyManager 组件中获取
  console.log("刷新连线属性列表");
};
</script>
<style scoped lang="scss"></style>
