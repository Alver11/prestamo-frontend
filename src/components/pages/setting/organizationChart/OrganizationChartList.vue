<script setup lang="ts">
import { hasPermission } from '/@src/utils/permissions'
import { useSubmitHandler } from '/@src/composable/useSubmitHandler'

const { deleteHandler } = useSubmitHandler()
const router = useRouter()
const modalDeleted = ref(false)
const columns = [
  { data: 'id', title: 'ID', visible: false },
  { data: 'name', title: 'Dependencia' },
  { data: 'abbreviation', title: 'Abreviación' },
  { data: 'departamento_superior.name', name: 'name', title: 'Dependencia Perteneciente' },
  { data: 'people.name', title: 'Nombre del Encargado', visible: false },
  { data: 'email', title: 'Email', visible: false },
  { data: 'phone', title: 'Telefono', visible: false },
]
const idData = ref()
const emit = defineEmits(['updateTable'])
const buttonTable = [
  { button: 'edit', permission: 'organizationsChart edit' },
  { button: 'delete', permission: 'organizationsChart delete' },
]
const updateTableEvent = ref(false)

const handleEdit = (id: number) => {
  router.push('/setting/organization-chart/update/' + id)
}

const handleDelete = (data: any) => {
  idData.value = data
  modalDeleted.value = true
}
async function DeleteItem() {
  updateTableEvent.value = false
  emit('updateTable')
  await deleteHandler('/departamentos', idData.value)
  modalDeleted.value = false
  updateTableEvent.value = true
  emit('updateTable')
}
</script>

<template>
  <VBreadcrumb
    with-icons
    separator="bullet"
    :items="[
      {
        label: 'Panel Principal',
        hideLabel: true,
        icon: 'feather:home',
        to: '/app',
      },
      {
        label: 'Lista del Organigrama',
      },
    ]"
  />

  <div
    v-if="hasPermission('organizationsChart create')"
    class="list-flex-toolbar flex-list-v1"
  >
    <VButtons>
      <VButton
        to="/setting/organization-chart/create"
        color="primary"
        icon="fas fa-plus"
      >
        Nueva Dependencia
      </VButton>
    </VButtons>
  </div>
  <DataTableWrapper
    :columns="columns"
    server-side-url="departamentos"
    :update-table-event="updateTableEvent"
    :button-table="buttonTable"
    @edit="handleEdit"
    @delete="handleDelete"
  />

  <VModal
    title="Eliminar Datos"
    :open="modalDeleted"
    size="small"
    actions="center"
    @close="modalDeleted = false"
  >
    <template #content>
      <VPlaceholderSection
        title="¿Eliminar Registro? "
        subtitle="Los cambios ya no se podran revertir!"
      />
    </template>
    <template #action>
      <VButton
        color="danger"
        raised
        @click.prevent="DeleteItem"
      >
        Eliminar
      </VButton>
    </template>
  </VModal>
</template>
