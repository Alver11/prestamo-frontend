<script setup lang="ts">
import { ErrorMessage, useForm } from 'vee-validate'
import type { RouteParamValue } from 'vue-router'
import { catchFieldError } from '/@src/utils/api/catchFieldError'
import { toTypedSchema } from '@vee-validate/zod'
import { string, z as zod } from 'zod'
import { useSubmitHandler } from '/@src/composable/useSubmitHandler'
import { useFetch } from '/@src/composable/useFetch'

const $fetch = useFetch()
const { submitHandler } = useSubmitHandler()
const route = useRoute()
const tagsPermission = ref()
const params = route.params as RouteParams

interface RouteParams { id?: string }
interface userForm {
  name: string | null
  permission: object
}

const getDataUpdate = async (idValue: string | RouteParamValue[]) => {
  try {
    await $fetch(`/roles/${idValue}`).then(function (res) {
      setFieldValue('name', res.name)
      setFieldValue('permission', res.permissions.map((permission: any) => permission.id))
    })
  }
  catch (err: any) {
    catchFieldError(err, setFieldError)
  }
}

const validationSchema = toTypedSchema(
  zod.object({
    name: string({
      required_error: 'Nombre de usuario no puede estar vacio',
    }).min(3, { message: 'El nombre debe contener como mínimo 3 letras' }),
  }),
)

const { values, handleSubmit, isSubmitting, setFieldError, setFieldValue } = useForm<userForm>({
  validationSchema,
})

onMounted(async () => {
  try {
    tagsPermission.value = (await $fetch('permission')).map((role: any) => ({
      value: role.id,
      label: role.description,
    }))
    if (params.id) {
      await getDataUpdate(params.id)
    }
  }
  catch (error) {
    console.error('Error al cargar los datos', error)
  }
})

// -------------Save or Update ----------------------------
const onSubmit = handleSubmit(async () => {
  await submitHandler('roles', JSON.stringify(values), params.id, false, setFieldError, '/setting/rol')
})

const { y } = useWindowScroll()
const isStuck = computed(() => {
  return y.value > 30
})
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
        label: 'Lista de Roles',
        to: '/setting/rol',
      },
      {
        label: 'Crear Rol',
      },
    ]"
  />

  <form
    class="form-layout is-stacked"
    @submit.prevent="onSubmit"
  >
    <div class="form-outer">
      <div
        :class="[isStuck && 'is-stuck']"
        class="form-header stuck-header"
      >
        <div class="form-header-inner">
          <div class="left">
            <h3 v-if="!params.id">
              Registrar nuevo Rol
            </h3>
            <h3 v-else>
              Editar Rol
            </h3>
          </div>
          <div class="right">
            <div class="buttons">
              <VButton
                to="/setting/rol"
                icon="lnir lnir-arrow-left rem-100"
                light
                dark-outlined
                :disabled="isSubmitting"
              >
                Cancel
              </VButton>
              <VButton
                v-if="params.id"
                type="submit"
                color="primary"
                raised
              >
                Actualizar
              </VButton>
              <VButton
                v-else
                type="submit"
                color="primary"
                raised
              >
                Guardar
              </VButton>
            </div>
          </div>
        </div>
      </div>
      <div class="form-body">
        <div class="form-section">
          <div class="columns is-multiline">
            <div class="column is-6">
              <VField
                id="name"
                label="Nombre del Rol"
              >
                <VControl icon="feather:lock">
                  <VInput class="input" />
                  <ErrorMessage
                    class="help is-danger"
                    name="name"
                  />
                </VControl>
              </VField>
            </div>
          </div>
          <div class="columns is-multiline">
            <div class="column is-12">
              <VField
                label="Lista de Permisos"
              >
                <VControl>
                  <VMultiselect
                    :model-value="values.permission"
                    placeholder="Agrega los permisos"
                    :close-on-select="false"
                    :searchable="true"
                    :mode="'tags'"
                    :options="tagsPermission"
                    @input="setFieldValue('permission', $event)"
                  />
                </VControl>
              </VField>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
