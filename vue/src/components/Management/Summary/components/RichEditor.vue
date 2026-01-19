<template>
  <div 
    class="rich-editor"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
  >
    <div 
      v-if="disabled && !modelValue"
      class="flex items-center justify-center h-64 text-gray-400"
    >
      请选择一篇文章进行编辑
    </div>
    <WangEditor 
      v-else
      :content="modelValue"
      :disabled="disabled"
      @update:content="(value) => emit('update:modelValue', value)"
    />
  </div>
</template>

<script setup lang='ts'>
import WangEditor from './WangEditor.vue';

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<style scoped>
.rich-editor {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.rich-editor [contenteditable="true"] {
  outline: none;
}

.rich-editor [contenteditable="true"]:focus {
  box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.2);
}

.rich-editor [contenteditable="true"] h1,
.rich-editor [contenteditable="true"] h2,
.rich-editor [contenteditable="true"] h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.rich-editor [contenteditable="true"] p {
  margin-bottom: 1em;
  line-height: 1.6;
}
</style>