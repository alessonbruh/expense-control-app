<template>
  <div class="relative flex min-h-screen">
    <ThemeToggle class="absolute top-4 right-4 z-10" />

    <div
      class="w-full flex items-center justify-center px-4 py-10 bg-page bg-login-side"
    >
      <div
        class="w-full max-w-md bg-card/95 border border-line rounded-2xl shadow-xl p-6 sm:p-10"
      >
        <h2 class="text-3xl font-semibold text-center text-ink mb-2">
          Redefinir senha
        </h2>
        <p class="text-center text-sm text-ink-muted mb-8">
          Use um dos códigos de recuperação que você recebeu ao criar a conta.
        </p>

        <form @submit.prevent="handleReset" class="space-y-5" novalidate>
          <div>
            <label for="email" class="block text-sm font-medium text-ink-soft"
              >E-mail</label
            >
            <input
              v-model.trim="form.email"
              @blur="touched.email = true"
              type="email"
              id="email"
              autocomplete="email"
              placeholder="seu@email.com"
              :aria-invalid="!!visibleErrors.email"
              :class="inputClass(visibleErrors.email)"
            />
            <p v-if="visibleErrors.email" class="mt-1 text-sm text-negative">
              {{ visibleErrors.email }}
            </p>
          </div>

          <div>
            <label
              for="recoveryCode"
              class="block text-sm font-medium text-ink-soft"
              >Código de recuperação</label
            >
            <input
              v-model.trim="form.recoveryCode"
              @blur="touched.recoveryCode = true"
              type="text"
              id="recoveryCode"
              autocomplete="one-time-code"
              autocapitalize="characters"
              spellcheck="false"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              :aria-invalid="!!visibleErrors.recoveryCode"
              aria-describedby="recovery-code-hint"
              :class="[
                inputClass(visibleErrors.recoveryCode),
                'font-mono uppercase tracking-wider',
              ]"
            />
            <p
              v-if="visibleErrors.recoveryCode"
              class="mt-1 text-sm text-negative"
            >
              {{ visibleErrors.recoveryCode }}
            </p>
            <p
              v-else
              id="recovery-code-hint"
              class="mt-1 text-sm text-ink-muted"
            >
              Cada código funciona uma única vez.
            </p>
          </div>

          <div>
            <label
              for="newPassword"
              class="block text-sm font-medium text-ink-soft"
              >Nova senha</label
            >
            <div class="relative">
              <input
                v-model="form.newPassword"
                @blur="touched.newPassword = true"
                :type="showPassword ? 'text' : 'password'"
                id="newPassword"
                autocomplete="new-password"
                placeholder="••••••••"
                :aria-invalid="!!visibleErrors.newPassword"
                :class="[inputClass(visibleErrors.newPassword), 'pr-10']"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                class="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 text-ink-muted hover:text-ink"
              >
                <span v-if="showPassword">🙈</span>
                <span v-else>👁️</span>
              </button>
            </div>
            <p
              v-if="visibleErrors.newPassword"
              class="mt-1 text-sm text-negative"
            >
              {{ visibleErrors.newPassword }}
            </p>
          </div>

          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-ink-soft"
              >Confirmar nova senha</label
            >
            <input
              v-model="form.confirmPassword"
              @blur="touched.confirmPassword = true"
              :type="showPassword ? 'text' : 'password'"
              id="confirmPassword"
              autocomplete="new-password"
              placeholder="••••••••"
              :aria-invalid="!!visibleErrors.confirmPassword"
              :class="inputClass(visibleErrors.confirmPassword)"
            />
            <p
              v-if="visibleErrors.confirmPassword"
              class="mt-1 text-sm text-negative"
            >
              {{ visibleErrors.confirmPassword }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">Redefinir senha</span>
            <span v-else>Redefinindo...</span>
          </button>
        </form>

        <p class="text-center text-sm text-ink-muted mt-6">
          Lembrou a senha?
          <router-link to="/auth" class="text-accent hover:underline"
            >Entrar</router-link
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  AuthService,
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
} from '../services/authService';
import { useToast } from '../../../composables/useToast';
import ThemeToggle from '../../../components/ui/ThemeToggle.vue';

type Field = 'email' | 'recoveryCode' | 'newPassword' | 'confirmPassword';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authService = new AuthService();

const form = reactive<Record<Field, string>>({
  // Vem preenchido quando o usuário já digitou o e-mail na tela de login
  email: typeof route.query.email === 'string' ? route.query.email : '',
  recoveryCode: '',
  newPassword: '',
  confirmPassword: '',
});
const touched = reactive<Record<Field, boolean>>({
  email: false,
  recoveryCode: false,
  newPassword: false,
  confirmPassword: false,
});
const showPassword = ref(false);
const loading = ref(false);

// 16 caracteres, ignorando hífens e espaços (a API aceita das duas formas)
const RECOVERY_CODE_LENGTH = 16;

const errors = computed<Partial<Record<Field, string>>>(() => {
  const result: Partial<Record<Field, string>> = {};

  if (!form.email) result.email = 'Informe seu e-mail.';
  else if (!EMAIL_REGEX.test(form.email)) result.email = 'E-mail inválido.';

  const code = form.recoveryCode.replace(/[\s-]/g, '');
  if (!code) result.recoveryCode = 'Informe um código de recuperação.';
  else if (code.length !== RECOVERY_CODE_LENGTH)
    result.recoveryCode = 'O código tem o formato XXXX-XXXX-XXXX-XXXX.';

  if (!form.newPassword) result.newPassword = 'Informe a nova senha.';
  else if (form.newPassword.length < PASSWORD_MIN_LENGTH)
    result.newPassword = `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;

  if (!form.confirmPassword) result.confirmPassword = 'Confirme a nova senha.';
  else if (form.confirmPassword !== form.newPassword)
    result.confirmPassword = 'As senhas não conferem.';

  return result;
});

const visibleErrors = computed(() => {
  const result: Partial<Record<Field, string>> = {};
  for (const field of Object.keys(errors.value) as Field[]) {
    if (touched[field]) result[field] = errors.value[field];
  }
  return result;
});

function inputClass(error?: string) {
  return [
    'w-full mt-1 px-4 py-3 bg-field border text-ink rounded-lg focus:outline-none focus:ring-2',
    error
      ? 'border-red-500 focus:ring-red-500/60'
      : 'border-line-strong focus:ring-emerald-500 focus:border-emerald-500',
  ];
}

async function handleReset() {
  (Object.keys(touched) as Field[]).forEach(field => (touched[field] = true));
  if (Object.keys(errors.value).length) return;

  loading.value = true;
  try {
    const { remainingRecoveryCodes } = await authService.resetPassword({
      email: form.email,
      recoveryCode: form.recoveryCode,
      newPassword: form.newPassword,
    });

    toast.success('Senha redefinida! Entre com a nova senha.');
    if (remainingRecoveryCodes === 0) {
      toast.info(
        'Você usou seu último código. Gere novos códigos após entrar.',
      );
    } else if (remainingRecoveryCodes === 1) {
      toast.info('Resta só 1 código. Gere novos após entrar.');
    } else if (remainingRecoveryCodes === 2) {
      toast.info('Restam só 2 códigos. Gere novos após entrar.');
    }
    router.push({ path: '/auth', query: { email: form.email } });
  } catch (err: any) {
    toast.error(err.message || 'Erro ao redefinir a senha.');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.bg-login-side {
  background-image: url('../../../assets/auth-left.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
