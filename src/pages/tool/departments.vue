<script setup lang="ts">
import { useViewWrapper } from '/@src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Listado de Departamentos')

useHead({
  title: 'Listado de Departamentos',
})
</script>

<template>
  <div class="page-content-inner">
    <DepartmentList />
  </div>
</template>
