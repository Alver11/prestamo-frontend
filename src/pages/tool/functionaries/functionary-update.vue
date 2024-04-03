<script setup lang="ts">
import { useViewWrapper } from '/src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Actualizar Funcionario')

useHead({
  title: 'Actualizar Funcionario',
})
</script>

<template>
  <div class="page-content-inner">
    <FunctionaryCreateUpdate />
  </div>
</template>
