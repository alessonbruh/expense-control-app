<script setup lang="ts">
import ToastContainer from './components/ui/ToastContainer.vue';
</script>

<template>
  <router-view v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
  <ToastContainer />
</template>
