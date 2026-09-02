<script setup>
import { onMounted, ref, watch } from 'vue'

const isDark = ref(false)

onMounted(() => {
  const stored = localStorage.getItem('theme')
  isDark.value = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
})

watch(isDark, (value) => {
  document.documentElement.classList.toggle('dark', value)
  localStorage.setItem('theme', value ? 'dark' : 'light')
})
</script>

<template>
  <button
    type="button"
    class="inline-flex h-11 w-11 items-center justify-center rounded-md border border-gray-300 text-gray-600
           transition-colors hover:bg-gray-100 sm:h-9 sm:w-9
           dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    :title="isDark ? 'Naar lichte modus' : 'Naar donkere modus'"
    :aria-label="isDark ? 'Naar lichte modus' : 'Naar donkere modus'"
    @click="isDark = !isDark"
  >
    <svg v-if="isDark" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
    <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  </button>
</template>
