<script setup lang="ts">
import { useViewWrapper } from '/@src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Listado del Organigrama')

useHead({
  title: 'Listado del Organigrama',
})
</script>

<template>
  <div class="page-content-inner">
    <OrganizationChartList />
  </div>
</template>
