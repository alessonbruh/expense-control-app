import { computed, ref } from 'vue';
import { AuthService } from '../modules/auth/services/authService';
import {
  getSessionUser,
  getToken,
  setSessionUser,
  type SessionUser,
} from '../shared/auth/session';

const authService = new AuthService();

export function useCurrentUser() {
  const user = ref<SessionUser | null>(getSessionUser());

  async function ensureLoaded() {
    if (user.value || !getToken()) return;
    try {
      const { name, email } = await authService.me(getToken());
      user.value = { name, email };
      setSessionUser(user.value);
    } catch (err) {
      console.error(err);
    }
  }

  const displayName = computed(() => {
    const words = (user.value?.name ?? '')
      .replace(/\([^)]*\)/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return words.length > 1
      ? `${words[0]} ${words[words.length - 1]}`
      : (words[0] ?? '');
  });

  const initials = computed(() => {
    const words = displayName.value
      .replace(/\([^)]*\)/g, ' ')
      .split(/\s+/)
      .map(word => word.match(/\p{L}/u)?.[0])
      .filter((letter): letter is string => !!letter);
    const first = words[0] ?? '';
    const last = words.length > 1 ? words[words.length - 1] : '';
    return (first + last).toUpperCase();
  });

  return { user, displayName, initials, ensureLoaded };
}
