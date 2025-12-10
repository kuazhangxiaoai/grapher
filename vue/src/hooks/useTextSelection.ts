import { ref, onMounted, onUnmounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useEditStore } from '@/stores/edit.ts';
import type { Rectangle } from '@/types/rect.ts';
import { RectangleColorType } from '@/types/rect.ts';
import { RectangleType } from '@/types/rect.ts';

export function useTextSelection() {
  const pdfContainer = ref<HTMLDivElement | null>(null);
  let textSelectionHandler: (e: MouseEvent) => void;

  // 节点模态框相关
  const showNodeModal = ref(false);
  const nodeForm = ref({
    name: '',
    type: 'entity',
    description: '',
    originalText: '',
  });

  // 生成唯一ID
  const generateId = () =>
    'node_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  // 获取选区对应的页码
  const getSelectionPageNum = (selection: Selection) => {
    // 直接使用当前页面的页码，因为每次切换页面后只会显示一个页面
    return useEditStore().currentPDFPage;
  };

  // 选中文字后自动弹窗（核心逻辑）
  const handleOpenBySelection = () => {
    useEditStore().openGraphEditor();
    useEditStore().deleteEditingRect();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const range = selection.getRangeAt(0);
    const pageNum = getSelectionPageNum(selection);

    const pageContainer = document.getElementById('pageContainer');
    if (!pageContainer) return;

    const canvas = pageContainer.getElementsByTagName('canvas')[0];
    if (!canvas) return;

    const box = canvas.getBoundingClientRect();

    const rects = Array.from(range.getClientRects()).map((r: any) => {
      const x = r.left - box.left;
      const y = r.top - box.top + r.height - 3;
      return {
        x,
        y,
        width: r.width,
        height: 3,
        left: x,
        top: y,
        right: r.right - box.left,
        bottom: r.bottom - box.top,
        color: RectangleColorType.EDITING,
        type: RectangleType.EDITING,
        page: pageNum,
      } as Rectangle;
    });

    if (!rects.length) return;

    // 设置高亮框
    rects.forEach((rect: Rectangle) => {
      useEditStore().addRect(rect);
    })

    // 设置知识图谱内容
    useEditStore().setSequence(selectedText);
    nodeForm.value.originalText = selectedText;
    nodeForm.value.name = selectedText.substring(0, 20);

    // 打开弹窗
    showNodeModal.value = true;
  };

  // 鼠标松开自动触发选区监听
  const setupTextSelectionListener = () => {
    if (textSelectionHandler) {
      document.removeEventListener('mouseup', textSelectionHandler);
    }

    textSelectionHandler = (e: MouseEvent) => {
      // 检查事件是否发生在 pdfContainer 内部
      if (pdfContainer.value && !pdfContainer.value.contains(e.target as Node)) {
        return;
      }

      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';

      if (!text) {
        // 没选中内容时清除编辑态下划线
        useEditStore().deleteEditingRect();
        return;
      }

      // 防止重复触发（同一段文本反复弹窗）
      if (nodeForm.value.originalText === text && showNodeModal.value) {
        return;
      }

      nodeForm.value.originalText = text;
      handleOpenBySelection();
    };

    document.addEventListener('mouseup', textSelectionHandler);
  };

  // 处理节点模态框确认
  const handleNodeModalOk = () => {
    if (!nodeForm.value.name.trim()) {
      Message.warning('请输入节点名称');
      return false;
    }

    const nodeData = {
      id: generateId(),
      data: {
        name: nodeForm.value.name.trim(),
        type: nodeForm.value.type,
        description: nodeForm.value.description.trim(),
        originalText: nodeForm.value.originalText.trim(),
        createdAt: new Date().toISOString(),
      },
    };

    Message.success('节点已添加到图谱');
    showNodeModal.value = false;
    resetNodeForm();

    return nodeData;
  };

  // 处理节点模态框取消
  const handleNodeModalCancel = () => {
    showNodeModal.value = false;
    resetNodeForm();
  };

  // 重置节点表单
  const resetNodeForm = () => {
    nodeForm.value = {
      name: '',
      type: 'entity',
      description: '',
      originalText: '',
    };
  };

  // PDF渲染完成回调
  const handlePdfRendered = () => {
    Message.success('PDF加载完成，框选文字后松开鼠标即可编辑知识图谱');
    //setupTextSelectionListener();
  };

  // iframe 跨窗口选区监听
  const setupIframeMessageListener = () => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data.type === 'SELECTED_TEXT') {
        const text = e.data.content;
        if (text) {
          navigator.clipboard
            .writeText(text)
            .catch((err) => {
              console.error('复制失败：', err);
            });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  };

  // 生命周期
  onMounted(() => {
    setupTextSelectionListener(); // ✅ 初始化时就启用
    setupIframeMessageListener();
  });

  onUnmounted(() => {
    if (textSelectionHandler) {
      document.removeEventListener('mouseup', textSelectionHandler);
    }
  });

  return {
    pdfContainer,
    showNodeModal,
    nodeForm,
    handleNodeModalOk,
    handleNodeModalCancel,
    setupTextSelectionListener,
    handlePdfRendered,
    resetNodeForm
  };
}
