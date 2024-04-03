<script setup lang="ts">
import { useViewWrapper } from '/src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Listado de Funcionarios')

useHead({
  title: 'Listado de Funcionarios',
})
</script>

<template>
  <div class="page-content-inner">
    <FunctionaryList />
  </div>
</template>
