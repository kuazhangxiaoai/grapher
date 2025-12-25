import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000, // 增加超时时间，避免请求一直挂起
  headers: {
    'Content-Type': 'application/json;charset=utf-8' // 统一请求头
  }
});

// 请求拦截器：添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：处理401和通用错误
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回响应体，保持原有逻辑
    return response.data;
  },
  (error) => {
    console.error('API响应错误:', error);
    
    // 1. 处理网络错误/超时（无response的情况）
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;
    // 2. 处理401未授权：清理信息并跳转登录
    if (status === 401 || status === 500) {
      // 防止多次触发跳转（比如多个请求同时401）
      if (!window.location.pathname.includes('/login')) {
        // 清除用户信息
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // 跳转登录页（兼容Vue Router和原生跳转）
        window.location.href = `${window.location.origin}/login`;
      }
    } 
   

    return Promise.reject(error);
  }
);

export default apiClient;