<template>
  <div class="editor">
    <div class="textbox">无文本编辑</div>
    <GraphG6
      ref="graphEditor"
      :data="graphData"
      :layout-config="layoutConfig"
      :enableObject="enableObj"
      :showContextMenu="true"
      :editPanel="true"
      @elementClick="handleElementClick"
      @ready="handleGraphReady"
      @shortestPath="handleShortestPath"
      @exportGraphCsv="handleExportGraphCsv"
      @addNodeSuccess="handleAddNode"
      @addEdgeSuccess="handleAddEdge"
      @deleteElementSuccess="handleDeleteElement"
      @updateGraph="hanleGraphUpdate"
      @deleteNode="handleDeleteNode"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useEditStore } from "../stores/edit.ts";
import GraphG6 from "@/components/GraphG6/index.vue";
import { Message } from "@arco-design/web-vue";
import { v4 as uuidv4 } from "uuid";
import apiClient from "@/services/apiClient";
const editStore = useEditStore();
const { sequence, nodes, edges, pdfPreviewUrl } = storeToRefs(editStore);
const graphData: any = ref({ nodes: [], edges: [], combos: [] }); //图数据，初始化为空数组，防止节点提前显示
const layoutConfig = ref(); // 布局类型配置
let graphInstance: any = null; //图实例
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
watch(
  [nodes, edges],
  ([newNodes, newEdges]) => {
    let node_data = [];
    let edges_data = [];

    // 创建节点映射，方便快速查找
    const nodeMap = new Map();

    newNodes.forEach((node) => {
      const nodeItem = {
        id: node.name,
        data: {
          name: node.name,
          description: "",
          entityType: node.label,
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
        const eid = "edge_" + uuidv4().toString();
        edges_data.push({
          id: eid,
          data: { name: edge.name },
          target: edge.to_node_name,
          source: edge.from_node_name,
          style: {
            lineDash: edge.lineStyle === "dashed" ? [5, 5] : undefined,
          },
        });
      } else {
        console.warn(
          `Skipping invalid edge: ${edge.name} (source: ${edge.from_node_name}, target: ${edge.to_node_name}) - one or both nodes not found`,
        );
      }
    });
    graphData.value.nodes = node_data;
    graphData.value.edges = edges_data;
    graphData.value.combos = [];
  },
  { deep: true },
);

// 不再需要监听sequence变化，因为我们现在使用全局图谱数据

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
    const getElementMethod =
      targetType === "node" ? "getNodeData" : "getEdgeData";
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
      edges: graphInstance.getEdgesData?.() || [],
      combos: graphInstance.getCombosData?.() || [],
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
    if (type === "node") {
      // 调用store的deleteNodeByName方法删除节点及其关联边
      editStore.deleteNodeByName(elementId);
    } else if (type === "edge") {
      // 查找并删除对应的边
      const edge = editStore.edges.find((e) => {
        // 生成唯一标识来匹配边
        const edgeKey = `${e.from_node_name}-${e.to_node_name}-${e.name}`;
        return elementId.includes(edgeKey);
      });
      if (edge) {
        editStore.deleteEdge(edge);
      }
    }
    Message.success(`${type === "node" ? "节点" : "边"}删除成功`);

    // 更新节点列表
    getAllNodeList();

    // 触发重新渲染
    if (graphInstance) {
      graphInstance.render();
    }
  } catch (error) {
    Message.error(error.message);
  }
};

const hanleGraphUpdate = async () => {
  // 触发重新渲染，确保图谱数据更新后视图能及时刷新
  if (graphInstance) {
    graphInstance.render();
  }
};

const handleDeleteNode = async (nodeName) => {
  try {
    // 删除节点及其关联边
    editStore.deleteNodeByName(nodeName);
    Message.success("节点删除成功");

    // 触发重新渲染
    if (graphInstance) {
      graphInstance.render();
    }
  } catch (error) {
    Message.error(error.message);
  }
};

// 获取全局图谱数据
const getGlobalGraph = async () => {
  const article = editStore.getArticleTitle();
  await useEditStore().queryGraphByArticle(article);
  // 不需要直接使用返回的graph_data，因为watch会自动处理nodes和edges的变化
  // 触发一次重新渲染确保数据更新
  if (graphInstance) {
    graphInstance.render();
  }
};

onMounted(() => {
  // 组件挂载时，获取全局图谱数据
  console.log("PDF预览URL:", pdfPreviewUrl.value);
  if (pdfPreviewUrl.value) {
    // PDF已加载，直接获取数据
    getGlobalGraph();
  } else {
    // 等待PDF加载完成
    const unwatch = watch(pdfPreviewUrl, (newVal) => {
      if (newVal) {
        getGlobalGraph();
        unwatch(); // 停止监听
      }
    });
  }
});

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
