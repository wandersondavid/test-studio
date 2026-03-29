import axios from 'axios'
import { getAuthToken } from './session'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.error ?? 'Erro inesperado'
    return Promise.reject(new Error(message))
  }
)
