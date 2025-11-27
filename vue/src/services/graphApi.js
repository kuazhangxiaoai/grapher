import apiClient from './apiClient';

/**
 * 获取完整的图形数据
 * @param {string} graphId - 图谱ID（可选）
 */
export const getGraphData = async (graphId) => {
  try {
    const url = graphId ? `/graph/${graphId}` : '/graph';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('获取图形数据失败:', error);
    throw new Error('获取图形数据失败，请重试');
  }
};

/**
 * 获取图谱列表
 */
export const getGraphList = async () => {
  try {
    const response = await apiClient.get('/graphs');
    return response.data;
  } catch (error) {
    console.error('获取图谱列表失败:', error);
    throw new Error('获取图谱列表失败，请重试');
  }
};

/**
 * 创建新图谱
 * @param {Object} graphData - 图谱数据
 */
export const createGraph = async (graphData) => {
  try {
    const response = await apiClient.post('/graphs', graphData);
    return response.data;
  } catch (error) {
    console.error('创建图谱失败:', error);
    throw new Error('创建图谱失败，请重试');
  }
};

/**
 * 删除图谱
 * @param {string} graphId - 图谱ID
 */
export const deleteGraph = async (graphId) => {
  try {
    await apiClient.delete(`/graphs/${graphId}`);
    return true;
  } catch (error) {
    console.error('删除图谱失败:', error);
    throw new Error('删除图谱失败，请重试');
  }
};

/**
 * 创建新节点
 * @param {Object} nodeData - 节点数据
 */
export const createNode = async (nodeData) => {
  try {
    const response = await apiClient.post('/nodes', nodeData);
    return response.data;
  } catch (error) {
    console.error('创建节点失败:', error);
    throw new Error('创建节点失败，请重试');
  }
};

/**
 * 更新节点信息
 * @param {string} nodeId - 节点ID
 * @param {Object} nodeData - 更新后的节点数据
 */
export const updateNode = async (nodeId, nodeData) => {
  try {
    const response = await apiClient.put(`/nodes/${nodeId}`, nodeData);
    return response.data;
  } catch (error) {
    console.error('更新节点失败:', error);
    throw new Error('更新节点失败，请重试');
  }
};

/**
 * 创建新边
 * @param {Object} edgeData - 边数据
 */
export const createEdge = async (edgeData) => {
  try {
    const response = await apiClient.post('/edges', edgeData);
    return response.data;
  } catch (error) {
    console.error('创建边失败:', error);
    throw new Error('创建边失败，请重试');
  }
};

/**
 * 更新边信息
 * @param {string} edgeId - 边ID
 * @param {Object} edgeData - 更新后的边数据
 */
export const updateEdge = async (edgeId, edgeData) => {
  try {
    const response = await apiClient.put(`/edges/${edgeId}`, edgeData);
    return response.data;
  } catch (error) {
    console.error('更新边失败:', error);
    throw new Error('更新边失败，请重试');
  }
};

/**
 * 删除元素（节点或边）
 * @param {string} elementId - 元素ID
 * @param {string} type - 元素类型：'node' 或 'edge'
 */
export const deleteElement = async (elementId, type) => {
  try {
    await apiClient.delete(`/${type}s/${elementId}`);
    return true;
  } catch (error) {
    console.error(`删除${type}失败:`, error);
    throw new Error(`删除${type}失败，请重试`);
  }
};