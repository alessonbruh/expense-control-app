import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../modules/auth/pages/LoginPage.vue';
import RegisterPage from '../modules/auth/pages/RegisterPage.vue';
import DashboardPage from '../modules/dashboard/pages/DashboardPage.vue';
import { getToken } from '../shared/auth/session';

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
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth && !getToken()) {
    next('/auth');
  } else {
    next();
  }
});

export default router;
