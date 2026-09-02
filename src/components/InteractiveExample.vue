<script setup>
import { computed, reactive, watchEffect } from 'vue'
import { parseInteractive, formatNumber } from '@/utils/interactive.js'
import { compile } from '@/utils/expression.js'
import NumberField from './NumberField.vue'

const props = defineProps({ source: { type: String, required: true } })

const spec = computed(() => parseInteractive(props.source))
const values = reactive({})

watchEffect(() => {
  for (const key of Object.keys(values)) delete values[key]
  for (const field of spec.value.fields) values[field.name] = field.value
})

const results = computed(() =>
  spec.value.outputs.map((output) => {
    try {
      const value = compile(output.expression)({ ...values })
      return { ...output, display: output.prefix + formatNumber(value, output.decimals) + output.suffix }
    } catch (error) {
      return { ...output, display: '—', error: error.message }
    }
  })
)

function reset() {
  for (const field of spec.value.fields) values[field.name] = field.value
}
</script>

<template>
  <div class="doc-block not-prose rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40">
    <div class="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-700">
      <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {{ spec.title || 'Interactief voorbeeld' }}
      </span>
      <button v-if="spec.fields.length" type="button" class="doc-button shrink-0" @click="reset">
        Herstellen
      </button>
    </div>

    <div class="space-y-4 p-4">
      <p v-if="spec.description" class="text-sm text-gray-600 dark:text-gray-400">{{ spec.description }}</p>
      <p v-if="spec.error" class="text-sm text-red-600 dark:text-red-400">{{ spec.error }}</p>

      <div v-for="field in spec.fields" :key="field.name" class="space-y-2">
        <!--
          Label naast het veld op breed scherm, erboven op mobiel. Het teken
          vóór en ná het getal heeft altijd een eigen plek in het veld, dus
          alle getallen en randen staan netjes onder elkaar.
        -->
        <div class="grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-center">
          <label :for="`f-${field.name}`" class="text-sm text-gray-700 dark:text-gray-300">
            {{ field.label }}
          </label>
          <NumberField
            :id="`f-${field.name}`"
            v-model="values[field.name]"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            :prefix="field.prefix"
            :suffix="field.suffix"
            :label="field.label"
          />
        </div>

        <input
          v-if="field.slider"
          v-model.number="values[field.name]"
          type="range"
          :min="field.min"
          :max="field.max"
          :step="field.step"
          :aria-label="field.label"
          class="doc-range"
        />
      </div>

      <dl
        v-if="results.length"
        class="divide-y divide-gray-200 border-t border-gray-200 pt-2 dark:divide-gray-700 dark:border-gray-700"
      >
        <div
          v-for="result in results"
          :key="result.name"
          class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2"
        >
          <dt class="text-sm text-gray-600 dark:text-gray-400">{{ result.label }}</dt>
          <dd class="font-mono text-base font-semibold text-gray-900 dark:text-gray-100" :title="result.error">
            {{ result.display }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
