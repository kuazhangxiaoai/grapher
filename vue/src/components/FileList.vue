<template>
  <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; border-radius: 5px">
    <h3 class="text-lg font-semibold mb-1 text-center">文件列表</h3>
    <div class="list-header">
      <div class="fitem">文章标题</div>
      <div class="fitem">发文时间</div>
    </div>
    <div id="file-list-content" class="list-content">
      <div class="file-item" ref="items" v-for="(item, index) in page_data" :class="{active: activeIdex === index}"  :key="item.title" @click="selectFile(index)">
        <div class="fitem">{{item.title}}</div>
        <div class="fitem">{{item.publish_time}}</div>
      </div>
    </div>
    <div class="page-ctl">
      <span class="last-page">上一页</span>
      <span class="last-page">第{{current_page}}页，共{{total_pages}}页</span>
      <span class="next-page">下一页</span>
      <span class="ok-btn" @click="filelistOK">确认</span>
      <span class="quit-btn" @click="filelistCancel">取消</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {useEditStore} from "../stores/edit.ts";
import {storeToRefs} from "pinia";

const props = defineProps({

})

const items = ref([])
const current_page = ref(1)
const page_size = 20
const editStore = useEditStore();
editStore.getAllFileInfoList();
const {fileinfos} = storeToRefs(editStore)
const bgColor = ref("") //salmon
const activeIdex = ref(null)
const filelistCancel = () => {
  editStore.closeFileList()
}

const filelistOK = () => {

}
const page_data = computed(() => {
  const start = (current_page.value - 1) * page_size;
  return fileinfos.value.slice(start, start + page_size);
})

const total_pages = computed(()=>{
  return Math.ceil(fileinfos.value.length / page_size)
})

const next_page = () => {
  if (current_page.value < total_pages.value) {current_page.value += 1;}
}

const previous_page = () => {
  if(current_page.value > 1) { current_page.value -= 1;}
}

const selectFile = (index) => {
  console.log(index)
  items.value.forEach((item, index) => {
    item.style.backgroundColor = "antiquewhite"
  })
  items.value[index].style.backgroundColor = "salmon"
}

</script>

<style scoped>
.controller {
  display: flex;
  place-items: center;
  align-items: center;
  place-content: center;
  position: absolute;
  left: 0px;
  bottom: 5px;
  width: 100%;
  height: 5%;
  gap: 20px;
  overflow-y: auto;
}
.controller-btn{
  height: 100%;
  width: 80px;
  background-color: lightgray;
  border-radius: 5px;
  left: 20px;
}
.list-content{
  position: absolute;
  overflow-y: auto;
  width: 100%;
  top: 55px;
}
.list-header{
  position: absolute;
  width: 100%;
  height: 20px;
  display: flex;
}
.file-item {
  display: flex;
  position: relative;
  left: 2%;
  width: 96%;
  height: 20px;
  gap: 10%;
  place-content: center;
  place-items: center;
  //border-width: 1px;
  //border-color: darkgray;
}
.file-item:active{
  background-color: lightgray;
}
.file-item:hover {
  cursor: pointer;
  color: red;
}
.fitem{
  place-items: center;
  align-items: center;
  place-content: center;
  font-size: larger;
  text-align: center;
  width: 50%;
}
.page-ctl{
  position: absolute;
  display: flex;
  align-items: center;
  place-items: center;
  place-content: center;
  bottom: 2%;
  width: 100%;
  gap: 15px;
}
.last-page{
  left: 5px;
  border-color: #1a1a1a;
  font-size: small;
  margin-right: 5px;
}
.last-page:hover{
  cursor: pointer;
  color: red;
}
.next-page{
  border-color: #1a1a1a;
  right: 5px;
  font-size: small;
}
.next-page:hover{
  cursor: pointer;
  color: red;
}
.ok-btn{
  border-color: #1a1a1a;
  right: 5px;
  font-size: small;
}
.ok-btn:hover{
  cursor: pointer;
  color: red;
}
.quit-btn{
  border-color: #1a1a1a;
  right: 5px;
  font-size: small;
}
.quit-btn:hover{
  cursor: pointer;
  color: red;
}
</style>