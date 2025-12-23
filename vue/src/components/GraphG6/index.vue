<template>
  <div
    ref="container"
    class="g6-graph-container bg-white"
    :style="containerStyle"
  >
    <CustomToolbar
      :graph="graph"
      :showToolbar="showToolbar"
      :layoutConfig="layoutConfig"
      :zoomLevel="zoomLevel"
      :enables="enableObject"
      @shortestPath="handleShortestPath"
      @exportGraphCsv="handleExportGraphCsv"
    />
  </div>

  <node-add-modal
    v-model="openNodeAddModal"
    @confirm="handleNodeOk"
    @cancel="handleNodeCancel"
  />
  <edge-add-modal
    v-model="openEdgeNameModal"
    @confirm="handleEdgeOk"
    @cancel="handleEdgeCancel"
  />
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  watch,
  computed,
  onBeforeUnmount,
  nextTick,
  provide,
  shallowRef,
} from "vue";
import {
  Graph,
  GraphData,
  LayoutOptions,
  ExtensionCategory,
  register,
  CanvasEvent,
} from "@antv/g6";
import { ClickAddNode } from "./customBehavior/clickAddNode";
import CustomToolbar from "./components/customToolbar.vue";
import NodeAddModal from "./components/nodeAddIModal.vue";
import EdgeAddModal from "./components/edgeAddModal.vue";
import { CanvasMenuPlugin } from "./customPlugins/canvasMenu";
import { canCreateEdge } from "./utils";
import type {Edge} from "@/types/edges.ts";
import { Message, Modal } from "@arco-design/web-vue";
import {useEditStore} from "../../stores/edit.ts";

// 注册交互;
register(ExtensionCategory.BEHAVIOR, "click-add-node", ClickAddNode);
// 注册插件;
register(ExtensionCategory.PLUGIN, "canvas-menu", CanvasMenuPlugin);

// 定义组件的属性
const props = defineProps({
  // 容器尺寸
  width: {
    type: [String, Number],
    default: "100%",
  },
  height: {
    type: [String, Number],
    default: "100%",
  },
  // 图数据
  data: {
    type: Object as () => GraphData,
    default: () => ({ nodes: [], edges: [] }),
  },
  // 是否自适应视图
  fitView: {
    type: Boolean,
    default: true,
  },
  // 是否显示工具栏
  showToolbar: {
    type: Boolean,
    default: true,
  },

  // 布局类型配置
  layoutConfig: {
    type: Object as () => LayoutOptions,
    default: () => ({}),
  },

  //选择功能
  enableObject:{
    type: Object,
    default: () => ({
      zoomOut: true,
      zoomReset: true,
      zoomIn: true,
      mouseMode: true,
      dragMode: true,
      shortestPath: true,
      downImage: true,
      layout: true,
      undo: true,
      redo: true,
      commit: false,
      close: true,
    }),
  }
});

// G6实例引用
const graph = shallowRef(null);

// DOM容器引用
const container = ref<HTMLElement | null>(null);

// 提供数据给后代组件
provide("graphData", props.data);
provide("graphInstance", graph);
// 定义事件
const emit = defineEmits([
  "elementClick",
  "ready",
  "addEdge",
  "shortestPath",
  "exportGraphCsv",
  "addNodeSuccess",
  "addEdgeSuccess",
  "deleteElementSuccess",
]);

const zoomLevel = ref(100);
// 计算容器样式
const containerStyle = computed(() => ({
  width: typeof props.width === "number" ? `${props.width}px` : props.width,
  height: typeof props.height === "number" ? `${props.height}px` : props.height,
}));

// 添加节点模态框
const openNodeAddModal = ref(false);
const currentNodeId = ref("");

// 添加连线名称的模态框
const openEdgeNameModal = ref(false);
const currentEdge = ref();

// 初始化图实例
const initGraph = () => {
  if (!container.value) return;

  // 创建图实例 - 修改配置，适配G6 V5
  graph.value = new Graph({
    container: container.value,
    data: props.data,
    padding: 20,
    // animation: true,
    node: {
      style: {
        size: (d) => {
          if (d.style.size) return d.style.size;
          // 获取当前节点的关联边数量
          const edgeCount = graph.value.getRelatedEdgesData(d.id).length;
          // 设定最小/最大size，防止太大或太小
          const minSize = 30;
          const maxSize = 100;
          // 计算size，假设每多一条边+8像素
          let size = minSize + edgeCount * 8;
          if (size > maxSize) size = maxSize;
          return size;
        },
        labelText: (d) => d.data.name,
        ports: [],
        iconRadius: 100,
        iconWidth: (w) => Number(w?.style?.size) + 2,
        iconHeight: (h) => Number(h?.style?.size) + 2,
        // labelOffsetY: 4,
        labelBackground: true,
        labelBackgroundPadding: [2, 2, 2, 2],
        labelBackgroundFill: "#fff",
        labelBackgroundOpacity: 0.8,
        labelOffsetY: 4,
        labelWordWrap: true,
        labelMaxWidth: 200,
        labelMaxLines: 4,
        // 根据节点类型动态设置颜色
        fill: (d) => {
          try {
            const stored = localStorage.getItem('nodeTypes');
            if (stored) {
              const nodeTypes = JSON.parse(stored);
              const entityType = d.data.entityType || '默认';
              const type = nodeTypes.find((t: any) => t.name === entityType);
              if (type) {
                return type.color;
              }
            }
            // 默认颜色映射
            const defaultColors: Record<string, string> = {
              '默认': '#1783FF',
              '人物': '#F53F3F',
              '组织': '#722ED1',
              '概念': '#52C41A',
              '事件': '#FAAD14'
            };
            return defaultColors[d.data.entityType || '默认'] || '#1783FF';
          } catch (error) {
            console.error('获取节点颜色失败:', error);
            return '#1783FF';
          }
        },
      },
      palette: {
        type: "group",
        field: "entityType",
      },
    },
    edge: {
      style: {
        label: true,
        labelAutoRotate: true,
        labelText: (edge) => edge.data.name || "",
        endArrow: true,
        labelWordWrap: true, // enable label ellipsis
        labelPlacement: "center",
        labelMaxWidth: "80%",
        labelMaxLines: 4,
        labelBackground: true,
        labelBackgroundPadding: [2, 2, 2, 2],
        labelBackgroundFill: "#fff",
        labelBackgroundStroke: "#000",
        labelBackgroundStrokeWidth: 1,
        labelBackgroundOpacity: 0.8,
      },
    },
    layout:
      // 判空处理
      Object.keys(props.layoutConfig).length === 0
        ? {
            type: "force",
            charge: 20, // 节点间排斥力相关参数
            preventOverlap: true,
            onLayoutEnd: () => {
              console.log("知识图谱布局完成");
            },
          }
        : props.layoutConfig,

    behaviors: [
      "zoom-canvas",
      {
        type: "drag-element",
        key: "drag-element",
      },
      {
        type: "drag-canvas",
        key: "drag-canvas",
      },
      {
        type: "brush-select",
        key: "brush-select",
        immediately: true, // 可以看到框框笼罩过去时，元素立即被框选了
        trigger: [], // 配合多种按键进行框选, // 不需要配合其他按键，点击鼠标拖动即可框选
        enable: false,
      },
      {
        type: "click-select",
        key: "click-select-1",
        degree: 0, // 选中扩散范围
        state: "active", // 选中的状态
        // unselectedState: "inactive",
        // neighborState: "neighborSelected", // 相邻节点附着状态
        multiple: false,
        trigger: [],
        onClick: (event) => {
          const { targetType, target } = event;
          if (targetType == "node" || targetType == "edge") {
            emit("elementClick", target, targetType);
          } else if (targetType == "canvas") {
            graph.value.render();
            emit("elementClick", null, targetType);
          }
        },
      },
      {
        type: "create-edge",
        key: "create-edge",
        trigger: "click",
        enable: false,
        style: {
          lineWidth: 1,
        },
      },
      // {
      //   type: "auto-adapt-label",
      //   throttle: 200, // 节流时间
      //   padding: 10 // 检测重叠时的额外间距
      // }
    ],
    autoResize: true,
    // zoomRange: [0.1, 1],
    plugins: [
      {
        type: "history",
        key: "history",
      },
      {
        type: "fullscreen",
        key: "fullscreen",
      },
      // 画布右键菜单插件
      {
        type: "canvas-menu",
        key: "canvas-menu",
        nodeFill: "#1783FF",
        menuBackground: "#FFFFFF",
        menuTextColor: "#333333",
        menuHoverBackground: "#F5F5F5",
        onShowNodeModal: (nodeId) => {
          // 保存当前节点ID并显示模态框
          currentNodeId.value = nodeId;
          openNodeAddModal.value = true;
        },
      },
      // 右键菜单
      {
        type: "contextmenu",
        trigger: "contextmenu", // 'click' or 'contextmenu'
        onClick: (value, target, current) => {
          if (value == "deleteNode") {
            handleDeleteNode(current);
          }
          if(current == null) {
            return;
          }
          if (value == "addEdge" && current.type == "node") {
            graph.value.updateBehavior({
              key: "create-edge",
              enable: (event) => {
                console.log(event);
                return event.targetType == "node"; // 在节点上启用连接
              },
              onFinish: (edge) => {
                const canCreate = canCreateEdge(
                  graph.value,
                  edge.source,
                  edge.target
                );
                if (!canCreate) {
                  // 如果验证不通过,删除已创建的边
                  graph.value.removeEdgeData([edge.id]);
                  if (edge.source === edge.target) {
                    Message.warning("节点不能连接自己");
                  } else {
                    Message.warning("已存在连线,不能重复创建");
                  }
                  return;
                }
                openEdgeNameModal.value = true;
                currentEdge.value = edge;
              },
            });
            nextTick(() => {
              // 触发 node:click 事件
              graph.value.emit("node:click", {
                target: current,
                targetType: "node",
                item: current,
                itemType: "node",
              });
            });
          }
        },
        getItems: () => {
          return [
            {
              name: `<i class="iconfont icon-lujing text-[14px] mr-2 pointer-events-none"></i>添加连线`,
              value: "addEdge",
            },
            {
              name: "<i class='iconfont icon-delete1 text-[14px] mr-2 pointer-events-none'></i>删除",
              value: "deleteNode",
            },
          ];
        },
        enable: (e) => e.targetType === "node" || e.targetType === "edge",
      },
    ],
    transforms: ["process-parallel-edges"],
  });

  // 渲染图
  graph.value.render();

  // 获取缩放级别
  // 自适应视图
  if (props.fitView) {
    graph.value.fitView();
  }
  // 触发就绪事件
  emit("ready", graph);
};
// ** 节点相关 **

// 节点添加模态框的确认和取消处理
const handleNodeOk = async (nodeData) => {
  // 获取自定义插件实例
  const menuPlugin = graph.value.getPluginInstance("canvas-menu");
  if (menuPlugin) {
    // 添加额外接口
    try {
      // 1. 先更新节点数据
      menuPlugin.updateNodeData(currentNodeId.value, nodeData);
      menuPlugin.clearTempNodeId();
      Message.success("添加节点成功");
      //emit("addNodeSuccess");
    } catch (error) {
      console.error("添加节点失败:", error);
      menuPlugin.cancelAddNode();
    }
  }
};

const handleNodeCancel = () => {
  // 获取自定义插件实例
  const menuPlugin = graph.value.getPluginInstance("canvas-menu");
  if (menuPlugin) {
    // 取消添加节点
    menuPlugin.cancelAddNode();
  }
};

// 删除节点
const handleDeleteNode = async (target) => {
  if(!target){return;}

  const elementData = graph.value.getElementData(target.id);

  try {
    // 二次弹框
    Modal.warning({
      title: target.type == "node" ? "删除节点" : "删除连线",
      content: `即将${target.type == "node" ? "删除节点" : "删除连线"}【${
        elementData.data.name
      }】，请谨慎操作!`,
      bodyClass: "text-center",
      hideCancel: false,
      closable: true,
      okButtonProps: {
        style: {
          backgroundColor: "#F53F3F!important",
          borderColor: "#F53F3F!important",
        },
      },

      onBeforeOk: (done) => {
        if (target.type == "node") {
          useEditStore().deleteNodeByName(elementData.id)
          graph.value.removeNodeData([elementData.id]);
        } else {
          // 删除边时也需要从store中删除
          const edgeData = graph.value.getEdgeData(target.id);
          if (edgeData) {
            const editStore = useEditStore();
            // 找到对应的边并删除
            const edgeToDelete = editStore.edges.find(edge => 
              edge.name === elementData.data.name &&
              edge.from_node_name === edgeData.source &&
              edge.to_node_name === edgeData.target
            );
            if (edgeToDelete) {
              editStore.deleteEdge(edgeToDelete);
            }
          }
          graph.value.removeEdgeData([elementData.id]);
        }

        done(true);
        emit("deleteElementSuccess", elementData.id, target.type);
        graph.value.render();
      },
    });
  } catch (err) {
    console.error("删除节点失败:", err);
  } finally {
  }
};

// ** 连线相关 **

// 添加连线名称的模态框
const handleEdgeOk = async (value) => {
  // 删除旧的连线,因id不一致
  graph.value.removeEdgeData([currentEdge.value.id]);
  // 添加新的连线
  const eid = "edge_" + new Date().getTime()
  graph.value.addEdgeData([
    {
      ...currentEdge.value,
      id: eid,
      data: { name: value.name },
    },
  ]);
  const edgeData = graph.value.getEdgeData(eid)
  const sourceNode = graph.value.getNodeData(edgeData.source);
  const targetNode = graph.value.getNodeData(edgeData.target);
  const edge: Edge = {
    name: value.name,
    from_node_name: sourceNode.data.name,
    from_node_label: sourceNode.data.entityType,
    to_node_name: targetNode.data.name,
    to_node_label: targetNode.data.entityType,
    sequence: useEditStore().sequence,
    article: useEditStore().getArticleTitle()
  }
  useEditStore().addEdge(edge)
  Message.success("添加连线成功");

  graph.value.render();
  graph.value.updateBehavior({
    key: "create-edge",
    enable: false,
  });
};

const handleEdgeCancel = () => {
  graph.value.removeEdgeData([currentEdge.value.id]);
  graph.value.render();
  graph.value.updateBehavior({
    key: "create-edge",
    enable: false,
  });
};

// 最短路径
const handleShortestPath = () => {
  // 将事件传递给父组件
  emit("shortestPath");
};

// 导出三元组CSV
const handleExportGraphCsv = () => {
  emit("exportGraphCsv");
};

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    if (graph.value && newData) {
      // 1. 停止当前布局计算
      if (graph.value.stopLayout) {
        graph.value.stopLayout();
      }
      graph.value.setData(newData); // 使用setData替代data方法
      graph.value.render();
      graph.value.once("afterrender", () => {
        graph.value.fitView();
        // graph.value.zoomBy(0.9);
      });
    }
  },
  { deep: true }
);

// 组件挂载时初始化图
onMounted(() => {
  useEditStore().getAllNodeTypes()
  nextTick(() => {
    initGraph();
    setTimeout(() => {
      useEditStore().initProject()
      let project_name = useEditStore().project
      if (!project_name) {
        project_name = localStorage.getItem("grapher-project");
        useEditStore().setProjectName(project_name);
      }

      if (props.fitView) {
        graph.value.fitView();
      }

      graph.value.layout();
      graph.value.render();
    },100)

  });
});

// 在组件卸载前清理资源
onBeforeUnmount(() => {
  if (graph.value) {
    graph.value.destroy();
    graph.value = null;
  }
});

// 对外暴露图实例获取方法
defineExpose({
  getGraph: () => graph.value,
});
</script>

<style scoped lang="scss">
.g6-graph-container {
  width: 100%;
  height: 100% !important;
  position: relative;
  // 右键菜单的样式
  :deep(.g6-contextmenu-ul) {
    padding: 4px 0;
    .g6-contextmenu-li {
      padding: 6px 12px;
      cursor: pointer;
      font-size: 14px;
      color: rgb(51, 51, 51);
      display: flex;
      align-items: center;
    }
  }
}
</style>
