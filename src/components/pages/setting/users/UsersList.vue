<script setup lang="ts">
import { useFetch } from '/@src/composable/useFetch'
import { hasPermission } from '/@src/utils/permissions'
import { useLaravelError } from '/@src/composable/useLaravelError'
import { useNotyf } from '/@src/composable/useNotyf'

const $fetch = useFetch()
const notify = useNotyf()
const router = useRouter()
const modalDeleted = ref(false)
const columns = [
  { data: 'id', title: 'ID', visible: false },
  {
    data: 'profile_path',
    title: 'Perfil',
    orderable: false,
    searchable: false,
    render: function (data: any, type: any) {
      if (data != null && data != '') {
        return '<div class="image-list"><img src="' + import.meta.env.VITE_API_BASE_URL + '/storage/' + data + '" alt="Image" /></div>'
      }
      else {
        return '<div class="image-list"><img src="/src/assets/illustrations/images/ImageNotFound.png" alt="Image" /></div>'
      }
    },
  },
  { data: 'name', title: 'Nombre de Usuario', typeSearch: 'input' },
  { data: 'people.name', title: 'Nombre', typeSearch: 'input' },
  { data: 'people.last_name', title: 'Apellido', typeSearch: 'input' },
  { data: 'email', title: 'Correo Electrónico', typeSearch: 'input' },
  {
    data: 'roles',
    name: 'roles.name',
    title: 'Rol',
    sorting: false,
    orderable: false,
    typeSearch: 'input',
    searchable: false,
    render: function (data: any, type: any) {
      let rolHtml = ''
      if (data.length > 0) {
        data.forEach((roles: any) => {
          if (type === 'display') {
            rolHtml = rolHtml + '- <p class="is-primary">' + roles.name + '</p>'
          }
        })
      }
      return rolHtml
    },
  },
  {
    data: 'active',
    title: 'Estado',
    typeSearch: 'select',
    valueSearch: [
      {
        value: true,
        text: 'Activo',
      },
      {
        value: false,
        text: 'Inactivo',
      },
    ],
    render: function (data: any) {
      return data ? 'Activo' : 'Inactivo'
    },
  },
]
const idData = ref(null)
const emit = defineEmits(['updateTable'])
const buttonTable = [
  { button: 'edit', permission: 'users edit' },
  { button: 'delete', permission: 'users delete' },
]
const updateTableEvent = ref(false)

const handleEdit = (id: number) => {
  router.push('/setting/users/update/' + id)
}

const handleDelete = (data: any) => {
  idData.value = data
  modalDeleted.value = true
}

async function DeletedTraining() {
  try {
    updateTableEvent.value = false
    emit('updateTable')
    const res = await $fetch(`/users/${idData.value}`, { method: 'DELETE' })
    modalDeleted.value = false
    updateTableEvent.value = true
    emit('updateTable')
    if (res.status == 200) {
      notify.success(`Datos eliminados Correctamente!`)
    }
    else {
      notify.error(res.data.message)
    }
  }
  catch (err: any) {
    modalDeleted.value = false
    notify.error(useLaravelError(err))
  }
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
        label: 'Lista de Usuarios',
      },
    ]"
  />

  <div
    v-if="hasPermission('users create')"
    class="list-flex-toolbar flex-list-v1"
  >
    <VButtons>
      <VButton
        to="/setting/users/create"
        color="primary"
        icon="fas fa-plus"
      >
        Nuevo Usuario
      </VButton>
    </VButtons>
  </div>

  <DataTableWrapper
    :columns="columns"
    server-side-url="users"
    :update-table-event="updateTableEvent"
    :button-table="buttonTable"
    :search-columns="true"
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
        @click="DeletedTraining"
      >
        Eliminar
      </VButton>
    </template>
  </VModal>
</template>
