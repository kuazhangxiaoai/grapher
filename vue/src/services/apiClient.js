import axios from 'axios';
import { Message } from '@arco-design/web-vue';

const API_BASE_URL = import.meta.env.VITE_API_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000, // 增加超时时间，避免请求一直挂起
  headers: {
    'Content-Type': 'application/json;charset=utf-8' // 统一请求头
  }
});

// 将CancelToken附加到apiClient实例上，以便在其他地方使用
apiClient.CancelToken = axios.CancelToken;
apiClient.isCancel = axios.isCancel;

// 错误消息去重：避免短时间内多个相同错误提示
let lastErrorMessage = '';
let lastErrorTime = 0;
const ERROR_MESSAGE_DEBOUNCE_TIME = 1000; // 去重时间窗口（毫秒）

function showErrorMessage(message) {
  const now = Date.now();
  if (message !== lastErrorMessage || now - lastErrorTime > ERROR_MESSAGE_DEBOUNCE_TIME) {
    lastErrorMessage = message;
    lastErrorTime = now;
    Message.error(message);
  }
}

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
    return response;
  },
  (error) => {
    console.error('API响应错误:', error);
    
    // 1. 处理网络错误/超时（无response的情况）
    if (!error.response) {
      showErrorMessage('服务器连接失败，请检查网络或服务器状态');
      // 跳转到登录页
      if (!window.location.pathname.includes('/auth')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = `${window.location.origin}/auth`;
      }
      return Promise.reject(error);
    }

    const { status } = error.response;
    // 2. 处理500、401等错误：清理信息并跳转登录
    if (status === 401 || status === 500) {
      // 防止多次触发跳转（比如多个请求同时401）
      if (!window.location.pathname.includes('/auth')) {
        // 显示友好的错误提示
        if (status === 500) {
          showErrorMessage('服务器内部错误，请稍后重试或联系管理员');
        } else if (status === 401) {
          showErrorMessage('登录已过期，请重新登录');
        }
        // 清除用户信息
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // 延迟跳转，确保用户能看到错误提示
        setTimeout(() => {
          // 跳转登录页（兼容Vue Router和原生跳转）
          window.location.href = `${window.location.origin}/auth`;
        }, 1500);
      }
    } else {
      // 其他错误状态码，显示通用错误提示
      showErrorMessage(`请求失败：${error.response.data?.message || `状态码 ${status}`}`);
    }
   

    return Promise.reject(error);
  }
);

export default apiClient;