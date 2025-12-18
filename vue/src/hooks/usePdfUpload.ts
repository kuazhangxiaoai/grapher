import { ref } from 'vue';
import axios from 'axios';
import { Message } from '@arco-design/web-vue';
import { useEditStore } from '@/stores/edit.ts';

export function usePdfUpload() {
  const selectedFileName = ref('');
  const currentFile = ref<File | null>(null);
  const showFileModel = ref(false);
  const FileUploadForm = ref({
    title: '',
    publishTime: '',
    filename: ''
  });

  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    showFileModel.value = true;
    if (file) {
      if (
        file.type !== 'application/pdf' &&
        !file.name.toLowerCase().endsWith('.pdf')
      ) {
        Message.error('请上传PDF格式的文件');
        target.value = '';
        return;
      }

      selectedFileName.value = file.name;
      currentFile.value = file;
      FileUploadForm.value.filename = file.name;
    }
  };

  const hanleFileUploadOk = () => {
    const title = FileUploadForm.value.title;
    const publishTime = FileUploadForm.value.publishTime;
    const filename = FileUploadForm.value.filename;
    
    const fileInput = document.querySelector('#document-upload') as HTMLInputElement;
    if (!fileInput?.files?.[0]) {
      Message.error('请选择文件');
      return;
    }
    const project = localStorage.getItem('grapher-project') as string;
    axios.post('/api/text/upload', {
      title: title,
      publishtime: publishTime,
      filename: filename,
      project: project
    })
    .then(res => {
      Message.success('文件信息提交成功');
      // 上传文件
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      
      axios.post('/api/text/uploadfile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(res => {
        Message.success('文件上传成功');
        const url = res.data.url;
        const server = useEditStore().server;
        useEditStore().setPDFPreviewUrl(server + url);
        const project = localStorage.getItem("grapher-project");
        useEditStore().getAllFileInfoList(project);
        
        // 重置表单
        resetUploadFileForm();
        showFileModel.value = false;
        fileInput.value = '';
      })
      .catch(err => {
        Message.error(err.message || '文件上传失败');
        console.log(err);
      });
    })
    .catch(err => {
      Message.error(err.message || '文件信息提交失败');
      console.log(err);
    });
  };

  const hanleFileUploadCancel = () => {
    showFileModel.value = false;
    resetUploadFileForm();
    const fileInput = document.querySelector('#document-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    return false;
  };

  const resetUploadFileForm = () => {
    FileUploadForm.value = {
      title: '',
      publishTime: '',
      filename: ''
    };
  };

  return {
    selectedFileName,
    currentFile,
    showFileModel,
    FileUploadForm,
    handleFileUpload,
    hanleFileUploadOk,
    hanleFileUploadCancel,
    resetUploadFileForm
  };
}
