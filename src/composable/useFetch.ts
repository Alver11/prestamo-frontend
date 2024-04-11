import { ofetch } from 'ofetch'
import { useUserSession } from '/@src/stores/userSession'

export function useFetch() {
  const userSession = useUserSession()

  return ofetch.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1/' ?? 'http://localhost:8080',
    onRequest: ({ options }) => {
      if (userSession.isLoggedIn) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${userSession.token}`,
        }
      }
    },
  })
}
