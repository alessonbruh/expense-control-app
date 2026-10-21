import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import routes from './routes';
import { onSessionExpired } from './shared/auth/session';
import { useToast } from './composables/useToast';

onSessionExpired(() => {
  if (routes.currentRoute.value.meta.requiresAuth) {
    useToast().error('Sua sessão expirou. Entre novamente.');
    routes.replace('/auth');
  }
});

const app = createApp(App);
app.use(routes);
app.mount('#app');
