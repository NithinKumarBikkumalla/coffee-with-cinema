import axios from 'axios'
import toast from 'react-hot-toast'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('scriptoria_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Response interceptor — handle 401
apiClient.interceptors.response.use(
    (res) => res,
    (error) => {
        const url = error.config?.url || ''
        const isAuthRoute = url.includes('/api/auth/login') || url.includes('/api/auth/register')

        if (error.response?.status === 401 && !isAuthRoute) {
            localStorage.removeItem('scriptoria_token')
            localStorage.removeItem('scriptoria_user')
            toast.error('Session expired. Please log in again.')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default apiClient
