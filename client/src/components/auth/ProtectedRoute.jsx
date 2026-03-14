import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-4" />
                <p className="text-white/40 text-sm">Authenticating…</p>
            </div>
        )
    }

    if (!user) return <Navigate to="/login" replace />

    return children
}
