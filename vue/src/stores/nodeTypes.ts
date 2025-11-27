import { ref, reactive } from 'vue';

// 节点类型接口
export interface NodeType {
  id: string;
  name: string;
  color: string;
}

// 默认节点类型列表
const defaultNodeTypes: NodeType[] = [
  { id: '1', name: '默认', color: '#1783FF' },
  { id: '2', name: '人物', color: '#F53F3F' },
  { id: '3', name: '组织', color: '#722ED1' },
  { id: '4', name: '概念', color: '#52C41A' },
  { id: '5', name: '事件', color: '#FAAD14' }
];

// 节点类型管理组合式函数
export function useNodeTypesStore() {
  // 从localStorage加载节点类型，如果没有则使用默认值
  const loadNodeTypes = (): NodeType[] => {
    const stored = localStorage.getItem('nodeTypes');
    return stored ? JSON.parse(stored) : defaultNodeTypes;
  };

  // 保存节点类型到localStorage
  const saveNodeTypes = (types: NodeType[]) => {
    localStorage.setItem('nodeTypes', JSON.stringify(types));
  };

  // 节点类型列表
  const nodeTypes = ref<NodeType[]>(loadNodeTypes());

  // 添加节点类型
  const addNodeType = (type: Omit<NodeType, 'id'>) => {
    const newType: NodeType = {
      ...type,
      id: Date.now().toString()
    };
    nodeTypes.value.push(newType);
    saveNodeTypes(nodeTypes.value);
    return newType;
  };

  // 删除节点类型
  const deleteNodeType = (id: string) => {
    nodeTypes.value = nodeTypes.value.filter(type => type.id !== id);
    saveNodeTypes(nodeTypes.value);
  };

  // 更新节点类型
  const updateNodeType = (id: string, updates: Partial<NodeType>) => {
    const index = nodeTypes.value.findIndex(type => type.id === id);
    if (index !== -1) {
      nodeTypes.value[index] = { ...nodeTypes.value[index], ...updates };
      saveNodeTypes(nodeTypes.value);
    }
  };

  // 根据类型名称获取节点类型
  const getNodeTypeByName = (name: string): NodeType | undefined => {
    return nodeTypes.value.find(type => type.name === name);
  };

  // 根据类型ID获取节点类型
  const getNodeTypeById = (id: string): NodeType | undefined => {
    return nodeTypes.value.find(type => type.id === id);
  };

  return {
    nodeTypes,
    addNodeType,
    deleteNodeType,
    updateNodeType,
    getNodeTypeByName,
    getNodeTypeById
  };
}
