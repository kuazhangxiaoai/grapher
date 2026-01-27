import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes = [
  {
    path: '/',
    redirect: (to) => {
      const userStore = useUserStore();
      userStore.initUser();
      return userStore.isLoggedIn ? '/home' : '/auth';
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/components/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/list',
    name: 'DemoList',
    component: () => import('@/components/Project/DemoList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/components/Auth/AuthForm.vue')
  },
  {
    path: '/management/summary',
    name: 'Summary',
    component: () => import('@/components/Management/Summary/index.vue')
  },
  {
    path: '/management/map',
    name: 'Map',
    component: () => import('@/components/Management/Map/index.vue')
  },
  {
    path: '/management/traceBack',
    name: 'TraceBack',
    component: () => import('@/components/Management/TraceBack/index.vue')
  },

];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_API_BASE_URL),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 在路由守卫中使用Pinia store需要确保Pinia已经初始化
  const userStore = useUserStore();
  
  // 初始化用户状态
  userStore.initUser();
  
  // 检查是否需要认证 - 明确检查requiresAuth是否为true
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth === true);
  if (requiresAuth) {
    if (!userStore.isLoggedIn) {
      next({ name: 'Auth' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;