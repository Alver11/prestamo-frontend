<script setup lang="ts">
import { useViewWrapper } from '/@src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Actualizar Dependencias')

useHead({
  title: 'Actualizar Dependencias',
})
</script>

<template>
  <div class="page-content-inner">
    <OrganizationChartCreateUpdate />
  </div>
</template>
