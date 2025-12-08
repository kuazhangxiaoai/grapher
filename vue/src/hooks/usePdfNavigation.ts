import { storeToRefs } from 'pinia';
import { useEditStore } from '@/stores/edit.ts';

export function usePdfNavigation() {
  const { currentPDFPage, totalPages } = storeToRefs(useEditStore());
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

  const jumpPDFPage = () => {
    // 跳页功能可以在这里扩展
  };

  const handleFileList = () => {
    editStore.openFileList();
  };

  return {
    currentPDFPage,
    totalPages,
    lastPDFPage,
    nextPDFPage,
    jumpPDFPage,
    handleFileList
  };
}
