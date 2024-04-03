<script setup lang="ts">
import { useViewWrapper } from '/src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Registrar Funcionario')

useHead({
  title: 'Registrar Funcionario',
})
</script>

<template>
  <div class="page-content-inner">
    <FunctionaryCreateUpdate />
  </div>
</template>
