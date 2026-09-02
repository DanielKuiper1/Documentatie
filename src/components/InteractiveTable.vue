<script setup>
import { computed, ref, watchEffect } from 'vue'
import { parseInteractiveTable, formatNumber } from '@/utils/interactive.js'
import { compile } from '@/utils/expression.js'
import NumberField from './NumberField.vue'

const props = defineProps({ source: { type: String, required: true } })

const spec = computed(() => parseInteractiveTable(props.source))
const rows = ref([])
const query = ref('')
const sortKey = ref('')
const sortAscending = ref(true)

watchEffect(() => {
  rows.value = spec.value.rows.map((row) => ({ ...row }))
})

/** Rijen aangevuld met elke berekende kolom, in bronvolgorde. */
const computedRows = computed(() =>
  rows.value.map((row, index) => {
    const scope = { ...row }
    const cells = {}
    for (const column of spec.value.columns) {
      if (column.kind !== 'computed') {
        cells[column.key] = row[column.key]
        continue
      }
      let value = NaN
      try {
        value = compile(column.expression)(scope)
      } catch (error) {
        /* laat NaN staan — wordt als kastlijntje getoond */
      }
      scope[column.key] = value
      cells[column.key] = value
    }
    return { index, cells }
  })
)

const visibleRows = computed(() => {
  const term = query.value.trim().toLowerCase()
  let result = computedRows.value

  if (term) {
    result = result.filter((row) =>
      Object.values(row.cells).some((value) => String(value ?? '').toLowerCase().includes(term))
    )
  }

  if (sortKey.value) {
    const direction = sortAscending.value ? 1 : -1
    result = [...result].sort((a, b) => {
      const left = a.cells[sortKey.value]
      const right = b.cells[sortKey.value]
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * direction
      return String(left).localeCompare(String(right)) * direction
    })
  }

  return result
})

/** Zonder bewerkbare kolommen, filter of sortering valt er niets te herstellen. */
const canReset = computed(
  () => spec.value.columns.some((column) => column.kind === 'input') || !!query.value || !!sortKey.value
)

function toggleSort(column) {
  if (!spec.value.sort) return
  if (sortKey.value === column.key) sortAscending.value = !sortAscending.value
  else {
    sortKey.value = column.key
    sortAscending.value = true
  }
}

function display(column, value) {
  if (column.kind === 'computed') return column.prefix + formatNumber(value, column.decimals) + column.suffix
  return column.prefix + (value ?? '') + column.suffix
}

function reset() {
  rows.value = spec.value.rows.map((row) => ({ ...row }))
  query.value = ''
  sortKey.value = ''
}
</script>

<template>
  <div class="doc-block not-prose rounded-md border border-gray-200 dark:border-gray-700">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-700">
      <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {{ spec.title || 'Interactieve tabel' }}
      </span>
      <div class="flex flex-1 items-center justify-end gap-2">
        <input
          v-if="spec.filter"
          v-model="query"
          type="search"
          placeholder="Filteren…"
          aria-label="Rijen filteren"
          class="w-full max-w-[10rem] rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900
                 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
        <button v-if="canReset" type="button" class="doc-button shrink-0" @click="reset">Herstellen</button>
      </div>
    </div>

    <p v-if="spec.error" class="px-4 py-3 text-sm text-red-600 dark:text-red-400">{{ spec.error }}</p>

    <div v-else class="doc-scroll-x">
      <!-- min-w-max: kolommen houden hun natuurlijke breedte, het kader schuift -->
        <table class="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr class="bg-gray-50 dark:bg-gray-800/60">
            <th
              v-for="column in spec.columns"
              :key="column.key"
              scope="col"
              class="whitespace-nowrap border-b border-gray-200 px-4 py-2 text-left font-semibold
                     text-gray-700 dark:border-gray-700 dark:text-gray-200"
              :class="spec.sort ? 'cursor-pointer select-none hover:text-blue-600 dark:hover:text-blue-400' : ''"
              :aria-sort="sortKey === column.key ? (sortAscending ? 'ascending' : 'descending') : 'none'"
              @click="toggleSort(column)"
            >
              {{ column.label }}
              <span v-if="sortKey === column.key" class="text-xs">{{ sortAscending ? '▲' : '▼' }}</span>
              <span
                v-if="column.kind === 'computed'"
                class="ml-1 text-xs font-normal text-gray-400"
                title="Berekende kolom"
              >ƒ</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in visibleRows"
            :key="row.index"
            class="border-b border-gray-100 last:border-0 dark:border-gray-800"
          >
            <td v-for="column in spec.columns" :key="column.key" class="px-4 py-1.5 align-middle">
              <template v-if="column.kind === 'input'">
                <div class="flex items-center gap-2">
                  <NumberField
                    v-model="rows[row.index][column.key]"
                    :min="column.min"
                    :max="column.max"
                    :step="column.step"
                    :label="column.label"
                    compact
                  />
                  <input
                    v-if="column.slider"
                    v-model.number="rows[row.index][column.key]"
                    type="range"
                    :min="column.min"
                    :max="column.max"
                    :step="column.step"
                    :aria-label="`${column.label} (schuifregelaar)`"
                    class="doc-range w-28"
                  />
                </div>
              </template>
              <span
                v-else
                class="whitespace-nowrap text-gray-800 dark:text-gray-200"
                :class="column.kind === 'computed' ? 'font-mono font-medium' : ''"
              >
                {{ display(column, row.cells[column.key]) }}
              </span>
            </td>
          </tr>
          <tr v-if="!visibleRows.length">
            <td :colspan="spec.columns.length" class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Geen rijen gevonden.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
