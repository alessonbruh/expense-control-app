import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '../modules/auth/services/authService';
import { clearSession, getToken } from '../shared/auth/session';
import { useToast } from './useToast';

const authService = new AuthService();

export function useAuth() {
  const router = useRouter();
  const toast = useToast();
  const loggingOut = ref(false);

  async function logout(allDevices = false) {
    if (loggingOut.value) return;
    loggingOut.value = true;

    const token = getToken();
    try {
      if (token) await authService.logout(token, allDevices);
    } catch (err) {
      console.error(err);
    } finally {
      clearSession();
      loggingOut.value = false;
      toast.info(
        allDevices
          ? 'Você saiu de todos os dispositivos.'
          : 'Você saiu da sua conta.',
      );
      router.replace('/auth');
    }
  }

  return { logout, loggingOut };
}
