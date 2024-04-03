<script setup lang="ts">
import { useViewWrapper } from '/@src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Crear Dependencias')

useHead({
  title: 'Crear Dependencias',
})
</script>

<template>
  <div class="page-content-inner">
    <OrganizationChartCreateUpdate />
  </div>
</template>
