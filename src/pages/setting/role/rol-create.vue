<script setup lang="ts">
import { useViewWrapper } from '/@src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Crear Rol')

useHead({
  title: 'Crear Rol',
})
</script>

<template>
  <div class="page-content-inner">
    <RolCreateUpdate />
  </div>
</template>
