import { ofetch } from 'ofetch'

import { useUserSession } from '/@src/stores/userSession'

export function useFetch() {
  return ofetch.create({
    baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1/' ?? 'http://localhost:8080',
    onRequest: ({ options }) => {
      const userSession = useUserSession()

      if (userSession.isLoggedIn) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${userSession.token}`,
        }
      }
    },
  })
}
