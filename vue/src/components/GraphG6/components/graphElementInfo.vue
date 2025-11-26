<template>
  <!-- 节点信息面板  -->
  <div
    v-if="expandElementInfoPanel"
    class="absolute bg-white top-0 w-[400px] right-0 z-10 shadow-md"
    style="border-right: 1px solid #e5e6eb"
  >
    <div
      class="flex items-center justify-between border-b border-gray-200 px-4 py-3"
    >
      <div class="font-medium text-[#1D2129] text-[14px] leading-[14px]">
        {{ elementTargetType === "node" ? "节点信息" : "连线信息" }}
      </div>

      <div
        class="hover:bg-gray-200 w-6 h-6 flex justify-center items-center cursor-pointer transition-all duration-300 rounded-lg"
        @click="expandElementInfoPanel = false"
      >
        <icon-close size="12px" />
      </div>
    </div>
    <div class="content p-4 overflow-y-auto" style="height: calc(100% - 49px)">
      <div class="pb-4 text-[#1D2129] font-medium text-[14px]">基础属性</div>
      <div class="flex items-start gap-2 mb-3">
        <div class="text-[#4E5969] text-[14px] w-[64px] flex-shrink-0">
          {{ elementTargetType === "node" ? "节点ID" : "连线ID" }}
        </div>
        <div class="text-[#1D2129] text-[14px] w-full">
          {{ elementShowInfo.id }}
        </div>
      </div>
      <div class="flex items-center gap-2 mb-3">
        <div class="text-[#4E5969] text-[14px] w-[64px] flex-shrink-0">
          {{ elementTargetType === "node" ? "节点名称" : "连线名称" }}
        </div>
        <div class="text-[#1D2129] text-[14px] w-full">
          <a-input v-model="elementShowInfo.name" @blur="handleUserEdit" />
        </div>
      </div>
      <div
        class="flex items-center gap-2 mb-3"
        v-if="elementTargetType === 'node'"
      >
        <div class="text-[#4E5969] text-[14px] w-[64px]">节点颜色</div>
        <div class="text-[#1D2129] text-[14px]">
          <a-color-picker
            v-model="elementShowInfo.fill"
            showText
            size="medium"
            @change="handleUserEdit"
          />
        </div>
      </div>
      <div
        class="flex items-center gap-2 mb-3"
        v-if="elementTargetType === 'node'"
      >
        <div class="text-[#4E5969] text-[14px] w-[64px]">节点大小</div>
        <div class="text-[#1D2129] text-[14px]">
          <a-slider
            :min="1"
            :max="100"
            v-model="elementShowInfo.size"
            :show-tooltip="false"
            :style="{ width: '120px' }"
            class="mr-4"
            @change="handleUserEdit"
          />
          <span>{{ elementShowInfo.size }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 mb-3">
        <div class="text-[#4E5969] text-[14px] w-[64px]">文本颜色</div>
        <div class="text-[#1D2129] text-[14px]">
          <a-color-picker
            v-model="elementShowInfo.labelFill"
            showText
            size="medium"
            @change="handleUserEdit"
          />
        </div>
      </div>
      <div class="flex items-center gap-2 mb-3">
        <div class="text-[#4E5969] text-[14px] w-[64px]">文本字号</div>
        <div class="text-[#1D2129] text-[14px]">
          <a-slider
            :min="10"
            :max="48"
            v-model="elementShowInfo.labelFontSize"
            :show-tooltip="false"
            :style="{ width: '120px' }"
            class="mr-4"
            @change="handleUserEdit"
          />
          <span>{{ elementShowInfo.labelFontSize }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { throttle, debounce } from "lodash-es";

const props = defineProps({
  elementInfo: {
    type: Object,
    default: () => ({}),
  },
  elementTargetType: {
    type: String,
    default: () => "",
  },
});

const emit = defineEmits(["updateUpload", "updateElementInfo"]);
const expandElementInfoPanel = defineModel();

// 标记是否正在初始化数据(只保留这一个标记)
const isInitializing = ref(true);

const elementShowInfo = ref({
  id: "",
  name: "",
  iconSrc: "",
  fill: "",
  size: 10,
  labelFill: "",
  labelFontSize: 10,
});

// 监听整个对象变化，但只关注ID
watch(
  () => props.elementInfo,
  (newVal, oldVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      const newId = newVal.id;
      const oldId = oldVal?.id;

      // 只有ID变化时才进行初始化
      if (newId !== oldId) {
        console.log("[DEBUG] 节点ID变化:", oldId, "->", newId);

        // 设置为初始化状态，阻止change事件触发更新
        isInitializing.value = true;

        // 更新表单数据
        elementShowInfo.value = {
          id: newVal.id || "",
          name: newVal.data?.name || "",
          iconSrc: newVal.style?.iconSrc || "",
          fill: newVal.style?.fill || "#165dff",
          size: newVal.style?.size || 10,
          labelFill: newVal.style?.labelFill || "#1D2129",
          labelFontSize: newVal.style?.labelFontSize || 10,
        };
        // 使用setTimeout确保在表单更新完成后再重置初始化标记
        nextTick(() => {
          setTimeout(() => {
            isInitializing.value = false;
          }, 100);
        });
      }
    }
  },
  { immediate: true, deep: true }
);

// 处理用户编辑
const handleUserEdit = () => {
  // 只有不在初始化状态时，才触发更新
  if (!isInitializing.value) {
    applyChangesDebounced();
  } else {
    console.log("[DEBUG] 初始化中，忽略change事件");
  }
};

// 将扁平结构转换回G6需要的嵌套结构
const convertToG6Format = () => {
  const { id, name, iconSrc, fill, size, labelFill, labelFontSize } =
    elementShowInfo.value;

  return {
    id,
    data: { name },
    style: { fill, size, labelFill, labelFontSize, iconSrc, iconRadius: 50 },
  };
};

// 应用更改
const applyChanges = () => {
  // 只需要检查是否在初始化状态
  if (!isInitializing.value) {
    const updateData = convertToG6Format();
    emit("updateElementInfo", updateData);
  } else {
  }
};

const applyChangesDebounced = debounce(applyChanges, 300);
</script>

<style scoped lang="scss">
:deep(.arco-color-picker) {
  background: unset;
  border: 1px solid var(--color-fill-3);
  border-radius: 2px;
}
</style>
