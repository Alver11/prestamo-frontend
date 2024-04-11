import { useFetch } from '/@src/composable/useFetch'
import { useUserSession } from '/@src/stores/userSession'

export async function authenticateUser(route: string, body: object) {
  const $fetch = useFetch()
  const userSession = useUserSession()

  const data = await $fetch(route,{method: 'POST', body: body })
  userSession.setToken(data.token)

  const user = await $fetch('user')
  userSession.setUser(user)
}
