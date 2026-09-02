<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  openFolders: { type: Object, required: true }
})

const route = useRoute()

const isOpen = computed(() => props.openFolders.has(props.node.path))
const containsActive = computed(
  () => route.path === props.node.path || route.path.startsWith(props.node.path + '/')
)

/**
 * De hele rij is de knop — pijl, titel en alle ruimte ernaast. Het is een echte
 * <button>, dus Enter/Spatie en focus werken vanzelf.
 */
function toggle() {
  props.openFolders.toggle(props.node.path)
}
</script>

<template>
  <li>
    <button
      type="button"
      class="flex w-full items-center gap-1.5 rounded px-2 py-2 text-left text-[13px] font-semibold
             text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
             dark:text-gray-200 dark:hover:bg-gray-800 sm:py-1.5"
      :class="containsActive && !isOpen ? 'text-blue-700 dark:text-blue-300' : ''"
      :style="{ paddingLeft: depth * 10 + 8 + 'px' }"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <svg
        class="h-3 w-3 shrink-0 transition-transform"
        :class="isOpen ? 'rotate-90' : ''"
        viewBox="0 0 12 12"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 2l4 4-4 4z" />
      </svg>
      <span class="truncate">{{ node.title }}</span>
    </button>

    <ul v-show="isOpen" class="mt-0.5 space-y-0.5">
      <li v-if="node.indexPath">
        <RouterLink
          :to="node.indexPath"
          class="block truncate rounded px-2 py-2 text-[13px] italic text-gray-600 hover:bg-gray-100
                 dark:text-gray-400 dark:hover:bg-gray-800 sm:py-1"
          :style="{ paddingLeft: (depth + 1) * 10 + 18 + 'px' }"
          active-class="bg-blue-50 font-medium not-italic text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
        >
          Overzicht
        </RouterLink>
      </li>
      <template v-for="child in node.children" :key="child.path">
        <SidebarFolder v-if="child.type === 'folder'" :node="child" :depth="depth + 1" :open-folders="openFolders" />
        <li v-else>
          <RouterLink
            :to="child.path"
            class="block truncate rounded px-2 py-2 text-[13px] text-gray-600 hover:bg-gray-100
                   dark:text-gray-400 dark:hover:bg-gray-800 sm:py-1"
            :style="{ paddingLeft: (depth + 1) * 10 + 18 + 'px' }"
            active-class="bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
          >
            {{ child.title }}
          </RouterLink>
        </li>
      </template>
    </ul>
  </li>
</template>
