<template>
  <div class="file-list-container">
    <Modal
       v-model:visible="showFileListModal" 
       title="文件列表" 
       :bordered="true" 
       width="60%"
       :closable="false"
       ok-text="关闭"
       @ok="handleOk"
       :hide-cancel="true"
       class="file-panel"
      >
      <Table
        :columns="columns"
        :data="page_data"
        :pagination="pagination"
        @page-change="handlePageChange"
        row-key="title"
        :bordered="true"
      >
        <template #operation="{ record }">
          <Button type="primary" @click="handleConfirm(record)">确认</Button>
          <Button type="danger" @click="handleDelete(record)">删除</Button>
        </template>
      </Table>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {useEditStore} from "../stores/edit.ts";
import {storeToRefs} from "pinia";
import axios from "axios";
import message from '@arco-design/web-vue/es/message';
import { 
  Modal, 
  Table, 
  Button, 
} from '@arco-design/web-vue';

const props = defineProps({

})

const current_page = ref(1)
const page_size = 25
const editStore = useEditStore();

const project:any = localStorage.getItem("grapher-project");
editStore.getAllFileInfoList(project);

const {fileinfos, fileList} = storeToRefs(editStore);
const showFileListModal = computed(() => fileList.value);

const handleOk = () => {
  editStore.closeFileList();
}

const columns = [
  {
    title: '文章标题',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true
  },
  {
    title: '发文时间',
    dataIndex: 'publish_time',
    key: 'publish_time',
    ellipsis: true
  },
  {
    title: '操作',
    key: 'operation',
    slotName: 'operation',
    // width: 160,
    fixed: 'right'
  }
];

const page_data = computed(() => {
  const start = (current_page.value - 1) * page_size;
  return fileinfos.value.slice(start, start + page_size);
})

const total = computed(() => {
  return fileinfos.value.length;
})

const pagination = computed(() => {
  return {
    current: current_page.value,
    pageSize: page_size,
    total: total.value,
    showTotal: true,
    showJumper: true
  };
})

const handlePageChange = (page: number) => {
  current_page.value = page;
}

const handleConfirm = (record: any) => {
  editStore.setArticleTitle(record.title)
  axios.get("/api/text/getPDFPreviewUrl", {
    params: {
      title: record.title,
      project: localStorage.getItem("grapher-project")
    }
  }).then((res) => {
    const server = editStore.server;
    const url = res.data.url;
    editStore.setPDFPreviewUrl(server + url);
    message.success('文件确认成功');
    editStore.closeFileList();
  }).catch((error) => {
    message.error('获取预览URL失败');
    console.error('获取预览URL失败:', error);
  });
}

const handleDelete = (record: any) => {
  // 调用store中的删除方法
  editStore.deleteArticle(record.title);
}

</script>

<style scoped>

.file-panel {
  height: 100%;
}

:deep(.arco-table-wrapper) {
  height: calc(100% - 60px);
}

:deep(.arco-table-body-wrapper) {
  max-height: calc(100% - 50px);
}

:deep(.arco-btn) {
  margin-right: 8px;
}
</style>