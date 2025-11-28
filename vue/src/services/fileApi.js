import apiClient from './apiClient';

/**
 * 文件上传接口
 * @param {File} file - 要上传的文件对象
 * @returns {Promise}
 */
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 文件下载接口
 * @param {string} filename - 要下载的文件名
 * @returns {Promise}
 */
export const downloadFile = (filename) => {
  return apiClient.get('/download', {
    params: { filename },
    responseType: 'blob'
  }).then(response => {
    // 创建下载链接并触发下载
    const url = URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // 清理资源
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};