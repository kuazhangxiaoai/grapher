import { ref, computed } from 'vue';

interface User {
  id: string;
  username: string;
  token: string;
}

export function useUserStore() {
  const user = ref<User | null>(null);
  
  // 从localStorage初始化用户状态
  const initUser = () => {
    const storedUser = localStorage.getItem('grapher-user');
    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }
  };
  
  const isLoggedIn = computed(() => !!user.value);
  
  const login = (userData: User) => {
    user.value = userData;
    localStorage.setItem('grapher-user', JSON.stringify(userData));
  };
  
  const logout = () => {
    user.value = null;
    localStorage.removeItem('grapher-user');
  };
  
  return {
    user,
    isLoggedIn,
    login,
    logout,
    initUser
  };
}