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
// router.beforeEach((to, from, next) => {
//   const userStore = useUserStore();
  
//   // 初始化用户状态
//   userStore.initUser();
  
//   if (to.matched.some(record => record.meta.requiresAuth)) {
//     if (!userStore.isLoggedIn.value) {
//       next({ name: 'Auth' });
//     } else {
//       next();
//     }
//   } else {
//     next();
//   }
// });

export default router;