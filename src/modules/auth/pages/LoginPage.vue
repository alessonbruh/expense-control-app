<template>
  <div class="relative flex h-screen">
    <ThemeToggle class="absolute top-4 right-4 z-10" />

    <!-- Lado direito (formulário de login) -->
    <div
      class="w-full flex items-center justify-center px-4 bg-page bg-login-side"
    >
      <div
        class="w-full max-w-md bg-card/95 border border-line rounded-2xl shadow-xl p-6 sm:p-10"
      >
        <h2 class="text-3xl font-semibold text-center text-ink mb-8">
          Acessar Conta
        </h2>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-ink-soft"
              >E-mail</label
            >
            <input
              v-model="email"
              type="email"
              id="email"
              placeholder="seu@email.com"
              required
              class="w-full mt-1 px-4 py-3 bg-field border border-line-strong text-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div class="relative">
            <label
              for="password"
              class="block text-sm font-medium text-ink-soft"
              >Senha</label
            >
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              placeholder="••••••••"
              required
              class="w-full mt-1 px-4 py-3 pr-10 bg-field border border-line-strong text-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <button
              type="button"
              @click="togglePassword"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              class="absolute right-2 top-1/2 transform -translate-y-0 text-ink-muted hover:text-ink"
            >
              <span v-if="showPassword">🙈</span>
              <span v-else>👁️</span>
            </button>
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center">
              <input
                type="checkbox"
                class="h-4 w-4 accent-emerald-500 rounded"
              />
              <span class="ml-2 text-ink-soft">Lembrar-me</span>
            </label>
            <a href="#" class="text-accent hover:underline"
              >Esqueceu a senha?</a
            >
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">Entrar</span>
            <span v-else>Entrando...</span>
          </button>
        </form>

        <p class="text-center text-sm text-ink-muted mt-6">
          Não tem uma conta?
          <a href="#" class="text-accent hover:underline">Cadastre-se</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AuthService } from '../services/authService';
import { useRouter } from 'vue-router';
import { useToast } from '../../../composables/useToast';
import ThemeToggle from '../../../components/ui/ThemeToggle.vue';

const router = useRouter();
const toast = useToast();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);

const authService = new AuthService();

async function handleLogin() {
  loading.value = true;
  try {
    const data = await authService.auth({
      email: email.value,
      password: password.value,
    });

    localStorage.setItem('token', data.token);
    router.push('/dashboard');
  } catch (err: any) {
    toast.error(err.message || 'Erro ao entrar.');
  } finally {
    loading.value = false;
  }
}

function togglePassword() {
  showPassword.value = !showPassword.value;
}
</script>

<style scoped>
/* Pequeno ajuste para responsividade em telas muito pequenas */
@media (max-width: 640px) {
  .hidden.lg\\:flex {
    display: none !important;
  }
}
.bg-login-side {
  background-image: url('../../../assets/auth-left.png');
  background-size: cover; /* cobre toda a div */
  background-position: center; /* centraliza a imagem */
  background-repeat: no-repeat;
}
</style>
