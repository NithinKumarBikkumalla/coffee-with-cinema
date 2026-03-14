import { Link } from 'react-router-dom'
import { Film, Sparkles, BookOpen, Clock, Settings, ArrowRight, PlayCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function FeatureCard({ icon: Icon, title, desc }) {
    return (
        <div className="glass-card p-8 hover-lift group">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gold-500/10 transition-colors duration-300">
                <Icon className="w-6 h-6 text-white/60 group-hover:text-gold-400 transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-white/40 leading-relaxed text-sm">{desc}</p>
        </div>
    )
}

export default function Landing() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-navy-950 flex flex-col items-center">
            {/* Navbar */}
            <nav className="w-full max-w-7xl px-6 h-20 flex items-center justify-between z-10 transition-all duration-300 pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                        <Film className="w-5 h-5 text-navy-900" />
                    </div>
                    <span className="font-widescreen text-xl font-bold tracking-widest text-white uppercase">Coffee-with-Cinema</span>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <Link to="/dashboard" className="btn-primary text-sm">Go to Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                            <Link to="/register" className="btn-primary text-sm hidden sm:flex">Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            <main className="flex-1 w-full max-w-7xl flex flex-col">
                {/* Hero Section */}
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32 relative">

                    {/* Background effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] mix-blend-screen" />
                        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gold-500/10 rounded-full blur-[100px] mix-blend-screen" />
                    </div>

                    <div className="badge bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-8 px-4 py-1.5 animate-fade-in">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI-Powered Film Pre-Production</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold font-widescreen tracking-tight mb-8 leading-[1.1] animate-slide-up max-w-4xl text-gradient">
                        From idea to<br />
                        <span className="text-white italic font-serif opacity-90">industry-standard pre-production.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl leading-relaxed animate-slide-up [animation-delay:100ms]">
                        Turn your brilliant concept into a complete, properly formatted screenplay, character bibles, and sound design notes in minutes.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up [animation-delay:200ms]">
                        <Link
                            to={user ? "/dashboard" : "/register"}
                            className="btn-primary px-8 py-4 text-lg items-center gap-2 group shadow-xl shadow-gold-500/20"
                        >
                            Start Creating <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#features" className="btn-secondary px-8 py-4 text-lg flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-white/40" /> How it works
                        </a>
                    </div>
                </div>

                {/* Features Grid */}
                <div id="features" className="py-24 px-6 border-t border-white/5 bg-navy-900/50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for every creator.</h2>
                            <p className="text-white/40 max-w-2xl mx-auto">Coffee-with-Cinema provides structured templates to assist you perfectly at every level of production.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <FeatureCard
                                icon={Film}
                                title="Independent Filmmakers"
                                desc="Save time and budget. Get shoot-ready screenplays and detailed sound design notes instantly to begin pre-visualization."
                            />
                            <FeatureCard
                                icon={PlayCircle}
                                title="YouTube Content Creators"
                                desc="Maintain episode consistency and deep character arcs across your web series with structured storytelling tools."
                            />
                            <FeatureCard
                                icon={BookOpen}
                                title="Film School Students"
                                desc="Learn by doing. Study professional industry formatting and narrative templates dynamically generated from your ideas."
                            />
                        </div>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="w-full py-8 text-center text-white/20 text-sm border-t border-white/5 bg-navy-950 mt-auto">
                <p>© 2026 Coffee-with-Cinema.</p>
            </footer>
        </div>
    )
}
