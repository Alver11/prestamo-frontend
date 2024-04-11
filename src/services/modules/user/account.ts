import { useFetch } from '/@src/composable/useFetch'
import { useUserSession } from '/@src/stores/userSession'
import { useApi } from '/@src/composable/useApi'

export async function authenticateUser(route: string, body: object) {
  // const $fetch = useFetch()
  const api = useApi()
  const userSession = useUserSession()

  // const data = await $fetch(route,{method: 'POST', body: body })
  const { data: data } = await api.post(route)
  userSession.setToken(data.token)

  // const user = await $fetch('user')
  // userSession.setUser(user)
}
