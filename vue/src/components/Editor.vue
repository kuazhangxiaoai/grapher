<template>
  <div class="editor">
    <div class="textbox">{{ sequence }}</div>
    <GraphG6
      ref="graphEditor"
      :data="graphData"
      :layout-config="layoutConfig"
      :enableObject="enableObj"
      :showContextMenu="true"
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
import {onMounted, ref, watch} from "vue";
import { storeToRefs } from "pinia";
import { useEditStore } from "../stores/edit.ts";
import GraphG6 from "@/components/GraphG6/index.vue";
import { Message } from "@arco-design/web-vue";

const editStore = useEditStore();
const { sequence, nodes, edges } = storeToRefs(editStore);
const graphData: any = ref({ nodes: [], edges: [] }); //图数据，初始化为空数组，防止节点提前显示
const layoutConfig = ref(); // 布局类型配置
let graphInstance:any = null; //图实例
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
  delete: true,
  commit: true,
  close: true,
});

// 监听nodes和edges变化，更新graphData
watch([nodes, edges], ([newNodes, newEdges]) => {
  let node_data = [];
  let edges_data = [];
  
  // 创建节点映射，方便快速查找
  const nodeMap = new Map();
  
  newNodes.forEach(node => {
    const nodeItem = {
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
    };
    node_data.push(nodeItem);
    nodeMap.set(node.name, nodeItem);
  });
  
  newEdges.forEach((edge, index) => {
    // 只添加有效的边，即源节点和目标节点都存在的边
    if (nodeMap.has(edge.from_node_name) && nodeMap.has(edge.to_node_name)) {
      edges_data.push({
        id: edge.name,
        data: {name: edge.name},
        target: edge.to_node_name,
        source: edge.from_node_name,
      });
    } else {
      console.warn(`Skipping invalid edge: ${edge.name} (source: ${edge.from_node_name}, target: ${edge.to_node_name}) - one or both nodes not found`);
    }
  });
  
  graphData.value.nodes = node_data;
  graphData.value.edges = edges_data;
}, { deep: true });

// 监听sequence变化，重新查询关系图数据
watch(sequence, (newSeq) => {
  if (newSeq && editStore.article) {
    editStore.queryGraphBySeq(newSeq);
  }
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
    // 根据元素类型使用不同的方法获取数据
    const getElementMethod = targetType === "node" ? "getNodeData" : "getEdgeData";
    elementInfo.value = {
      ...graphInstance[getElementMethod](element.id),
      // G6 V5 中不需要手动获取样式，样式会自动从数据中提取
    };
    activePanel.value = "elementInfo";
    expandElementInfoPanel.value = true;
  } else {
    activePanel.value = null;
    expandElementInfoPanel.value = false;
    // 点击画布空白处，重新渲染图即可
    if (graphInstance.render) {
      graphInstance.render();
    }
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
  // 添加getGraphData方法，防止某些地方错误调用
  graphInstance.getData = () => {
    return {
      nodes: graphInstance.getNodesData?.() || [],
      edges: graphInstance.getEdgesData?.() || []
    };
  };
};

// 处理导出三元组CSV
const handleExportGraphCsv = async () => {
  console.log("handleExportGraphCsv");
};

// 获取所有节点列表
const getAllNodeList = () => {
  // 从graph实例中获取最新的节点列表
  if (graphInstance) {
    const data = graphInstance.getData();
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
    // 删除成功后调用commit方法，将变更提交到服务器
    editStore.commit();
  } catch (error) {
    Message.error(error.message);
  }
};

onMounted(()=>{
  // 组件挂载时，如果有article和sequence，就查询关系图数据
  if(editStore.article && sequence.value) {
    editStore.queryGraphBySeq(sequence.value);
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
  height: 100%;
}
.textbox {
  position: absolute;
  top: 0;
  z-index: 9;
  background-color: darksalmon;
}
</style>
