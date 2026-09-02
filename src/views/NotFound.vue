<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="px-4 py-16 text-center">
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Pagina niet gevonden</h1>
    <p class="mt-2 text-gray-600 dark:text-gray-400">
      Dit document bestaat niet in <code>docs/</code>.
    </p>
    <RouterLink to="/" class="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400">
      Terug naar de documentatie
    </RouterLink>
  </div>
</template>
