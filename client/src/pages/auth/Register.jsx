import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Film, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { register: authRegister, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        logout() // Ensure all ghost sessions are cleared on mount
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }
        setLoading(true)
        setError(null)
        try {
            await authRegister(name, email, password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6">
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-gold-500/20 transition-all">
                    <Film className="w-4 h-4 text-navy-900" />
                </div>
                <span className="font-bold text-sm">Coffee-with-Cinema</span>
            </Link>

            <div className="w-full max-w-md animate-slide-up">
                <div className="glass-card p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
                        <p className="text-white/40 text-sm">Start building your next production</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Full Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="input-field py-3"
                                placeholder="Jane Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="input-field py-3"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="input-field py-3"
                                placeholder="••••••••"
                            />
                            <p className="text-white/30 text-xs mt-1.5">Must be at least 8 characters long</p>
                        </div>

                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3.5 mt-2 font-medium"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-white/40 text-sm mt-8">
                        Already have an account?{' '}
                        <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
