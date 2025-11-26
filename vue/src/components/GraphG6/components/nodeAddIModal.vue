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
      <a-form-item label="节点类型" field="entityType">
        <a-input v-model="form.entityType" placeholder="请输入节点类型" />
      </a-form-item>
      <a-form-item label="节点描述" field="description">
        <a-textarea
          v-model="form.description"
          placeholder="请输入节点描述"
          :auto-size="{ minRows: 3, maxRows: 5 }"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({});
const openNodeAddModal = defineModel();
const formRef = ref();
const form = ref({
  name: "",
  description: "",
  entityType: ""
});

const rules = ref({
  name: [{ required: true, message: "请输入节点名称" }],
  entityType: [{ required: true, message: "请输入节点类型" }],
  description: [{ required: true, message: "请输入节点描述" }]
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

  // 发送事件（传递副本）
  emit("confirm", formData);
  openNodeAddModal.value = false;
  formRef.value.resetFields();
  done(true);
};

const handleCancel = () => {
  openNodeAddModal.value = false;
  formRef.value.resetFields();
  emit("cancel");
};
</script>
<style scoped lang="scss"></style>
