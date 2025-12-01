<template>
  <div class="editor">
    <div class="textbox" style="background-color: darksalmon">{{sequence}}</div>
    <GraphG6
        ref="graphEditor"
        :data="graphData"
        :layout-config="layoutConfig"
        :enableObject="enableObj"
        @elementClick="handleElementClick"
        @ready="handleGraphReady"
        @shortestPath="handleShortestPath"
        @exportGraphCsv="handleExportGraphCsv"
        @addNodeSuccess="handleAddNode"
        @addEdgeSuccess="handleAddEdge"
        @deleteElementSuccess="handleDeleteElement"
    />
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {storeToRefs} from "pinia"
import {useEditStore} from "../stores/edit.ts";
import GraphG6 from "@/components/GraphG6/index.vue";
import CustomToolbar from "./GraphG6/components/customToolbar.vue";

const {sequence} = storeToRefs(useEditStore())
const graphData: any = ref({});   //图数据
const layoutConfig = ref();   // 布局类型配置
let graphInstance = null; //图实例
const enableObj = ref({
  zoomOut: true,
  zoomReset: true,
  zoomIn: true,
  mouseMode: true,
  dragMode: true,
  shortestPath: true,
  downImage: false,
  layout: true,
  undo: true,
  redo: true,
  close: true,
})


const handleElementClick = (element, targetType) => {
  elementTargetType.value = targetType;
  if (targetType === "node" || targetType === "edge") {
    elementInfo.value = {
      ...graphInstance.value.getElementData(element.id),
      style: { ...graphInstance.value.getElementRenderStyle(element.id) },
    };
    activePanel.value = "elementInfo";
    expandElementInfoPanel.value = true;
  } else {
    activePanel.value = null;
    expandElementInfoPanel.value = false;

    let states = {};
    const elements = [...graphData.value.nodes, ...graphData.value.edges];

    // 清空搜索状态
    elements.forEach((element) => {
      states[element.id] = "";
    });
    graphInstance.value.setElementState(states);
  }
};

// 处理点击最短路径按钮
const handleShortestPath = () => {
  // 设置当前激活面板为路径分析面板
  activePanel.value = "shortestPath";
  showShortestPath.value = true;
};

// 图实例初始化完成后的回调
const handleGraphReady = (graph) => {
  graphInstance = graph;
};

// 处理导出三元组CSV
const handleExportGraphCsv = async () => {
  console.log("handleExportGraphCsv");
};


const handleAddNode = async (nodeData) => {
  try {
    // await createNode(nodeData);
    Message.success('节点创建成功');
    getAllNodeList();
  } catch (error) {
    Message.error(error.message);
  }
};
const handleAddEdge = async (edgeData) => {
  try {
    // await createEdge(edgeData);
    Message.success('边创建成功');
    getAllNodeList();
  } catch (error) {
    Message.error(error.message);
  }
};
const handleDeleteElement = async (elementId, type) => {
  try {
    // await deleteElement(elementId, type);
    Message.success(`${type === 'node' ? '节点' : '边'}删除成功`);
    getAllNodeList();
  } catch (error) {
    Message.error(error.message);
  }
};

const zoomLevel = ref(100);

</script>

<style scoped>
.editor {
  position: relative;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 95%;
}
</style>