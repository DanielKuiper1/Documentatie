<script setup>
import { computed, watch } from 'vue'

/**
 * Getalveld met eigen plus- en minknoppen.
 *
 * De ingebouwde pijltjes van de browser zijn overal net anders: ze verschijnen
 * pas bij hover, zijn nauwelijks te raken op een telefoon en volgen het donkere
 * thema niet. Daarom staan ze uit en zetten we er eigen knoppen naast, met
 * dezelfde stapgrootte en grenzen als het veld zelf.
 */
const props = defineProps({
  modelValue: { type: [Number, String], default: 0 },
  min: { type: [Number, String], default: null },
  max: { type: [Number, String], default: null },
  step: { type: [Number, String], default: 1 },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  label: { type: String, default: '' },
  id: { type: String, default: '' },
  readonly: { type: Boolean, default: false },
  compact: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const stepSize = computed(() => Number(props.step) || 1)
const minimum = computed(() => (props.min === null || props.min === '' ? null : Number(props.min)))
const maximum = computed(() => (props.max === null || props.max === '' ? null : Number(props.max)))

/** Aantal decimalen van de stapgrootte, om 0.1 + 0.2 = 0.30000000000000004 te vermijden. */
const decimals = computed(() => {
  const text = String(stepSize.value)
  const dot = text.indexOf('.')
  return dot === -1 ? 0 : text.length - dot - 1
})

const atMin = computed(() => minimum.value !== null && Number(props.modelValue) <= minimum.value)
const atMax = computed(() => maximum.value !== null && Number(props.modelValue) >= maximum.value)

function clamp(value) {
  let result = value
  if (minimum.value !== null) result = Math.max(result, minimum.value)
  if (maximum.value !== null) result = Math.min(result, maximum.value)
  return Number(result.toFixed(Math.max(decimals.value, 0)))
}

/**
 * Twee klikken vlak na elkaar mogen niet allebei van dezelfde oude waarde
 * uitgaan: de prop is pas bijgewerkt na de volgende render. Daarom onthouden we
 * hier de laatst verstuurde waarde tot die terugkomt.
 */
let pending = null

watch(
  () => props.modelValue,
  () => {
    pending = null
  }
)

function nudge(direction) {
  if (props.readonly) return
  const current = pending !== null ? pending : Number(props.modelValue)
  const base = Number.isFinite(current) ? current : minimum.value ?? 0
  const next = clamp(base + direction * stepSize.value)
  pending = next
  emit('update:modelValue', next)
}

function onInput(event) {
  const raw = event.target.value
  // Leeg laten mag tijdens het typen; anders springt het veld onder je vingers weg.
  emit('update:modelValue', raw === '' ? '' : Number(raw))
}
</script>

<template>
  <div class="doc-field" :class="compact ? 'doc-field-compact' : ''">
    <span v-if="!compact" class="doc-field-unit" aria-hidden="true">{{ prefix }}</span>

    <input
      :id="id"
      type="number"
      inputmode="decimal"
      :value="modelValue"
      :min="min ?? undefined"
      :max="max ?? undefined"
      :step="step"
      :readonly="readonly"
      :aria-label="label || undefined"
      @input="onInput"
    />

    <span v-if="!compact" class="doc-field-unit" aria-hidden="true">{{ suffix }}</span>

    <div v-if="!readonly" class="doc-stepper" aria-hidden="true">
      <button type="button" tabindex="-1" :disabled="atMax" title="Verhogen" @click="nudge(1)">
        <svg viewBox="0 0 10 10" fill="currentColor"><path d="M5 2.5 8.5 7h-7z" /></svg>
      </button>
      <button type="button" tabindex="-1" :disabled="atMin" title="Verlagen" @click="nudge(-1)">
        <svg viewBox="0 0 10 10" fill="currentColor"><path d="M5 7.5 1.5 3h7z" /></svg>
      </button>
    </div>
  </div>
</template>
