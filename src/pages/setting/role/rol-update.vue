<script setup lang="ts">
import { useViewWrapper } from '/@src/stores/viewWrapper'

const viewWrapper = useViewWrapper()
viewWrapper.setPageTitle('Actualizar Rol')

useHead({
  title: 'Actualizar Rol',
})
</script>

<template>
  <div class="page-content-inner">
    <RolCreateUpdate />
  </div>
</template>
