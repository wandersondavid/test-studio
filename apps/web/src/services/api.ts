import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.error ?? 'Erro inesperado'
    return Promise.reject(new Error(message))
  }
)
