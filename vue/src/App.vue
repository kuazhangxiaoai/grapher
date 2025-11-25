<template>
  <div class="graph-container relative w-full h-full px-0">
    <GraphG6
      ref="graphG6"
      :data="graphData"
      :layout-config="layoutConfig"
      @elementClick="handleElementClick"
      @ready="handleGraphReady"
      @shortestPath="handleShortestPath"
      @exportGraphCsv="handleExportGraphCsv"
      @addNodeSuccess="getAllNodeList"
      @addEdgeSuccess="getAllNodeList"
      @deleteElementSuccess="getAllNodeList"
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
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from "vue";
import GraphG6 from "@/components/GraphG6/index.vue";
import {
  generateMockData,
  generateAIKnowledgeGraph,
} from "@/components/GraphG6/mock";
import GraphElementInfo from "@/components/GraphG6/components/graphElementInfo.vue";
import GraphShortestPath from "@/components/GraphG6/components/graphShortestPath.vue";
import { Message } from "@arco-design/web-vue";
// 图数据
const graphData: any = ref({});
const graphG6 = ref(null);
let graphInstance = null;
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
  const updateMethod =
    elementTargetType.value === "node" ? "updateNodeData" : "updateEdgeData";
  try {
    const updateObj = {
      id: updatedData.id,
      data: updatedData.data,
      style: updatedData.style,
    };

    graphInstance.value[updateMethod]([updateObj]);
    Message.success("更新成功");
    // 更新最新的elementInfo
    elementInfo.value = {
      ...updatedData,
    };
    graphInstance.value.render();
  } catch (error) {
    // elementInfo数据回滚
    elementInfo.value = {
      ...oldData,
    };
    // 回滚画布信息
    graphInstance.value[updateMethod]([reverseObj]);
    console.error("更新数据失败:", error);
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
const getGraphDetail = async () => {
  // 用Promise模拟异步请求
  await new Promise((resolve) => setTimeout(resolve, 1000));
  graphData.value = generateMockData();
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
    graphInstance.value.setElementState(states);
    graphInstance.value.fitView();
    return;
  }

  // 设置搜索状态
  elements.forEach((element) => {
    states[element.id] = element.id === searchNode ? "highlight" : "inactive";
  });

  // 更新状态并聚焦
  graphInstance.value.setElementState(states);
  graphInstance.value.focusElement(searchNode, {
    duration: 300,
    easing: "ease-in-out",
  });

  // 延迟放大
  setTimeout(() => {
    graphInstance.value.zoomTo(1.5);
  }, 300);

  // 更新节点信息面板
  elementInfo.value = {
    ...graphInstance.value.getElementData(searchNode),
    style: { ...graphInstance.value.getElementRenderStyle(searchNode) },
  };
  activePanel.value = "elementInfo";
  elementTargetType.value = "node";
  expandElementInfoPanel.value = true;
};

const allNodeList: any = ref([]);
const newGraphData: any = ref({});
// 获取所有节点列表
const getAllNodeList = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  allNodeList.value = generateMockData().nodes || [];
  newGraphData.value = generateMockData();
};
onMounted(() => {
  getGraphDetail();
  getAllNodeList();
});
</script>

<style scoped>
.graph-container {
}
</style>
