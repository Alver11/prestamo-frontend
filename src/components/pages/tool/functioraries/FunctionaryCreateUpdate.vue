<script setup lang="ts">
import { ErrorMessage, useForm } from 'vee-validate'
import { useFetch } from '/@src/composable/useFetch'
import { onMounted, ref } from 'vue'
import type { RouteParamValue } from 'vue-router'
import { catchFieldError } from '/@src/utils/api/catchFieldError'
import { toTypedSchema } from '@vee-validate/zod'
import { string, number, boolean, z as zod } from 'zod'
import { useSubmitHandler } from '/@src/composable/useSubmitHandler'

const $fetch = useFetch()
const { submitHandler } = useSubmitHandler()
const route = useRoute()
const params = route.params as RouteParams

interface RouteParams { id?: string }
interface Department {
  value: number
  label: string
  districts: Array<{
    value: number
    label: string
  }>
}
const optionDepartment = ref<
  Array<Department>
>([])
const optionsDistrict = ref<Array<{ value: number, label: string }>>([])
const districtEnable = ref<boolean>(true)
const optionOrganizationChart = ref([])

interface Functionary {
  ci: string
  name: string
  last_name: string
  date_birth: string
  gender: string
  nationality: string
  address: string | null
  phone: string | null
  email: string | null
  department_id: number | null
  district_id: number
  departamento_id: number
  active: boolean
}

const getDataUpdate = async (idValue: string | RouteParamValue[]) => {
  try {
    await $fetch(`/functionaries/${idValue}`).then(function (res) {
      setFieldValue('ci', res.people.ci)
      setFieldValue('active', res.active)
      setFieldValue('name', res.people.name)
      setFieldValue('last_name', res.people.last_name)
      setFieldValue('date_birth', res.people.date_birth)
      setFieldValue('nationality', res.people.nationality)
      setFieldValue('gender', res.people.gender)
      setFieldValue('email', res.people.email)
      setFieldValue('phone', res.people.phone)
      findDepartmentByDistrict(res.people.district_id)
      selectDepartment()
      setFieldValue('district_id', res.people.district_id)
      setFieldValue('address', res.people.address)
      setFieldValue('departamento_id', res.departamento_id)
    })
  }
  catch (err: any) {
    catchFieldError(err, setFieldError)
  }
}

const validationSchema = toTypedSchema(
  zod.object({
    ci: string({ required_error: 'El campo no puede estar vacio' }),
    name: string({ required_error: 'El campo no puede estar vacio' }),
    last_name: string({ required_error: 'El campo no puede estar vacio' }),
    date_birth: string({ required_error: 'El campo no puede estar vacio' }),
    gender: string({ required_error: 'El campo no puede estar vacio' }),
    nationality: string({ required_error: 'El campo no puede estar vacio' }),
    address: string().nullish(),
    phone: string().nullish(),
    email: string().nullish(),
    department_id: number().nullish(),
    district_id: number({ required_error: 'Seleccione un distrito' }),
    departamento_id: number({ required_error: 'Seleccione una dependencia' }),
    active: boolean().nullish(),
  }),
)

const { values, handleSubmit, isSubmitting, setFieldError, setFieldValue } = useForm<Functionary>({
  validationSchema,
})

onMounted(async () => {
  try {
    optionDepartment.value = (await $fetch('departments')).data.map((result: any) => ({
      value: result.id,
      label: result.name,
      districts: result.districts.map((district: any) => ({
        value: district.id, label: district.name,
      })),
    }))
    optionOrganizationChart.value = (await $fetch('departamentos')).data.map((result: any) => ({
      value: result.id,
      label: result.name,
    }))
    if (params.id) {
      await getDataUpdate(params.id)
    }
  }
  catch (error) {
    console.error('Error al cargar los datos', error)
  }
})

const selectDepartment = () => {
  const department = optionDepartment.value.find(
    (element: Department) => element.value === values.department_id,
  )
  if (department && department.districts) {
    districtEnable.value = false
    optionsDistrict.value = department.districts
  }
}
const findDepartmentByDistrict = (districtValue: number) => {
  const department = optionDepartment.value.find(
    dept =>
      dept.districts
      && dept.districts.some(district => district.value === districtValue),
  )
  setFieldValue('department_id', department ? department.value : null)
  districtEnable.value = false
}
const desSelect = () => {
  setFieldValue('district_id', 0)
  districtEnable.value = true
}

// -------------Save or Update ----------------------------
const onSubmit = handleSubmit(async () => {
  await submitHandler('functionaries', values, params.id, false, setFieldError, '/tool/functionary')
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
        label: 'Lista Funcionarios',
        to: '/tool/functionary',
      },
      {
        label: 'Registrar Funcionarios',
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
              Registrar nuevo Funcionario
            </h3>
            <h3 v-else>
              Editar Funcionario
            </h3>
          </div>
          <div class="right">
            <div class="buttons">
              <VButton
                to="/tool/functionary"
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
              <!-- -------------------- CI  --------------------------- -->
              <VField
                id="ci"
                label="Número de CI"
              >
                <VControl>
                  <VInput class="input" />
                  <ErrorMessage
                    class="help is-danger"
                    name="ci"
                  />
                </VControl>
              </VField>
            </div>
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
          <div class="columns is-multiline">
            <div class="column is-6">
              <!-- -------------------- Nombre ----------------------------- -->
              <VField
                id="name"
                label="Nombre"
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
            <div class="column is-6">
              <!-- -------------------- Apellido --------------------------- -->
              <VField
                id="last_name"
                label="Apellido"
              >
                <VControl>
                  <VInput class="input" />
                  <ErrorMessage
                    class="help is-danger"
                    name="last_name"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-4">
              <!-- -------------------- Fecha de Nacimiento ---------------- -->
              <VField
                id="date_birth"
                label="Fecha de Nacimiento"
              >
                <VControl>
                  <VInput class="input" />
                  <ErrorMessage
                    class="help is-danger"
                    name="date_birth"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-4">
              <!-- -------------------- Nacionalidad --------------------- -->
              <VField
                id="nationality"
                label="Nacionalidad"
              >
                <VControl>
                  <VInput class="input" />
                  <ErrorMessage
                    class="help is-danger"
                    name="nationality"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-4">
              <!-- -------------------- Sexo --------------------- -->
              <VField
                id="gender"
                label="Sexo"
              >
                <VControl>
                  <VInput class="input" />
                  <ErrorMessage
                    class="help is-danger"
                    name="gender"
                  />
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
                label="Nro. Celular"
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
            <div class="column is-6">
              <!-- -------------------- Departamento ----------------------- -->
              <VField
                id="department_id"
                label="Departamento"
                class="is-autocomplete-select"
              >
                <VControl icon="feather:search">
                  <VMultiselect
                    placeholder="Seleccione un Departamento"
                    :model-value="values.department_id"
                    :close-on-select="true"
                    :searchable="true"
                    :options="optionDepartment"
                    @input="setFieldValue('department_id', $event)"
                    @select="selectDepartment"
                    @deselect="desSelect"
                    @clear="desSelect"
                  />
                </VControl>
              </VField>
            </div>
            <div class="column is-6">
              <!-- -------------------- Distrito --------------------------- -->
              <VField
                id="district_id"
                label="Distrito"
                class="is-autocomplete-select"
              >
                <VControl icon="feather:search">
                  <VMultiselect
                    :model-value="values.district_id"
                    placeholder="Seleccione un Distrito"
                    :disabled="districtEnable"
                    :close-on-select="true"
                    :searchable="true"
                    :options="optionsDistrict"
                    @input="setFieldValue('district_id', $event)"
                  />
                  <ErrorMessage class="help is-danger" name="district_id" />
                </VControl>
              </VField>
            </div>
            <div class="column is-12">
              <!-- -------------------- Dirección -------------------------- -->
              <VField
                id="address"
                label="Dirección"
              >
                <VControl>
                  <VInput type="text" placeholder="" />
                </VControl>
              </VField>
            </div>
            <div class="column is-12">
              <!-- -------------------- Dependencia --------------------------- -->
              <VField
                id="departamento_id"
                label="Dependencia"
                class="is-autocomplete-select"
              >
                <VControl icon="feather:search">
                  <VMultiselect
                    :model-value="values.departamento_id"
                    placeholder="Seleccione la dependencia al que pertenece"
                    :close-on-select="true"
                    :searchable="true"
                    :options="optionOrganizationChart"
                    @input="setFieldValue('departamento_id', $event)"
                  />
                  <ErrorMessage class="help is-danger" name="departamento_id" />
                </VControl>
              </VField>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>
