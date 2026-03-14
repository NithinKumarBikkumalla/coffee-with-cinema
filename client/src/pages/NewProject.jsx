import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Film, ArrowLeft, Loader2, Sparkles, ChevronRight, HelpCircle, MessageSquare } from 'lucide-react'
import { useStream } from '../hooks/useStream'
import apiClient from '../api/client'
import toast from 'react-hot-toast'
import HelpModal from '../components/modals/HelpModal'
import ContactModal from '../components/modals/ContactModal'

const GENRES = ['Romantic', 'Drama', 'Love', 'Thriller', 'Comedy', 'Horror', 'Action', 'Sci-Fi']
const TONES = ['Dark', 'Light', 'Comedic', 'Tense', 'Inspirational', 'Heartfelt', 'Satirical']
const FORMATS = [
    { value: 'film', label: 'Film', desc: 'Standard Feature Film' },
    { value: 'web_series', label: 'Web Series', desc: 'Episodic content' },
    { value: 'other', label: 'Another Format', desc: 'Custom formats' },
]

export default function NewProject() {
    const navigate = useNavigate()
    const { data: streamData, isStreaming, start } = useStream()
    const [form, setForm] = useState({
        title: '', genre: 'Romantic', tone: 'Light', premise: '', format: 'film',
    })
    const [errors, setErrors] = useState({})
    const [phase, setPhase] = useState('form') // 'form' | 'generating' | 'saving'
    const [showHelp, setShowHelp] = useState(false)
    const [showContact, setShowContact] = useState(false)

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

    const validate = () => {
        const e = {}
        if (!form.title.trim()) e.title = 'Project title required'
        if (form.premise.trim().length < 20) e.premise = 'Give your premise at least 20 characters'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleGenerate = async (ev) => {
        ev.preventDefault()
        if (!validate()) return
        setPhase('generating')

        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
        start(`${apiBase}/api/generate/screenplay`, {
            body: form,
            onComplete: async (rawData) => {
                setPhase('saving')
                try {
                    let screenplay
                    try {
                        const cleanData = rawData.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
                        const match = cleanData.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
                        screenplay = JSON.parse(match ? match[0] : cleanData)
                    }
                    catch (e) {
                        console.error('Failed to parse JSON:', e)
                        screenplay = { title: form.title, raw: rawData, acts: [] }
                    }

                    const { data: project } = await apiClient.post('/api/projects', {
                        ...form,
                        screenplayJSON: screenplay,
                    })
                    toast.success('Screenplay generated!')
                    navigate(`/projects/${project.id}`)
                } catch (err) {
                    toast.error('Failed to save project')
                    setPhase('form')
                }
            },
        })
    }

    return (
        <div className="min-h-screen bg-navy-900">
            <header className="border-b border-white/5 bg-navy-900/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="btn-ghost p-2">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-gold-gradient rounded-md flex items-center justify-center">
                                <Film className="w-4 h-4 text-navy-900" />
                            </div>
                            <span className="font-bold">New Project</span>
                        </div>
                    </div>

                    {/* Toolbar right */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button onClick={() => setShowHelp(true)} className="btn-ghost p-1.5 sm:p-2 sm:px-3 text-sm flex items-center gap-1.5" title="Help Guide">
                            <HelpCircle className="w-4 h-4" />
                            <span className="hidden sm:block">Help</span>
                        </button>
                        <button onClick={() => setShowContact(true)} className="btn-ghost p-1.5 sm:p-2 sm:px-3 text-sm flex items-center gap-1.5" title="Contact Support">
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:block">Contact</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                {phase === 'generating' || phase === 'saving' ? (
                    /* Generation loading screen */
                    <div className="text-center py-20 animate-fade-in">
                        <div className="w-20 h-20 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-gold-500 animate-pulse-slow" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">
                            {phase === 'saving' ? 'Saving your screenplay…' : 'Writing your screenplay…'}
                        </h2>
                        <p className="text-white/40 mb-8">
                            {phase === 'saving' ? 'Almost done!' : 'The application is crafting your complete story package. This takes about 30–60 seconds.'}
                        </p>

                        {/* Streaming preview */}
                        {streamData && (
                            <div className="text-left glass-card p-6 max-h-72 overflow-y-auto mb-6">
                                <div className="font-screenplay text-xs text-white/60 leading-relaxed whitespace-pre-wrap">
                                    {streamData.slice(-800)}
                                    {isStreaming && <span className="streaming-cursor" />}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {phase === 'saving' ? 'Saving…' : 'Generating screenplay…'}
                        </div>
                    </div>
                ) : (
                    /* Form */
                    <div className="animate-slide-up">
                        <div className="mb-10">
                            <h1 className="text-3xl font-bold mb-2">Story Input Section</h1>
                            <p className="text-white/40">Type any story concept or idea that comes to your mind. It can be a short description, like a movie idea or a simple plot.</p>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-8">
                            {/* Format */}
                            <div>
                                <label className="block text-sm font-semibold text-white/80 mb-3">Format</label>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    {FORMATS.map(({ value, label, desc }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => set('format', value)}
                                            className={`p-4 rounded-xl border text-left transition-all duration-200
                        ${form.format === value
                                                    ? 'bg-gold-500/10 border-gold-500/40 text-white'
                                                    : 'bg-navy-800/40 border-white/10 text-white/50 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="font-semibold text-sm mb-0.5">{label}</div>
                                            <div className="text-xs text-white/40">{desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Genre */}
                            <div>
                                <label className="block text-sm font-semibold text-white/80 mb-3">Type of Screenplay (Genre)</label>
                                <div className="flex flex-wrap gap-2">
                                    {GENRES.map(g => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => set('genre', g)}
                                            className={`px-4 py-2 rounded-full border text-sm transition-all duration-200
                        ${form.genre === g
                                                    ? 'bg-gold-500/10 border-gold-500/40 text-gold-400'
                                                    : 'bg-navy-800/40 border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-white/80 mb-2">Project Title *</label>
                                <input
                                    id="project-title"
                                    type="text"
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    placeholder='e.g. "The Last Signal"'
                                    className={`input-field text-lg ${errors.title ? 'border-red-500/60' : ''}`}
                                />
                                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                            </div>

                            {/* Premise / Story Idea */}
                            <div>
                                <label className="block text-sm font-semibold text-white/80 mb-2">
                                    Story Idea *
                                </label>
                                <textarea
                                    id="project-premise"
                                    value={form.premise}
                                    onChange={e => set('premise', e.target.value)}
                                    rows={5}
                                    placeholder="Write your story concept here. It could be an indie short film idea, a YouTube web series pilot, or a practice concept for film school..."
                                    className={`input-field resize-none ${errors.premise ? 'border-red-500/60' : ''}`}
                                />
                                <div className="flex items-center justify-between mt-1">
                                    {errors.premise
                                        ? <p className="text-red-400 text-xs">{errors.premise}</p>
                                        : <p className="text-white/25 text-xs">Enter your complete story concept</p>
                                    }
                                </div>
                            </div>

                            <button
                                id="generate-content-btn"
                                type="submit"
                                className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
                            >
                                <Sparkles className="w-4 h-4" />
                                Generate Content
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}
            </main>

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            {showContact && <ContactModal onClose={() => setShowContact(false)} />}
        </div>
    )
}
