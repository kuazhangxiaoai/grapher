<template>
  <div class="home-container relative w-full h-full flex">
    <!-- 顶部导航栏 -->
    <div class="home-header">
      <a-button @click="handleBack" type="primary" size="small">
        返回列表
      </a-button>
    </div>
    <!-- 左侧文档区域 -->
    <DocumentPanel @addNode="handleAddNodeFromDocument" />
    <!-- 右侧图谱画布区域 -->
    <div class="graph-container relative w-3/5 h-full">
      <GraphG6
        ref="graphG6"
        :data="graphData"
        :layout-config="layoutConfig"
        :enableObject="enableObj"
        :readOnly="false"
        :showContextMenu="false"
        @elementClick="handleElementClick"
        @ready="handleGraphReady"
        @shortestPath="handleShortestPath"
        @exportGraphCsv="handleExportGraphCsv"
        @addNodeSuccess="handleAddNode"
        @addEdgeSuccess="handleAddEdge"
        @deleteElementSuccess="handleDeleteElement"
      />

      <!-- 节点信息面板 -->
      <graph-element-info
        v-if="activePanel === 'elementInfo'"
        v-model="expandElementInfoPanel"
        :graph-instance="graphInstance"
        :element-info="elementInfo"
        :element-target-type="elementTargetType"
        @updateElementInfo="handleUpdateElementInfo"
      >
      </graph-element-info>

      <!-- 最短路径 -->
      <graph-shortest-path
        v-if="activePanel === 'shortestPath'"
        v-model:visible="showShortestPath"
        :nodeList="allNodeList"
        :newGraphData="newGraphData"
        :graph-instance="graphInstance"
        @close="activePanel = null"
      />
    </div>
    <!--中间编辑区-->
    <div v-if="editGraph" class="graph-editor">
      <Editor></Editor>
    </div>
    <!-- <div v-if="fileList" class="file-list"> -->
      <!-- 文件列表 -->
    <FileList></FileList>
    <!-- </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from "vue";
import { useRoute, useRouter } from 'vue-router';
import GraphG6 from "@/components/GraphG6/index.vue";
import {
  generateMockData,
  generateAIKnowledgeGraph,
} from "@/components/GraphG6/mock";
import GraphElementInfo from "@/components/GraphG6/components/graphElementInfo.vue";
import GraphShortestPath from "@/components/GraphG6/components/graphShortestPath.vue";
import DocumentPanel from "./Pdf/DocumentPanel.vue";
import { Message } from "@arco-design/web-vue";
import Editor from "./Editor.vue";
import {storeToRefs} from "pinia";
import {useEditStore} from "@/stores/edit.ts";
import {useUserStore} from "@/stores/user.ts";
import FileList from "./FileList.vue";
import axios from "axios";
// import { getGraphData, updateNode, updateEdge, deleteElement, createNode, createEdge } from '@/services/graphApi';

const route = useRoute();
const router = useRouter();
const editStore = useEditStore();
const userStore = useUserStore();
const project = localStorage.getItem("grapher-project");
useEditStore().getAllFileInfoList(project);
const {editGraph, fileList, article, committing} = storeToRefs(editStore);

// 返回列表页面
const handleBack = () => {
  editStore.closeFileList() //关闭文件列表
  editStore.resetState() // 重置store状态，确保下次进入画布页面显示新项目内容
  router.push('/list');
};
// 图数据
const graphData: any = ref({});
const graphG6 = ref(null);
let graphInstance = null;

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
  close: false,
})

// 图实例初始化完成后的回调
const handleGraphReady = (graph) => {
  graphInstance = graph;
};

// 当前激活的面板
const activePanel = ref(null); // 'elementInfo' | 'shortestPath' | null

// 是否显示节点信息弹窗
const expandElementInfoPanel = ref(false);
const showShortestPath = ref(false);
// 布局类型配置
const layoutConfig = ref();
const elementInfo: any = ref({});
const elementTargetType = ref("node");

// 元素点击事件处理
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

    let states = {};
    const elements = [...graphData.value.nodes, ...graphData.value.edges];

    // 清空搜索状态
    elements.forEach((element) => {
      states[element.id] = "";
    });
    graphInstance.setElementState(states);
  }
};

// 更新元素信息的方法
const handleUpdateElementInfo = async (updatedData) => {
  if (!updatedData?.id) return;

  const oldData = {
    ...elementInfo.value,
  };
  const reverseObj = {
    id: oldData.id,
    data: oldData.data,
    style: oldData.style,
  };

  // 优先修改画布信息
  const updateMethod = elementTargetType.value === 'node' ? 'updateNodeData' : 'updateEdgeData';
  try {
    // 调用API更新到后端
    // if (elementTargetType.value === 'node') {
    //   await updateNode(updatedData.id, updatedData);
    // } else {
    //   await updateEdge(updatedData.id, updatedData);
    // }

    graphInstance[updateMethod]([updatedData]);
    Message.success('更新成功');
    // 更新最新的elementInfo
    elementInfo.value = {
      ...updatedData,
    };
    graphInstance.render();
  } catch (error) {
    // elementInfo数据回滚
    elementInfo.value = {
      ...oldData,
    };
    // 回滚画布信息
    graphInstance[updateMethod]([reverseObj]);
    Message.error(error.message || '更新数据失败');
  }
};

// 处理点击最短路径按钮
const handleShortestPath = () => {
  // 设置当前激活面板为路径分析面板
  activePanel.value = "shortestPath";
  showShortestPath.value = true;
};

// 处理导出三元组CSV
const handleExportGraphCsv = async () => {
  console.log("handleExportGraphCsv");
};

// 监听节点信息面板关闭
watch(expandElementInfoPanel, (newValue) => {
  if (!newValue) {
    activePanel.value = null;
  }
});

// 监听最短路径面板关闭
watch(showShortestPath, (newValue) => {
  if (!newValue) {
    activePanel.value = null;
  }
});

// 获取数据详情
const getGraphDetail = async (project) => {
  try {
     //graphData.value = await getGraphData(graphId);
    const article = editStore.getArticleTitle()
    const sequence = editStore.getSequence()
    console.log(article)
    console.log(project)
    if (article === null && sequence === null){
      axios.get("/api/graph/getGlobalGraph", {params: {project: project}}).then((res) => {
        let graph_data = {
          nodes: [],
          edges: [],
        }
        res.data.nodes.forEach((node) => {
          graph_data.nodes.push({
            id: node.name,
            data: {
              name: node.name,
              description: "",
              entityType: node.label || "默认",
            },
            style: {
              labelText: node.name,
              fill: node.color,
            },
          });
        })
        res.data.edges.forEach((edge, index) => {
          graph_data.edges.push({
            id: "edge-" + index.toString(),
            data: {name: edge.name},
            target: edge.to_node_name,
            source: edge.from_node_name,
          })
        })
        graphData.value.edges = graph_data.edges;
        graphData.value.nodes = graph_data.nodes;
      })
    }
   } catch (error) {
     Message.error(error.message);
    // 出错时使用模拟数据兜底
    //graphData.value = generateMockData();
   }
};

// 处理搜索节点
const handleSearchNode = (searchNode) => {
  const states = {};
  const elements = [...graphData.value.nodes, ...graphData.value.edges];

  if (!searchNode) {
    // 清空搜索状态
    elements.forEach((element) => {
      states[element.id] = "";
    });
    graphInstance.setElementState(states);
    graphInstance.fitView();
    return;
  }

  // 设置搜索状态
  elements.forEach((element) => {
    states[element.id] = element.id === searchNode ? "highlight" : "inactive";
  });

  // 更新状态并聚焦
  graphInstance.setElementState(states);
  graphInstance.focusElement(searchNode, {
    duration: 300,
    easing: "ease-in-out",
  });

  // 延迟放大
  setTimeout(() => {
    graphInstance.zoomTo(1.5);
  }, 300);

  // 更新节点信息面板
  elementInfo.value = {
    ...graphInstance.getNodeData(searchNode),
    // G6 V5 中不需要手动获取样式，样式会自动从数据中提取
  };
  activePanel.value = "elementInfo";
  elementTargetType.value = "node";
  expandElementInfoPanel.value = true;
};

const allNodeList: any = ref([]);
const newGraphData: any = ref({});
// 获取所有节点列表
const getAllNodeList = async (graphId?: string) => {
  // try {
  //   const data = await getGraphData(graphId);
  //   allNodeList.value = data.nodes || [];
  //   newGraphData.value = data;
  // } catch (error) {
  //   Message.error(error.message);
    // 出错时使用模拟数据兜底
    const mockData = generateMockData();
    allNodeList.value = mockData.nodes || [];
    newGraphData.value = mockData;
  // }
};

// 监听路由变化，更新图谱数据
watch(() => route.params.id || route.query.graphId, (newGraphId) => {
  const project = localStorage.getItem("grapher-project");
  // 重置graphData状态，确保每次进入画布页面都显示当前项目的初始状态
  graphData.value = { nodes: [], edges: [] };
  getGraphDetail(project as string);
  getAllNodeList(newGraphId as string);
});

watch(committing, async (newValue) => {
  if (newValue) {
    const article = useEditStore().article
    const graph_data = await useEditStore().queryGraphByArticle(article);
    graphData.value.nodes = graph_data.nodes;
    graphData.value.edges = graph_data.edges;
    useEditStore().setCommiting(false);
  }
})

watch(article, async (newVal) => {
  if(newVal) {
    const graph_data = await useEditStore().queryGraphByArticle(newVal);
    graphData.value.nodes = graph_data.nodes;
    graphData.value.edges = graph_data.edges;
  }else{
    graphData.value = {}
  }
})

onMounted(() => {
  const graphId = route.params.id || route.query.graphId;
  const project = localStorage.getItem("grapher-project");
  getGraphDetail(project as string);
  getAllNodeList(graphId as string);
});
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

// 处理从文档添加节点到图谱
const handleAddNodeFromDocument = (nodeData) => {
  // 确保graphData有nodes数组
  if (!graphData.value.nodes) {
    graphData.value.nodes = [];
  }
  if (!graphData.value.edges) {
    graphData.value.edges = [];
  }
  
  // 添加新节点
  graphData.value.nodes.push(nodeData);
  
  // 更新节点列表
  allNodeList.value.push(nodeData);
  
  // 如果是第一个节点，初始化图谱数据
  if (graphData.value.nodes.length === 1) {
    newGraphData.value = { ...graphData.value };
  }
  
  // 更新图谱数据
  newGraphData.value = { ...graphData.value };
  
  console.log('从文档添加节点到图谱:', nodeData);
};

</script>

<style scoped>
.home-container {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #f5f7fa;
  position: relative;
}

.home-header {
  position: absolute;
  top: 0px;
  right:53%;
  z-index: 100;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.graph-editor{
  position: absolute;
  left: 42%;
  top: 15%;
  width: 50%;
  height: 50%;
  border-color: #2d3748;
  border-width: 2px;
  border-radius: 2px
}

.graph-container {
  /* width: 100%; */
  height: 100%;
  position: relative;
  overflow: hidden;
}


</style>