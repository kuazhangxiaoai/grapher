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
        <a-input v-model="form.name" placeholder="请输入连线名称（必须以中文或英文字母开头，可包含中文、英文、数字和下划线）" />
      </a-form-item>
      <!--<a-form-item label="连线描述" field="description">
        <a-input v-model="form.description" placeholder="请输入连线描述" />
      </a-form-item>
      <a-form-item label="权重" field="weight">
        <a-input-number v-model="form.weight" placeholder="请输入权重" />
      </a-form-item> -->
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps({});
const openEdgeNameModal = defineModel();
const formRef = ref();
const form = ref({
  name: "",
  description: "",
  weight: 1
});
const rules = ref({
  name: [
    { required: true, message: "请输入连线名称" },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5a-zA-Z0-9_]*$/, message: "连线名称必须以中文或英文字母开头，可包含中文、英文、数字和下划线" }
  ],
  description: [{ required: true, message: "请输入连线描述" }],
  weight: [{ required: false, message: "请输入权重" }]
});

const emit = defineEmits(["confirm", "cancel"]);

const handleOk = async done => {
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
</script>
<style scoped lang="scss"></style>
