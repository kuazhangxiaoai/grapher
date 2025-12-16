import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/components/Home.vue';
import GraphList from '@/components/GraphList.vue';
import AuthForm from '@/components/Auth/AuthForm.vue';
import DemoList from '@/components/Project/DemoList.vue';
import { useUserStore } from '@/stores/user';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/list',
    name: 'DemoList',
    component: DemoList,
    meta: { requiresAuth: true }
  },
  // {
  //   path: '/',
  //   name: 'GraphList',
  //   component: GraphList,
  //   meta: { requiresAuth: true }
  // },
  // {
  //   path: '/graph/:id?',
  //   name: 'Home',
  //   component: Home,
  //   meta: { requiresAuth: true }
  // },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthForm
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 在路由守卫中使用Pinia store需要确保Pinia已经初始化
  // 使用getActivePinia()获取当前激活的Pinia实例
  const userStore = useUserStore();
  
  // 初始化用户状态
  userStore.initUser();
  
  // 检查是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth) {
    if (!userStore.isLoggedIn.value) {
      // 未登录，跳转到登录页
      next({ name: 'Auth' });
    } else {
      // 已登录，继续导航
      next();
    }
  } else {
    // 不需要认证，直接导航
    next();
  }
});

export default router;