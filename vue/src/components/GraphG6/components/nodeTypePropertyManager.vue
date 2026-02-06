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
      :mask="false"
      :footer="false"
    >
      <!-- 新增节点属性表单 -->
      <div class="node-type-property-form mb-6">
        <h4 class="text-lg font-semibold mb-4" style="padding-bottom: 10px">
          新增节点属性
        </h4>
        <div class="mb-4" style="height: 200px; overflow-y: auto">
          <!-- <div class="arco-form-item-label arco-form-item-label-vertical mb-2">
            节点属性
          </div> -->
          <div
            v-for="(property, index) in form.properties"
            :key="index"
            class="flex items-center space-x-2 mb-2 property-item"
          >
            <a-form-item
              label=""
              :field="`properties.${index}.nodePropertyKey`"
              style="width: 40%"
            >
              <a-input
                v-model="property.nodePropertyKey"
                placeholder="请输入属性Key"
              />
            </a-form-item>
            <a-form-item
              label=""
              :field="`properties.${index}.nodePropertyValue`"
              style="width: 40%"
            >
              <a-input
                v-model="property.nodePropertyValue"
                placeholder="请输入属性Value"
              />
            </a-form-item>
            <div
              class="flex items-center space-x-1 boldText"
              v-if="index === form.properties.length - 1"
            >
              <a-button type="text" size="small" @click="addProperty">
                +
              </a-button>
              <a-button
                type="text"
                size="small"
                @click="removeProperty(index)"
                :disabled="form.properties.length <= 1"
              >
                -
              </a-button>
            </div>
          </div>
        </div>
        <!-- <div class="flex justify-end mt-2">
          <a-button type="primary" size="small" @click="handleAddProperty">
            添加
          </a-button>
        </div> -->
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
              <div class="flex items-center">
                <span class="property-key text-sm font-medium mr-4"
                  >{{ property.nodePropertyKey }}：</span
                >
                <span class="property-value text-sm font-medium">{{
                  property.nodePropertyValue
                }}</span>
              </div>
            </div>
            <div class="flex items-center">
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
import { ref, computed, onMounted, watch } from "vue";
import { Message } from "@arco-design/web-vue";
import apiClient from "@/services/apiClient";
import { useEditStore } from "@/stores/edit.ts";

const props = defineProps<{
  visible: boolean;
  id?: string;
  name?: string;
  color?: string;
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
const loading = ref(false);
const editingIndex = ref<number | null>(null);
const nodeTypeProperties = ref<any[]>([]);
const editStore = useEditStore();

// 获取节点属性
const fetchNodeProperties = async (id: string) => {
  if (!id) {
    nodeTypeProperties.value = [];
    return;
  }

  try {
    loading.value = true;
    const response = await apiClient.get("/api/graph/getNodeProperty", {
      params: {
        node_type_id: id,
      },
    });
    if (response.data.data && Array.isArray(response.data.data)) {
      nodeTypeProperties.value = response.data.data;
    } else {
      nodeTypeProperties.value = [];
    }
  } catch (error) {
    console.error("获取节点属性失败:", error);
    Message.error("获取节点属性失败，请重试");
    nodeTypeProperties.value = [];
  } finally {
    loading.value = false;
  }
};

const form = ref({
  properties: [{ nodePropertyKey: "", nodePropertyValue: "" }],
});

const rules = ref({});

// 重置表单
const handleResetForm = () => {
  form.value.properties = [{ nodePropertyKey: "", nodePropertyValue: "" }];
  editingIndex.value = null;
};

// 重置所有
const handleResetAll = () => {
  handleResetForm();
  Message.success("节点属性已重置");
};

// 编辑节点属性 - 暂时注释，因为现在的设计是批量添加
/* const handleEditProperty = (index: number) => {
  editingIndex.value = index;
  form.value.properties = [nodeTypeProperties.value[index]];
}; */

// 删除节点属性
const handleDeleteProperty = (index: number) => {
  nodeTypeProperties.value.splice(index, 1);
  Message.success("节点属性删除成功");
};

// 添加属性
const addProperty = () => {
  form.value.properties.push({ nodePropertyKey: "", nodePropertyValue: "" });
};

// 删除属性
const removeProperty = (index: number) => {
  form.value.properties.splice(index, 1);
};

// // 添加节点属性
// const handleAddProperty = async () => {
//   try {
//     // 检查是否有空的key或value
//     const hasEmptyFields = form.value.properties.some(
//       (property) => property.nodePropertyKey === "" || property.nodePropertyValue === "",
//     );
//     if (hasEmptyFields) {
//       Message.error("请填写所有属性的Key和Value");
//       return;
//     }

//     // 添加新属性
//     nodeTypeProperties.value.push(...form.value.properties);
//     Message.success("节点属性添加成功");

//     // 重置表单
//     form.value.properties = [{ nodePropertyKey: "", nodePropertyValue: "" }];
//   } catch (error) {
//     console.error("添加属性失败:", error);
//   }
// };

// 保存所有节点属性
const handleSaveAll = async () => {
  try {
    saving.value = true;

    // 检查类型名称是否有值
    if (!props.name) {
      Message.error("请输入节点类型名称");
      return;
    }

    // 准备请求参数 - 合并新增的属性和列表中的属性
    const allProperties = [
      // 新增的属性
      ...form.value.properties,
      // 列表中的现有属性
      ...nodeTypeProperties.value,
    ];

    // 过滤掉空的属性
    const validProperties = allProperties.filter(
      (property) => property.nodePropertyKey && property.nodePropertyValue,
    );

    // 提取keys和values
    const keys = validProperties.map((property) => property.nodePropertyKey);
    const values = validProperties.map(
      (property) => property.nodePropertyValue,
    );
    console.log(props);
    // 构建节点类型对象
    const nodeType: any = {
      name: props.name || "",
      color: props.color || "",
      key: keys,
      value: values,
    };
    console.log("props.id", props.id);
    // 只有当nodeTypeId存在时才添加到参数中
    if (props.id) {
      nodeType.id = props.id;
      const saveResult = await editStore.updateNodeType(nodeType);
      console.log("更新节点属性成功:", nodeType, "返回值:", saveResult);
      // 保存成功后重新获取节点属性列表
      const refreshId = saveResult?.node_type_id || props.id;
      await fetchNodeProperties(refreshId);
    } else {
      // 调用editStore.addNodeType方法保存节点属性
      const saveResult = await editStore.addNodeType(nodeType);
      console.log("保存节点属性成功:", nodeType, "返回值:", saveResult);
      // 保存成功后重新获取节点属性列表
      const refreshId = saveResult?.node_type_id || "";
      await fetchNodeProperties(refreshId);
    }
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
  fetchNodeProperties(props.id || "");
});

// 监听弹窗出现时，重新获取节点属性
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      console.log("弹窗出现，获取节点属性", props);
      fetchNodeProperties(props.id || "");
    }
  },
);

// 监听id变化，重新获取节点属性
watch(
  () => props.id,
  () => {
    console.log("id变化，获取节点属性", props.id);
    fetchNodeProperties(props.id || "");
  },
);
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
.arco-form-item {
  margin-bottom: 0px;
}
.boldText {
  .arco-btn {
    font-weight: 600;
  }
  .arco-btn-size-small {
    font-size: 15px;
  }
}
</style>
