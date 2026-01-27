import apiClient from './apiClient';

/**
 * 摘要相关API服务
 */
const summaryApi = {
  /**
   * 创建分组
   * @param {Object} params - 创建分组的参数
   * @param {string} params.groupName - 分组名称
   * @param {string} [params.articleName] - 文章名称（可选）
   * @param {string} [params.projectName] - 项目名称（可选）
   * @returns {Promise} - 返回创建分组的Promise
   */
  createGroup: async (params) => {
    try {
      const response = await apiClient.post('/createGroup', params);
      return response.data;
    } catch (error) {
      console.error('创建分组失败:', error);
      throw error;
    }
  }
};

export default summaryApi;