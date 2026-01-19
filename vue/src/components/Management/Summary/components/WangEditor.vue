<template>
  <div class="wangeditor-editor">
    <div style="border: 1px solid #ccc">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
      />
      <Editor
        style="height: 500px; overflow-y: hidden;"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="handleChange"
        @onDestroyed="handleDestroyed"
        @onFocus="handleFocus"
        @onBlur="handleBlur"
        @customAlert="customAlert"
        @customPaste="customPaste"
        :disabled="disabled"
      />
    </div>
  </div>
</template>
<script setup>
import '@wangeditor-next/editor/dist/css/style.css'
import { ref, shallowRef, watch, onMounted, onBeforeUnmount } from 'vue'
import { Editor, Toolbar } from '@wangeditor-next/editor-for-vue'
import { uploadFile } from '@/services/fileApi'

const props = defineProps({
  placeholder: {
    type: String,
    default: '请输入内容...',
  },
  content: {
    type: String,
    default: '',
  },
  contentHeight: {
    type: Number,
    default: 600,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:content'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref(props.content)

// 监听content变化，更新编辑器内容
watch(() => props.content, (newContent) => {
  valueHtml.value = newContent
}, { immediate: true })

// 监听valueHtml变化，触发update:content事件
watch(valueHtml, (newHtml) => {
  emits('update:content', newHtml)
})

const toolbarConfig = {}
const editorConfig = {
  placeholder: props.placeholder,
  height: props.contentHeight,
  MENU_CONF: {
    uploadImage: {
      // 自定义上传
      async customUpload(file, insertFn) {
        const acceptType = ['image/jpeg', 'image/png', 'image/jpg']
        if (!acceptType.includes(file.type)) {
          alert('Image format only accepts .png, .jpg, .jpeg')
          return
        }

        const isLt5M = file.size / 1024 / 1024 < 5
        if (!isLt5M) {
          alert('The size of the image cannot exceed 5MB!')
          return
        }

        try {
          // 使用项目中的文件上传函数
          const { data } = await uploadFile(file)
          if (data) {
            // 假设返回的数据中包含图片URL
            insertFn(data.url)
          }
        } catch (e) {
          console.log(e)
          alert('Upload failed')
        }
      }
    }
  }
}

const mode = 'default'

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const handleChange = (editor) => {
  console.log('change:', editor.children)
}

const handleDestroyed = (editor) => {
  console.log('destroyed', editor)
}

const handleFocus = (editor) => {
  console.log('focus', editor)
}

const handleBlur = (editor) => {
  console.log('blur', editor)
}

const customAlert = (info, type) => {
  alert(`【自定义提示】${type} - ${info}`)
}

const customPaste = (editor, event, callback) => {
  console.log('ClipboardEvent 粘贴事件对象', event)
  // 自定义插入内容
  editor.insertText('xxx')
  // 返回 false ，阻止默认粘贴行为
  event.preventDefault()
  callback(false) // 返回值（注意，vue 事件的返回值，不能用 return）
}

// 编辑器 API 使用示例
const insertText = () => {
  const editor = editorRef.value // 获取 editor ，必须等待它渲染完之后
  if (editor == null) return
  editor.insertText('hello world') // 执行 editor API
}

// 暴露给父组件的方法
defineExpose({
  insertText
})
</script>

<style scoped lang="scss">
.wangeditor-editor {
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.wangeditor-editor [contenteditable="true"] {
  outline: none;
}

.wangeditor-editor [contenteditable="true"]:focus {
  box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.2);
}

.wangeditor-editor [contenteditable="true"] h1,
.wangeditor-editor [contenteditable="true"] h2,
.wangeditor-editor [contenteditable="true"] h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.wangeditor-editor [contenteditable="true"] p {
  margin-bottom: 1em;
  line-height: 1.6;
}
</style>
