<!-- 添加连线名称的模态框 -->
<template>
  <a-modal
    v-model:visible="openEdgeNameModal"
    title="添加连线"
    width="600px"
    title-align="start"
    @cancel="handleCancel"
    @before-ok="handleOk"
    :mask-closable="false"
    :footer="true"
  >
    <div class="scroll-container" style="padding-right: 8px">
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-form-item label="连线名称" field="name">
          <a-input
            v-model="form.name"
            placeholder="请输入连线名称（必须以中文或英文字母开头，可包含中文、英文、数字和下划线）"
          />
        </a-form-item>
        <a-form-item label="触发词" field="triggerWord" class="formBottom">
          <a-select
            v-model="form.triggerWord"
            placeholder="请选择触发词"
            :disabled="props.editPanel"
          >
            <a-option value="影响">影响</a-option>
            <a-option value="导致">导致</a-option>
            <a-option value="关联">关联</a-option>
            <a-option value="包含">包含</a-option>
            <a-option value="属于">属于</a-option>
            <a-option value="依赖">依赖</a-option>
            <a-option value="支持">支持</a-option>
            <a-option value="反对">反对</a-option>
          </a-select>
        </a-form-item>
        <div
          class="mb-4 textBtn"
          style="height: 160px; overflow-y: auto; margin-bottom: 0px"
        >
          <div class="arco-form-item">
            <div class="arco-form-item-label arco-form-item-label-vertical">
              <label class="arco-form-item-label-text">连线属性</label>
            </div>
          </div>
          <div
            v-for="(property, index) in editingProperties"
            :key="index"
            class="flex items-center space-x-2 mb-2 property-item"
          >
            <a-form-item label="" :field="`editingProperties.${index}.key`">
              <a-input v-model="property.key" placeholder="请输入属性Key" />
            </a-form-item>
            <a-form-item label="" :field="`editingProperties.${index}.value`">
              <a-input v-model="property.value" placeholder="请输入属性Value" />
            </a-form-item>
            <div
              class="flex items-center space-x-1"
              v-if="index === editingProperties.length - 1"
            >
              <a-button type="text" size="small" @click="addProperty">
                +
              </a-button>
              <a-button
                type="text"
                size="small"
                @click="removeProperty(index)"
                :disabled="editingProperties.length <= 1"
              >
                -
              </a-button>
            </div>
          </div>
        </div>

        <!-- 连线属性列表 -->
        <div class="mb-4">
          <div class="arco-form-item">
            <div class="arco-form-item-label arco-form-item-label-vertical">
              <label class="arco-form-item-label-text">连线属性列表</label>
            </div>
          </div>
          <div class="bg-gray-50 p-3 rounded-md">
            <div
              v-if="form.properties.length === 0"
              class="text-gray-400 text-center py-2"
            >
              暂无属性
            </div>
            <div
              v-else
              class="space-y-2"
              style="height: 100px; overflow-y: auto"
            >
              <div
                v-for="(property, index) in form.properties"
                :key="index"
                class="flex items-center justify-between p-2 bg-white rounded"
              >
                <span
                  ><strong>{{ property.key }}</strong
                  >: {{ property.value }}</span
                >
                <a-button
                  type="text"
                  size="small"
                  @click="removeProperty(index)"
                >
                  删除
                </a-button>
              </div>
            </div>
          </div>
        </div>

        <!--<a-form-item label="连线描述" field="description">
        <a-input v-model="form.description" placeholder="请输入连线描述" />
      </a-form-item>
      <a-form-item label="权重" field="weight">
        <a-input-number v-model="form.weight" placeholder="请输入权重" />
      </a-form-item> -->
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import apiClient from "@/services/apiClient";
const props = defineProps({
  editPanel: {
    type: Boolean,
    default: false,
  },
});
const openEdgeNameModal = defineModel();
const formRef = ref();

// 监听弹窗显示状态，当弹窗打开时查询属性列表
watch(openEdgeNameModal, (newValue) => {
  if (newValue) {
    fetchEdgeProperties();
  }
});

// 查询连线属性列表
const fetchEdgeProperties = async () => {
  try {
    // 这里应该调用实际的查询接口，例如：
    // const response = await apiClient.get('/api/graph/getEdgeProperties', { params: { edgeId: props.edgeId } });
    // form.value.properties = response.data.properties || [];

    // 模拟接口延迟
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("弹窗打开时查询连线属性列表接口调用成功");

    // 模拟返回数据（实际应该使用接口返回的数据）
    form.value.properties = [];
  } catch (error) {
    console.error("查询连线属性列表失败:", error);
    form.value.properties = [];
  }
};

// 触发词列表
const triggerWords = ref([
  "影响",
  "导致",
  "关联",
  "包含",
  "属于",
  "依赖",
  "支持",
  "反对",
]);

const form = ref({
  name: "",
  description: "",
  weight: 1,
  triggerWord: "",
  properties: [], // 只存储接口查询回来的数据
});

// 用于编辑的属性
const editingProperties = ref([{ key: "", value: "" }]);
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
});

const emit = defineEmits(["confirm", "cancel"]);

const handleOk = async (done) => {
  const valid = await formRef.value.validate();
  if (valid) {
    done(false);
    return;
  }
  // 先保存表单数据的副本，防止后续清除影响
  const formData = {
    ...form.value,
    properties: editingProperties.value,
  };

  emit("confirm", formData);

  // 调用查询接口获取连线属性列表
  fetchEdgeProperties();
  openEdgeNameModal.value = false;
  formRef.value.resetFields();
  done(true);
};

const handleCancel = () => {
  openEdgeNameModal.value = false;
  formRef.value.resetFields();
  emit("cancel");
};

// 添加属性
const addProperty = () => {
  editingProperties.value.push({ key: "", value: "" });
};

// 删除属性
const removeProperty = (index) => {
  editingProperties.value.splice(index, 1);
};
</script>
<style scoped lang="scss">
.textBtn {
  .arco-form-item {
    margin-bottom: 1px;
    width: 40%;
  }
  .arco-btn-size-small {
    height: 30px;
    padding: 0 8px;
    font-size: 15px;
  }
  .arco-btn {
    font-weight: 600;
  }
  .arco-form-item-layout-vertical > .arco-form-item-label-col {
    margin-bottom: 0;
  }
  .arco-form-item-label-text {
    color: #4e5969;
    padding-left: 5px;
  }
}
</style>
