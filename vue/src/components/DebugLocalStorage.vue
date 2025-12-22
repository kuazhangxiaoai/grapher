<template>
  <div class="debug-localstorage">
    <h2>LocalStorage 调试信息</h2>
    <div>
      <h3>grapher-user 数据:</h3>
      <pre>{{ userData }}</pre>
    </div>
    <div>
      <h3>清除用户数据</h3>
      <button @click="clearUserData">清除 localStorage 中的用户数据</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const userData = ref<string>('')

onMounted(() => {
  updateUserData()
})

const updateUserData = () => {
  const data = localStorage.getItem('grapher-user')
  userData.value = data ? data : '没有找到 grapher-user 数据'
}

const clearUserData = () => {
  localStorage.removeItem('grapher-user')
  updateUserData()
  alert('用户数据已清除')
}
</script>

<style scoped>
.debug-localstorage {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}

button {
  padding: 10px 20px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #ff7875;
}
</style>