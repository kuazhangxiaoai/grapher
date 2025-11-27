import apiClient from './apiClient';

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 */
export const login = async (username, password) => {
  try {
    const response = await apiClient.post(`/user/login`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    console.error('登录失败:', error);
    throw new Error(error.response?.data || '登录失败，请重试');
  }
};

/**
 * 用户注册
 * @param {string} username - 用户名
 * @param {string} password - 密码
 */
export const register = async (username, password) => {
  try {
    const response = await apiClient.post(`/user/regist`, {
      username,
      password
    });
    return response.data;
  } catch (error) {
    console.error('注册失败:', error);
    throw new Error(error.response?.data || '注册失败，请重试');
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async () => {
  try {
    const storedUser = localStorage.getItem('grapher-user');
    if (!storedUser) {
      throw new Error('未登录');
    }
    
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw new Error('获取用户信息失败，请重试');
  }
};