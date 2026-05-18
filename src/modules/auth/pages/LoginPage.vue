<template>
  <div class="flex h-screen">
    <!-- Lado direito (formulário de login) -->
    <div
      class="w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 bg-login-side"
    >
      <div
        class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900 p-10"
      >
        <h2
          class="text-3xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-8"
        >
          Acessar Conta
        </h2>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >E-mail</label
            >
            <input
              v-model="email"
              type="email"
              id="email"
              placeholder="seu@email.com"
              required
              class="w-full mt-1 px-4 py-3 text-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div class="relative">
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Senha</label
            >
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              placeholder="••••••••"
              required
              class="w-full mt-1 px-4 py-3 text-gray-700 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <button
              type="button"
              @click="togglePassword"
              class="absolute right-2 top-1/2 transform -translate-y-0 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
            >
              <span v-if="showPassword">🙈</span>
              <span v-else>👁️</span>
            </button>
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center">
              <input
                type="checkbox"
                class="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <span class="ml-2 text-gray-600 dark:text-gray-300"
                >Lembrar-me</span
              >
            </label>
            <a href="#" class="text-blue-600 hover:underline dark:text-blue-400"
              >Esqueceu a senha?</a
            >
          </div>

          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-gray-100 font-medium py-3 rounded-lg transition-colors"
          >
            Entrar
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Não tem uma conta?
          <a href="#" class="text-blue-600 hover:underline dark:text-blue-400"
            >Cadastre-se</a
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { AuthService } from '../services/authService';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const showPassword = ref(false);

const authService = new AuthService();

async function handleLogin() {
  try {
    console.log('Iniciando login com:', email.value);

    const data = await authService.auth({
      email: email.value,
      password: password.value,
    });

    localStorage.setItem('token', data.token);
    router.push('/dashboard');
  } catch (err: any) {
    alert(err.message);
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
