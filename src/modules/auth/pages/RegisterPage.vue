<template>
  <div class="relative flex min-h-screen">
    <ThemeToggle class="absolute top-4 right-4 z-10" />

    <div
      class="w-full flex items-center justify-center px-4 py-10 bg-page bg-login-side"
    >
      <div
        class="w-full max-w-md bg-card/95 border border-line rounded-2xl shadow-xl p-6 sm:p-10"
      >
        <!-- Etapa 2: conta criada, exibe os códigos de recuperação -->
        <template v-if="recoveryCodes">
          <h2 class="text-3xl font-semibold text-center text-ink mb-2">
            Conta criada!
          </h2>
          <p class="text-center text-sm text-ink-muted mb-6">
            Antes de continuar, guarde seus códigos de recuperação.
          </p>
          <RecoveryCodesList
            :codes="recoveryCodes"
            :confirm-label="
              loggedIn ? 'Ir para o dashboard' : 'Ir para o login'
            "
            @confirm="finishRegister"
          />
        </template>

        <template v-else>
          <h2 class="text-3xl font-semibold text-center text-ink mb-2">
            Criar Conta
          </h2>
          <p class="text-center text-sm text-ink-muted mb-8">
            Comece a controlar seus gastos
          </p>

          <form @submit.prevent="handleRegister" class="space-y-5" novalidate>
            <div>
              <label for="name" class="block text-sm font-medium text-ink-soft"
                >Nome</label
              >
              <input
                v-model.trim="form.name"
                @blur="touched.name = true"
                type="text"
                id="name"
                autocomplete="name"
                placeholder="Seu nome"
                :aria-invalid="!!visibleErrors.name"
                :class="inputClass(visibleErrors.name)"
              />
              <p v-if="visibleErrors.name" class="mt-1 text-sm text-negative">
                {{ visibleErrors.name }}
              </p>
            </div>

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
                for="password"
                class="block text-sm font-medium text-ink-soft"
                >Senha</label
              >
              <div class="relative">
                <input
                  v-model="form.password"
                  @blur="touched.password = true"
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  autocomplete="new-password"
                  placeholder="••••••••"
                  :aria-invalid="!!visibleErrors.password"
                  aria-describedby="password-hint"
                  :class="[inputClass(visibleErrors.password), 'pr-10']"
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
                v-if="visibleErrors.password"
                class="mt-1 text-sm text-negative"
              >
                {{ visibleErrors.password }}
              </p>
              <p v-else id="password-hint" class="mt-1 text-sm text-ink-muted">
                {{ passwordHint }}
              </p>
            </div>

            <div>
              <label
                for="confirmPassword"
                class="block text-sm font-medium text-ink-soft"
                >Confirmar senha</label
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
              <span v-if="!loading">Criar conta</span>
              <span v-else>Criando conta...</span>
            </button>
          </form>

          <p class="text-center text-sm text-ink-muted mt-6">
            Já tem uma conta?
            <router-link to="/auth" class="text-accent hover:underline"
              >Entrar</router-link
            >
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  AuthService,
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
} from '../services/authService';
import { useToast } from '../../../composables/useToast';
import { setToken } from '../../../shared/auth/session';
import ThemeToggle from '../../../components/ui/ThemeToggle.vue';
import RecoveryCodesList from '../components/RecoveryCodesList.vue';

type Field = 'name' | 'email' | 'password' | 'confirmPassword';

const router = useRouter();
const toast = useToast();
const authService = new AuthService();

const form = reactive<Record<Field, string>>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});
// O erro de um campo só aparece depois que o usuário sai dele (ou tenta enviar)
const touched = reactive<Record<Field, boolean>>({
  name: false,
  email: false,
  password: false,
  confirmPassword: false,
});
const showPassword = ref(false);
const loading = ref(false);
const recoveryCodes = ref<string[] | null>(null);
const loggedIn = ref(false);

const errors = computed<Partial<Record<Field, string>>>(() => {
  const result: Partial<Record<Field, string>> = {};

  if (!form.name) result.name = 'Informe seu nome.';

  if (!form.email) result.email = 'Informe seu e-mail.';
  else if (!EMAIL_REGEX.test(form.email)) result.email = 'E-mail inválido.';

  if (!form.password) result.password = 'Informe uma senha.';
  else if (form.password.length < PASSWORD_MIN_LENGTH)
    result.password = `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`;

  if (!form.confirmPassword) result.confirmPassword = 'Confirme sua senha.';
  else if (form.confirmPassword !== form.password)
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

const passwordHint = computed(() => {
  const missing = PASSWORD_MIN_LENGTH - form.password.length;
  return missing > 0
    ? `Mínimo de ${PASSWORD_MIN_LENGTH} caracteres (faltam ${missing}).`
    : 'Tamanho de senha ok.';
});

function inputClass(error?: string) {
  return [
    'w-full mt-1 px-4 py-3 bg-field border text-ink rounded-lg focus:outline-none focus:ring-2',
    error
      ? 'border-red-500 focus:ring-red-500/60'
      : 'border-line-strong focus:ring-emerald-500 focus:border-emerald-500',
  ];
}

async function handleRegister() {
  (Object.keys(touched) as Field[]).forEach(field => (touched[field] = true));
  if (Object.keys(errors.value).length) return;

  loading.value = true;
  let codes: string[];
  try {
    ({ recoveryCodes: codes } = await authService.register({
      name: form.name,
      email: form.email,
      password: form.password,
    }));
  } catch (err: any) {
    toast.error(err.message || 'Erro ao criar conta.');
    loading.value = false;
    return;
  }

  // Conta criada: já entra direto, sem pedir para digitar tudo de novo
  try {
    const data = await authService.auth({
      email: form.email,
      password: form.password,
    });
    setToken(data.token);
    loggedIn.value = true;
  } catch {
    loggedIn.value = false;
  } finally {
    loading.value = false;
    // Os códigos vêm só nesta resposta: mostra antes de sair da página
    recoveryCodes.value = codes;
    form.password = '';
    form.confirmPassword = '';
  }
}

function finishRegister() {
  if (loggedIn.value) {
    toast.success(`Conta criada! Bem-vindo(a), ${form.name}.`);
    router.push('/dashboard');
  } else {
    toast.success('Conta criada com sucesso! Faça login para continuar.');
    router.push('/auth');
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
