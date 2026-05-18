import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../modules/auth/pages/LoginPage.vue';
import DashboardPage from '../modules/dashboard/pages/DashboardPage.vue';

const routes = [
  {
    path: '/',
    redirect: '/auth',
  },
  {
    path: '/auth',
    name: 'Auth',
    component: LoginPage,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    // meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/auth');
  } else {
    next();
  }
});

export default router;
