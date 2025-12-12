<template>
  <div class="editor">
    <div class="textbox">{{ sequence }}</div>
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
import {onMounted, ref} from "vue";
import { storeToRefs } from "pinia";
import { useEditStore } from "../stores/edit.ts";
import GraphG6 from "@/components/GraphG6/index.vue";
import { Message } from "@arco-design/web-vue";

const { sequence } = storeToRefs(useEditStore());
const graphData: any = ref({ nodes: [], edges: [] }); //图数据，初始化为空数组，防止节点提前显示
const layoutConfig = ref(); // 布局类型配置
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
  commit: true,
  close: true,
});

// 当前激活的面板
const activePanel = ref(null); // 'elementInfo' | 'shortestPath' | null

// 是否显示节点信息弹窗
const expandElementInfoPanel = ref(false);
const showShortestPath = ref(false);
const elementInfo: any = ref({});
const elementTargetType = ref("node");

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

// 获取所有节点列表
const getAllNodeList = () => {
  // 从graph实例中获取最新的节点列表
  if (graphInstance) {
    const data = graphInstance.getGraphData();
    return data.nodes || [];
  }
  return [];
};

const handleAddNode = async (nodeData) => {
  try {
    // await createNode(nodeData);
    Message.success("节点创建成功");
    getAllNodeList();
  } catch (error) {
    Message.error(error.message);
  }
};
const handleAddEdge = async (edgeData) => {
  try {
    // await createEdge(edgeData);
    Message.success("边创建成功");
    getAllNodeList();
  } catch (error) {
    Message.error(error.message);
  }
};
const handleDeleteElement = async (elementId, type) => {
  try {
    // await deleteElement(elementId, type);
    Message.success(`${type === "node" ? "节点" : "边"}删除成功`);
    getAllNodeList();
  } catch (error) {
    Message.error(error.message);
  }
};

onMounted(()=>{
  const article = useEditStore().article
  const sequence = useEditStore().sequence
  if(!article || !sequence) {
    graphData.value.nodes = []
    graphData.value.edges = []
  }
  else {
    useEditStore().queryGraphBySeq(sequence)
    setTimeout(()=>{
      const nodes = useEditStore().nodes;
      const edges = useEditStore().edges;
      let node_data = []
      let edges_data = []
      nodes.forEach(node => {
        node_data.push({
          id: node.name,
          data: {
            name: node.name,
            description: "",
            entityType: node.label
          },
          style: {
            labelText: node.name,
            fill: node.color,
          },
        })
      })
     edges.forEach(edge => {
       edges_data.push({
         id: "edge-" + Date.now(),
         data: {name: edge.name},
         target: edge.to_node_name,
         source: edge.from_node_name,
       })
     })

      graphData.value.nodes = node_data
      graphData.value.edges = edges_data;

    }, 100)
  }
})

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
.textbox {
  position: absolute;
  top: 0;
  z-index: 9;
  background-color: darksalmon;
}
</style>
