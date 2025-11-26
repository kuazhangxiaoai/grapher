<template>
  <!-- 节点信息面板  -->
  <div
    v-if="visible"
    class="absolute bg-white top-0 w-[400px] right-0 z-10 shadow-md"
    style="height: calc(100% - 300px); border-right: 1px solid #e5e6eb"
  >
    <div
      class="flex items-center justify-between border-b border-gray-200 px-4 py-3"
    >
      <div class="font-medium text-[#1D2129] text-[16px] leading-[14px]">
        路径分析
        <span class="text-[14px] text-[#86909C]">查询两个节点的所有路径</span>
      </div>

      <div
        class="hover:bg-gray-200 w-6 h-6 flex justify-center items-center cursor-pointer transition-all duration-300 rounded-lg"
        @click="close"
      >
        <icon-close size="12px" />
      </div>
    </div>
    <div class="content p-4 overflow-y-auto" style="height: calc(100% - 49px)">
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="horizontal"
        class="mb-4"
        @submit="handleSubmit"
      >
        <a-form-item label="节点A" field="startNode">
          <a-select
            v-model="form.startNode"
            :style="{ width: '320px' }"
            placeholder="请输入节点A"
            allow-search
          >
            <a-option
              v-for="(item, index) in nodeList"
              :key="index"
              :value="item.id"
            >
              {{ item.data?.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="节点B" field="endNode">
          <a-select
            v-model="form.endNode"
            :style="{ width: '320px' }"
            placeholder="请输入节点B"
            allow-search
          >
            <a-option
              v-for="(item, index) in nodeList"
              :key="index"
              :value="item.id"
            >
              {{ item.data?.name }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="方向" field="direction">
          <a-radio-group v-model="form.direction">
            <a-radio value="forward">节点A-节点B</a-radio>
            <a-radio value="backward">不限方向</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-button type="primary" html-type="submit">路径分析</a-button>
      </a-form>
      <div class="pb-4 text-[#1D2129] font-medium text-[14px]">
        分析结果({{ pathList.length }})
      </div>
      <div class="mb-4" v-for="(item, index) in pathList" :key="index">
        <div class="text-[14px] text-[#165DFF] font-Regular mb-2">
          路径{{ index + 1 }}
        </div>
        <!-- 路径图 -->
        <div class="w-full h-[150px]">
          <div
            :id="`g6-graph-container-${index}`"
            class="g6-graph-container bg-white w-full h-full"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";
import {
  findAndHighlightShortestPath,
  findAndHighlightAllPaths,
} from "../utils.ts";
import { Graph } from "@antv/g6";
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  nodeList: {
    type: Array,
    default: () => [],
  },
  graphInstance: {
    type: Object,
    default: () => ({}),
  },
  newGraphData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:visible", "close"]);

const formRef = ref();
const form = ref({
  startNode: "",
  endNode: "",
  direction: "forward",
});
const rules = ref({
  startNode: [{ required: false, message: "请输入节点A" }],
  endNode: [{ required: false, message: "请输入节点B" }],
  direction: [{ required: false, message: "请选择方向" }],
});

const pathList = ref([]);
// 保存所有图表实例的引用
const graphInstances = ref([]);

// 关闭面板
const close = () => {
  emit("update:visible", false);
  emit("close");
};

const handleSubmit = async ({ values, errors }) => {
  if (!errors) {
    try {
      const { success, paths, edgePaths, completePaths } =
        await findAndHighlightAllPaths(
          props.graphInstance,
          props.newGraphData,
          form.value.startNode,
          form.value.endNode,
          form.value.direction === "forward"
        );
      if (success) {
        // 根据completePaths生成graph画布数据 node和edges,
        const pathGraph = completePaths.map(({ nodes, edges }) => ({
          nodes: props.graphInstance.getElementData(nodes),
          edges: props.graphInstance.getElementData(edges),
        }));
        pathList.value = JSON.parse(JSON.stringify(pathGraph)) || [];
        // 清除节点status
        pathList.value.map((item) => {
          item.nodes.map((node) => {
            node.states = [];
            node.style = {
              ...node.style,
              lineWidth: 1,
              fill: "#E8F3FF",
              stroke: "#165DFF",
              labelFill: "#165DFF",
            };
          });
          item.edges.map((edge) => {
            edge.states = [];
            edge.style = {
              ...edge.style,
              stroke: "#86909C",
              lineWidth: 1,
              labelFill: "#4E5969",
              labelWordWrap: true,
              labelMaxWidth: "80%",
              labelOffsetY: -4,
              labelTextBaseline: "bottom",
            };
          });
        });
        console.log("pathList", pathList.value);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

// 初始化图表
const initGraph = (data, containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const graph = new Graph({
    container: container,
    autoFit: "view",
    padding: 10,
    background: "#F7F8FA",
    data,
    node: {
      type: "rect",
      style: {
        size: (node) => {
          console.log("node", node, node.data.name.length * 4);
          return [80 + node.data.name.length * 4, 24];
        },
        radius: 4,
        labelText: (d) => d.data?.name || d.id,
        labelWordWrap: true, // enable label ellipsis
        labelMaxWidth: "90%",
        labelPlacement: "center",
        labelBackground: false,
      },
      // palette: {
      //   field: d => d.data?.cluster || d.cluster || "default"
      // }
    },
    edge: {
      type: "cubic-vertical",
      style: {
        endArrow: true,
        labelText: (d) => d.data?.name || "",
      },
    },
    layout: {
      type: "antv-dagre",
      rankdir: "LR",
      align: "UL",
    },
    behaviors: [
      // {
      //   type: "zoom-canvas",
      //   trigger: ["Control"] // 按住 Control 键同时滚动才能缩放
      // },
      "drag-canvas",
    ],
  });

  graph.render();
  return graph;
};

// 清理图表实例
const clearGraphInstances = () => {
  graphInstances.value.forEach((graph) => {
    if (graph) {
      graph.destroy();
    }
  });
  graphInstances.value = [];
};

// 监听pathList变化，渲染图表
watch(
  pathList,
  async (newPathList) => {
    if (newPathList.length > 0) {
      // 清理之前的图表实例
      clearGraphInstances();

      // 确保DOM已更新
      await nextTick();

      // 遍历创建图表
      newPathList.forEach((path, index) => {
        const containerId = `g6-graph-container-${index}`;
        const graph = initGraph(path, containerId);
        if (graph) {
          graphInstances.value.push(graph);
        }
      });
    }
  },
  { deep: true }
);

// 监听visible变化，处理面板显示/隐藏时的清理工作
watch(
  () => props.visible,
  (newVisible) => {
    if (!newVisible) {
      clearGraphInstances();
      pathList.value = [];
    }
  }
);

// 组件卸载时清理资源
onMounted(() => {
  // 组件挂载后的初始化
});
</script>

<style scoped lang="scss"></style>
