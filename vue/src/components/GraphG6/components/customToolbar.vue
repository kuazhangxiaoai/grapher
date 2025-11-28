<template>
  <div v-if="showToolbar" class="fixed bottom-5 right-5 z-10">
    <div
      class="custom-toolbar flex flex-row items-center bg-white rounded-lg shadow-md py-2 px-3 border border-solid border-[#E5E6EB]"
    >
      <div
        class="toolbar-item flex flex-row items-center"
        v-for="item in customToolbarData"
        :key="item.id"
      >
        <div
          v-if="item.type == 'divider'"
          class="w-px h-4 bg-gray-200 mx-2"
        ></div>
        <button
          v-else-if="item.id == 'zoom-out'"
          class="w-8 h-8 rounded bg-white flex items-center justify-center cursor-pointer transition-all duration-200 mx-0.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="item.onClick"
          title="缩小"
        >
          <icon-minus />
        </button>
        <span
          v-else-if="item.id == 'zoom-reset'"
          class="text-sm text-gray-600 min-w-[36px] text-center cursor-pointer"
          @click="item.onClick"
          title="重置缩放"
          >{{ Math.min(zoomLevel, 100) }}%</span
        >
        <button
          v-else-if="item.id == 'zoom-in'"
          class="w-8 h-8 rounded bg-white flex items-center justify-center cursor-pointer transition-all duration-200 mx-0.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="item.onClick"
          :disabled="zoomLevel >= 100"
          title="放大"
        >
          <icon-plus />
        </button>
        <a-dropdown
          trigger="hover"
          @select="handleDownloadImage"
          v-else-if="item.id === 'downloadImage'"
        >
          <div
            class="cursor-pointer w-8 h-8 text-center flex items-center justify-center hover:bg-gray-100 rounded-md p-1"
            :title="item.title"
          >
            <i class="iconfont icon-unpublish"></i>
          </div>
          <template #content>
            <a-doption
              v-for="item in downloadImageOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-doption>
          </template>
        </a-dropdown>

        <!-- 下拉的布局按钮,调试用 -->
        <a-dropdown
          trigger="hover"
          @select="handleLayoutChange"
          v-else-if="item.id === 'layout'"
        >
          <div
            class="cursor-pointer w-8 h-8 text-center flex items-center justify-center hover:bg-gray-100 rounded-md p-1"
            :title="item.title"
          >
            <i class="iconfont icon-zhishitupu"></i>
          </div>
          <template #content>
            <a-doption
              v-for="item in layoutOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-doption>
          </template>
        </a-dropdown>
        <div
          v-else
          @click="item.onClick"
          :title="item.title"
          class="w-8 h-8 rounded bg-white flex items-center justify-center cursor-pointer transition-all duration-200 mx-0.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i
            class="iconfont"
            :class="item.id === 'fullScreen' ? getFullScreenIcon : item.icon"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { downloadImage, downloadCustomImage, changeLayout } from "../utils";
const props = defineProps({
  graph: {
    type: Object,
    default: () => ({}),
  },
  layoutConfig: {
    type: Object,
    default: () => ({ type: "force", preventOverlap: true }),
  },
  showToolbar: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["shortestPath", "exportGraphCsv"]);

const zoomLevel = ref(100);
const isFullScreen = ref(false);
// 布局选项
const layoutOptions = ref([
  {
    value: "force",
    label: "力导向布局",
  },
  {
    value: "radial",
    label: "辐射状布局",
  },
  {
    value: "dagre",
    label: "层次布局",
  },
  {
    value: "concentric",
    label: "同心圆布局",
  },
  {
    value: "grid",
    label: "网格布局",
  },
  {
    value: "circular",
    label: "环形布局",
  },
  {
    value: "fruchterman",
    label: "聚类布局",
  },
]);

// 下载图片选项
const downloadImageOptions = ref([
  {
    value: "png",
    label: "导出图片png",
  },
]);

// 添加一个计算属性来获取全屏图标
const getFullScreenIcon = computed(() => {
  return isFullScreen.value ? "icon-fullscreen-exit" : "icon-Frame_1";
});

// 自定义工具栏数据
const customToolbarData = ref([
  {
    id: "zoom-out",
    icon: "icon-remove",
    title: "缩小",
    onClick: () => {
      if (props.graph) {
        console.log("getZoomRange", props.graph.getZoom());
        const currentZoom = props.graph.getZoom();
        const newZoom = currentZoom * 0.8;
        zoomLevel.value = Math.round(newZoom * 100);
        props.graph.zoomBy(0.8, {
          duration: 300,
          callback: () => {},
        });
      }
    },
  },
  {
    id: "zoom-reset",
    title: "重置缩放",
    onClick: () => {
      if (props.graph) {
        props.graph.fitView();
        zoomLevel.value = 100;
        // props.graph.updateNodeData([
        //   {
        //     id: "theory1",
        //     style: {
        //       labelFontSize: 90
        //     }
        //   }
        // ]);
        // props.graph.render();
        console.log("getData", props.graph.getData());
      }
    },
  },

  {
    id: "zoom-in",
    icon: "icon-add",
    title: "放大",
    onClick: () => {
      if (props.graph) {
        const currentZoom = props.graph.getZoom();
        const newZoom = currentZoom * 1.2;
        zoomLevel.value = Math.round(newZoom * 100);
        props.graph.zoomBy(1.2, {
          duration: 300,
        });
      }
    },
  },
  {
    id: "divider",
    type: "divider",
  },
  {
    id: "mouseMode",
    icon: "icon-Frame",
    title: "鼠标模式",
    onClick: () => {
      props.graph.updateBehavior({
        key: "drag-canvas",
        enable: false,
      });
      props.graph.updateBehavior({
        key: "brush-select",
        enable: (event) => event.targetType !== "node", // 不在节点上启用框选
      });
    },
  },
  {
    id: "dragMode",
    icon: "icon-laptop",
    title: "拖拽模式",
    onClick: () => {
      props.graph.updateBehavior({
        key: "brush-select",
        enable: false,
      });
      props.graph.updateBehavior({
        key: "drag-canvas",
        enable: (event) => event.targetType !== "node", // 不在节点上启用拖拽画布
      });
    },
  },
  // {
  //   id: "fullScreen",
  //   icon: isFullScreen.value ? "icon-fullscreen-exit" : "icon-Frame_1",
  //   title: isFullScreen.value ? "取消全屏" : "全屏",
  //   onClick: () => {
  //     const fullscreenPlugin = props.graph.getPluginInstance("fullscreen");
  //     isFullScreen.value = !isFullScreen.value;
  //     fullscreenPlugin[isFullScreen.value ? "request" : "exit"]();
  //   },
  // },

  {
    id: "shortestPath",
    icon: "icon-lujing",
    title: "最短路径",
    onClick: () => {
      emit("shortestPath");
    },
  },
  {
    id: "downloadImage",
    icon: "icon-unpublish",
    title: "下载",
    onClick: () => {
      downloadCustomImage(props.graph);
    },
  },
  {
    id: "layout",
    icon: "icon-zhishitupu",
    title: "切换布局",
    onClick: () => {},
  },
  {
    id: "divider",
    type: "divider",
  },
  {
    id: "undo",
    icon: "icon-rollback",
    title: "撤销",
    onClick: () => {
      // redo、undo 需要配合 history 插件使用
      const history = props.graph.getPluginInstance("history");
      history.undo();
    },
  },
  {
    id: "redo",
    icon: "icon-rollfront",
    title: "还原",
    onClick: () => {
      // redo、undo 需要配合 history 插件使用
      const history = props.graph.getPluginInstance("history");
      history.redo();
    },
  },
]);

// 切换布局的函数
const handleLayoutChange = (value) => {
  changeLayout(props.graph, value);
};

// 下载图片的函数
const handleDownloadImage = (value) => {
  if (value === "png") {
    downloadCustomImage(props.graph, "png");
  } else if (value === "csv") {
    emit("exportGraphCsv");
  }
};
</script>

<style scoped lang="scss"></style>
