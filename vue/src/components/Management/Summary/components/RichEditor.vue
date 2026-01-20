<template>
  <div 
    class="rich-editor"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
  >
    <div 
      v-if="disabled && !modelValue"
      class="flex items-center justify-center h-64 text-gray-400"
    >
      请选择文章或分组进行总结
    </div>
    <div v-else class="graph-panel">
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
        @updateGraph="hanleGraphUpdate"
        @deleteNode="handleDeleteNode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useEditStore } from "@/stores/edit.ts";
import GraphG6 from "@/components/GraphG6/index.vue";
import { Message } from "@arco-design/web-vue";
import { v4 as uuidv4 } from "uuid";

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const editStore = useEditStore();
const { sequence, nodes, edges } = storeToRefs(editStore);
const graphData: any = ref({ nodes: [], edges: [], combos:[] });
const layoutConfig = ref();
let graphInstance: any = null;
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

const handleElementClick = (element, targetType) => {
  console.log('Element clicked:', element, targetType);
};

const handleGraphReady = (graph) => {
  graphInstance = graph;
  graphInstance.getData = () => {
    return {
      nodes: graphInstance.getNodesData?.() || [],
      edges: graphInstance.getEdgesData?.() || [],
      combos: graphInstance.getCombosData?.() || []
    };
  };
};

const handleShortestPath = () => {
  console.log('Shortest path requested');
};

const handleExportGraphCsv = async () => {
  console.log('Export graph CSV requested');
};

const handleAddNode = async (nodeData) => {
  try {
    Message.success("节点创建成功");
  } catch (error) {
    Message.error(error.message);
  }
};

const handleAddEdge = async (edgeData) => {
  try {
    Message.success("边创建成功");
  } catch (error) {
    Message.error(error.message);
  }
};

const handleDeleteElement = async (elementId, type) => {
  try {
    if (type === "node") {
      editStore.deleteNodeByName(elementId);
    } else if (type === "edge") {
      const edge = editStore.edges.find(e => {
        const edgeKey = `${e.from_node_name}-${e.to_node_name}-${e.name}`;
        return elementId.includes(edgeKey);
      });
      if (edge) {
        editStore.deleteEdge(edge);
      }
    }
    Message.success(`${type === "node" ? "节点" : "边"}删除成功`);
    
    if (graphInstance) {
      graphInstance.render();
    }
  } catch (error) {
    Message.error(error.message);
  }
};

const hanleGraphUpdate = async () => {
  if (graphInstance) {
    graphInstance.render();
  }
};

const handleDeleteNode = async (nodeName) => {
  try {
    editStore.deleteNodeByName(nodeName);
    Message.success("节点删除成功");
    
    if (graphInstance) {
      graphInstance.render();
    }
  } catch (error) {
    Message.error(error.message);
  }
};

watch([nodes, edges], ([newNodes, newEdges]) => {
  let node_data = [];
  let edges_data = [];
  
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
    if (nodeMap.has(edge.from_node_name) && nodeMap.has(edge.to_node_name)) {
      const eid = "edge_" + uuidv4().toString();
      edges_data.push({
        id: eid,
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
  graphData.value.combos = [];
}, { deep: true });

watch(sequence, (newSeq) => {
  if (newSeq && editStore.article) {
    editStore.queryGraphBySeq(newSeq);
  }
});

onMounted(() => {
  if (editStore.article && sequence.value) {
    editStore.queryGraphBySeq(sequence.value);
  }
});
</script>

<style scoped>
.rich-editor {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  width: 100%;
  height: 100%;
}

.graph-panel {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>