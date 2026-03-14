import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedToken = localStorage.getItem('scriptoria_token')
        const storedUser = localStorage.getItem('scriptoria_user')
        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            const { data } = await apiClient.post('/api/auth/login', { email, password })
            setToken(data.token)
            setUser(data.user)
            localStorage.setItem('scriptoria_token', data.token)
            localStorage.setItem('scriptoria_user', JSON.stringify(data.user))
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed')
        }
    }

    const register = async (name, email, password) => {
        try {
            const { data } = await apiClient.post('/api/auth/register', { name, email, password })
            setToken(data.token)
            setUser(data.user)
            localStorage.setItem('scriptoria_token', data.token)
            localStorage.setItem('scriptoria_user', JSON.stringify(data.user))
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed')
        }
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('scriptoria_token')
        localStorage.removeItem('scriptoria_user')
    }

    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
