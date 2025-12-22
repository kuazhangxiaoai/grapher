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
  },
  {
    path: '/debug',
    name: 'Debug',
    component: () => import('@/components/DebugLocalStorage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
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
  
  console.log('路由守卫调试信息：');
  console.log('当前路由:', to.path);
  console.log('是否需要认证:', requiresAuth);
  console.log('用户是否登录:', userStore.isLoggedIn);
  
  if (requiresAuth) {
    if (!userStore.isLoggedIn) {
      // 未登录，跳转到登录页
      console.log('未登录，跳转到登录页');
      next({ name: 'Auth' });
    } else {
      // 已登录，继续导航
      console.log('已登录，继续导航');
      next();
    }
  } else {
    // 不需要认证，直接导航
    console.log('不需要认证，直接导航');
    next();
  }
});

export default router;