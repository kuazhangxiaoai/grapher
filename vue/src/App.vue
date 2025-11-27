<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// App.vue作为路由容器，不包含具体业务逻辑
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
