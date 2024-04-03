<script setup lang="ts">
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { useVFieldContext } from '/@src/composable/useVFieldContext'

export interface VMultiselectEmits {
  (event: 'update:value', value?: any): void
  (event: 'select', value: any): void
  (event: 'deselect', value: any): void
  (event: 'clear'): void
}

export interface VMultiselectProps {
  modelValue?: any
  options: any
  disabled?: boolean
  closeOnSelect?: boolean
  searchable?: boolean
  createTag?: boolean
  openDirection?: string
  mode?: string
}

const vFieldContext = reactive(
  useVFieldContext({
    create: false,
    help: 'VMultiselect',
  }),
)
const emits = defineEmits<VMultiselectEmits>()
const props = withDefaults(defineProps<VMultiselectProps>(), {
  modelValue: [],
  options: [],
  disabled: false,
  closeOnSelect: true,
  searchable: true,
  createTag: false,
  mode: 'single',
  openDirection: 'bottom',
})

const value = ref(vFieldContext.field?.value ?? props.modelValue)

watch(value, () => {
  emits('update:value', value.value)
})

watch(
  () => props.modelValue,
  () => {
    value.value = props.modelValue
  },
)

const handleSelect = (value: any) => {
  emits('select', value)
}

const handleDeselect = (value: any) => {
  emits('deselect', value)
}

const handleClear = () => {
  emits('clear')
}
</script>

<template>
  <Multiselect
    :id="vFieldContext.id"
    v-model="value"
    :mode="props.mode"
    :options="props.options"
    :disabled="props.disabled"
    :close-on-select="props.closeOnSelect"
    :searchable="props.searchable"
    :create-tag="props.createTag"
    :name="vFieldContext.id"
    :open-direction="props.openDirection"
    @select="handleSelect"
    @deselect="handleDeselect"
    @clear="handleClear"
  />
</template>

<style lang="scss">
@import '@vueform/multiselect/themes/default.css';
</style>
