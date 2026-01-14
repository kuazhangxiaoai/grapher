import { storeToRefs } from 'pinia';
import { useEditStore } from '@/stores/edit.ts';
import {ref} from "vue";

export function usePdfNavigation() {
  const { currentPDFPage, totalPages } = storeToRefs(useEditStore());
  const showPageModel = ref(false);
  const jumpPageValue = ref(0);
  const editStore = useEditStore();

  const lastPDFPage = () => {
    if (currentPDFPage.value > 1) {
      editStore.lastPDFPage();
    }
  };

  const nextPDFPage = () => {
    if (currentPDFPage.value < totalPages.value) {
      editStore.nextPDFPage();
    }
  };

  const jumpPDFPage = (page: number) => {
    // 跳页功能可以在这里扩展
    editStore.jumpPDFPage(page);
  };

  const handleFileList = () => {
    editStore.openFileList();
  };

  const hanleJumpPageOK = () => {
    jumpPDFPage(jumpPageValue.value);
  }

  const hanleJumpPageCancel = () => {
    console.log("hanleJumpPageCancel");
    console.log("cancel: " + totalPages.value);
  }

  return {
    showPageModel,
    totalPages,
    jumpPageValue,
    currentPDFPage,
    lastPDFPage,
    nextPDFPage,
    jumpPDFPage,
    handleFileList,
    hanleJumpPageOK,
    hanleJumpPageCancel,
  };
}
