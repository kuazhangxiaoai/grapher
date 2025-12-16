<template>
  <div class="auth-container">
    <div class="auth-form-wrapper">
      <div class="auth-header">
        <h2>{{ isLogin ? '登录' : '注册' }}</h2>
        <p>{{ isLogin ? '欢迎回来' : '创建新账户' }}</p>
      </div>
      <a-form auto-label-width :model="form" :rules="rules" ref="formRef" @submit="handleSubmit">
        <a-form-item field="username" label="用户名">
          <a-input v-model="form.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item field="password" label="密码">
          <a-input-password  v-model="form.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item v-if="!isLogin" field="confirmPassword" label="确认密码">
          <a-input-password  v-model="form.confirmPassword" placeholder="请再次输入密码" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" block>{{ isLogin ? '登录' : '注册' }}</a-button>
        </a-form-item>
      </a-form>
      <div class="auth-footer">
        <span>{{ isLogin ? '没有账户？' : '已有账户？' }}</span>
        <a-button type="text" @click="toggleMode">{{ isLogin ? '立即注册' : '去登录' }}</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { FormInstance } from '@arco-design/web-vue';
import { Message } from '@arco-design/web-vue';
import { login, register } from '@/services/authApi';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
const emit = defineEmits(['auth-success']);
const formRef = ref<FormInstance>(null);
const isLogin = ref(true);
const userStore = useUserStore();
const router = useRouter();

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { 
      validator: (rule: any, value: string) => {
        if (!value || form.password === value) {
          return Promise.resolve();
        }
        return Promise.reject('两次输入密码不一致');
      },
      trigger: 'blur'
    }
  ]
};

const toggleMode = () => {
  isLogin.value = !isLogin.value;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    if (isLogin.value) {
      // const success = await login(form.username, form.password);
      // if (success) {
        // userStore.login({ id: '1', username: form.username, token: 'dummy-token' });
        Message.success('登录成功');
        router.push('/list');
      // } else {
      //   Message.error('用户名或密码错误');
      // }
    } else {
      const success = await register(form.username, form.password);
      if (success) {
        Message.success('注册成功');
        isLogin.value = true;
      } else {
        Message.error('注册失败，用户名可能已存在');
      }
    }
  } catch (error: any) {
    Message.error(error.message || '操作失败');
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-form-wrapper {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.auth-header p {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.auth-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  font-size: 14px;
  color: #86909c;
}

.auth-footer a-button {
  margin-left: 8px;
}

/* 表单样式优化 */
:deep(.arco-form-item-label) {
  text-align: left;
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

:deep(.arco-form-item-control-wrapper) {
  width: 100%;
}


/* 确保表单项目显示完整 */
:deep(.arco-form-item-label > span) {
  display: inline-block;
  white-space: nowrap;
  overflow: visible;
}
</style>