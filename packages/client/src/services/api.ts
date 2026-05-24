import axios, { type InternalAxiosRequestConfig } from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'kvitifai',
  },
})

let accessToken = ''

export function setAccessToken(token: string) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  config.headers['X-Requested-With'] = 'kvitifai'
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const url = original?.url ?? ''

    const isAuthRoute = AUTH_PATHS.some((p) => url.includes(p))
    if (status !== 401 || !original || original._retry || isAuthRoute) {
      return Promise.reject(error)
    }

    original._retry = true
    try {
      const { data } = await axios.post(
        '/api/auth/refresh',
        {},
        {
          withCredentials: true,
          headers: { 'X-Requested-With': 'kvitifai' },
        },
      )
      accessToken = data.accessToken
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${accessToken}`
      return api(original)
    } catch (refreshErr) {
      accessToken = ''
      try {
        localStorage.removeItem('kvitifai-auth')
      } catch {
        /* ignore */
      }
      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace('/login')
      }
      return Promise.reject(refreshErr)
    }
  },
)
