<script setup lang="ts">
import { ErrorMessage, useForm } from 'vee-validate'
import { useFetch } from '/@src/composable/useFetch'
import type { RouteParamValue } from 'vue-router'
import { catchFieldError } from '/@src/utils/api/catchFieldError'
import { toTypedSchema } from '@vee-validate/zod'
import { string, number, boolean, z as zod } from 'zod'
import { useSubmitHandler } from '/@src/composable/useSubmitHandler'

const $fetch = useFetch()
const { submitHandler } = useSubmitHandler()
const route = useRoute()
const optionDepartamentos = ref([])
const optionFunctionaries = ref([])
const params = route.params as RouteParams

interface RouteParams { id?: string }
interface OrganizationChartForm {
  departamento_superior_id: number | null
  name: string
  abbreviation: string | null
  people_id: number | null
  email: string | null
  phone: string | null
  notifications: boolean
  active: boolean
}

const getDataUpdate = async (idValue: string | RouteParamValue[]) => {
  try {
    await $fetch(`/departamentos/${idValue}`).then(function (res) {
      setFieldValue('departamento_superior_id', res.departamento_superior_id)
      setFieldValue('name', res.name)
      setFieldValue('abbreviation', res.abbreviation)
      setFieldValue('people_id', res.people_id)
      setFieldValue('email', res.email)
      setFieldValue('phone', res.phone)
      setFieldValue('notifications', res.notifications)
      setFieldValue('active', res.active)
    })
  }
  catch (err: any) {
    catchFieldError(err, setFieldError)
  }
}

const validationSchema = toTypedSchema(
  zod.object({
    departamento_superior_id: number().nullish(),
    name: string({
      required_error: 'Nombre de la dependencia no puede estar vacio',
    }).min(3, { message: 'El nombre debe contener como mínimo 3 letras' }),
    abbreviation: string().nullish(),
    people_id: number().nullish(),
    email: string().nullish(),
    phone: string().nullish(),
    notifications: boolean().nullish(),
    active: boolean().nullish(),
  }),
)
const { values, handleSubmit, isSubmitting, setFieldError, setFieldValue } = useForm<OrganizationChartForm>({
  validationSchema,
})

onMounted(async () => {
  try {
    optionDepartamentos.value = (await $fetch('departamentos')).data.map((result: any) => ({
      value: result.id,
      label: result.name,
    }))
    optionFunctionaries.value = (await $fetch('getPeopleToFunctionary')).map((result: any) => ({
      value: result.id,
      label: result.ci + ' - ' + result.name + ', ' + result.last_name,
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
  await submitHandler('departamentos', values, params.id, false, setFieldError, '/setting/organization-chart')
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
        label: 'Lista del Orgranigrama',
        to: '/setting/organization-chart',
      },
      {
        label: 'Crear Dependencia',
      },
    ]"
  />

  <form
    class="form-layout is-stacked"
    @submit.prevent="onSubmit"
  >
    <div class="form-outer">
      <div class="form-header stuck-header">
        <div class="form-header-inner">
          <div class="left">
            <h3 v-if="!params.id">
              Registrar nueva Dependencia
            </h3>
            <h3 v-else>
              Editar Dependencia
            </h3>
          </div>
          <div class="right">
            <div class="buttons">
              <VButton
                to="/setting/organization-chart"
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
            <div class="column is-12">
              <!-- --------------------- Dependencia superior ------------------- -->
              <VField
                id="departamento_superior_id"
                label="Dependencia Superior"
                class="is-autocomplete-select"
              >
                <VControl icon="feather:search">
                  <VMultiselect
                    :model-value="values.departamento_superior_id"
                    placeholder="Seleccione una dependencia"
                    :close-on-select="true"
                    :searchable="true"
                    :options="optionDepartamentos"
                    @input="setFieldValue('departamento_superior_id', $event)"
                  />
                  <ErrorMessage class="help is-danger" name="district_id" />
                </VControl>
              </VField>
            </div>
            <div class="column is-8">
              <!-- --------------------- Nombre de la Dependencia --------------- -->
              <VField
                id="name"
                label="Nombre de la Dependencia"
              >
                <VControl>
                  <VInput class="input" />
                  <ErrorMessage
                    class="help is-danger"
                    name="name"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-4">
              <!-- --------------------- abreviacion ---------------------------- -->
              <VField
                id="abbreviation"
                label="Abreviación"
              >
                <VControl>
                  <VInput class="input" />
                  <ErrorMessage
                    class="help is-danger"
                    name="abbreviation"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-12">
              <!-- --------------------- Responsable --------------------------- -->
              <VField
                id="people_id"
                label="Responsable"
                class="is-autocomplete-select"
              >
                <VControl icon="feather:search">
                  <VMultiselect
                    :model-value="values.people_id"
                    placeholder="Seleccione un responsable"
                    :close-on-select="true"
                    :searchable="true"
                    :options="optionFunctionaries"
                    @input="setFieldValue('people_id', $event)"
                  />
                  <ErrorMessage class="help is-danger" name="people_id" />
                </VControl>
              </VField>
            </div>
            <div class="column is-6">
              <!-- --------------------- Correo de la dependencia -------------- -->
              <VField
                id="email"
                label="Correo Electronico"
              >
                <VControl>
                  <VInput
                    type="email"
                    class="input"
                    autocomplete="email"
                  />
                  <ErrorMessage
                    class="help is-danger"
                    name="email"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-6">
              <!-- --------------------- Telefono ------------------------------ -->
              <VField
                id="phone"
                label="Telefono / Celular"
              >
                <VControl>
                  <VInput class="input" />
                  <ErrorMessage
                    class="help is-danger"
                    name="phone"
                  />
                </VControl>
              </VField>
            </div>
          </div>
          <div class="columns is-multiline">
            <div class="column is-3">
              <!-- --------------------- Notificaciones ----------------------- -->
              <VField
                id="notifications"
                label=""
              >
                <VControl>
                  <VSwitchSegment
                    v-model="values.notifications"
                    label-true=""
                    label-false="Notificar al correo"
                    color="primary"
                  />
                </VControl>
              </VField>
            </div>
          </div>
          <div class="columns is-multiline">
            <div class="column is-2">
              <!-- --------------------- Estado ------------------------------- -->
              <VField id="active">
                <VControl>
                  <VSwitchSegment
                    v-model="values.active"
                    label-true=""
                    label-false="Estado"
                    color="primary"
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
