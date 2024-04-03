<script setup lang="ts">
import { hasPermission } from '/@src/utils/permissions'

const emit = defineEmits(['close'])
</script>

<template>
  <div class="sidebar-panel is-generic">
    <div class="subpanel-header">
      <h3 class="no-mb">
        Datos Generales
      </h3>
      <div
        class="panel-close"
        tabindex="0"
        role="button"
        @keydown.space.prevent="emit('close')"
        @click="emit('close')"
      >
        <i
          aria-hidden="true"
          class="iconify"
          data-icon="feather:x"
        />
      </div>
    </div>
    <div
      class="inner"
      data-simplebar
    >
      <ul>
        <li v-if="hasPermission('program departments')">
          <RouterLink to="/tool/departments">
            <i
              aria-hidden="true"
              class="lnil lnil-world-2 pr-2"
            />
            Departamento
          </RouterLink>
        </li>
        <li v-if="hasPermission('program functionaries')">
          <RouterLink to="/tool/functionary">
            <i
              aria-hidden="true"
              class="lnil lnil-users-alt pr-2"
            />
            Funcionarios
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
@import '/src/scss/layout/sidebar-panel';
</style>
