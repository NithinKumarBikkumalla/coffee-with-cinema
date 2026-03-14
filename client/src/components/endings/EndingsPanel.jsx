import { useState } from 'react'
import { Loader2, RefreshCw, Sparkles, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'

const ENDING_STYLES = {
    'Happy Ending': {
        gradient: 'from-emerald-500/20 to-teal-500/10',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-400',
        accent: 'bg-emerald-500',
    },
    'Tragic Ending': {
        gradient: 'from-red-500/20 to-pink-500/10',
        border: 'border-red-500/30',
        badge: 'bg-red-500/20 text-red-400',
        accent: 'bg-red-500',
    },
    'Twist Ending': {
        gradient: 'from-purple-500/20 to-indigo-500/10',
        border: 'border-purple-500/30',
        badge: 'bg-purple-500/20 text-purple-400',
        accent: 'bg-purple-500',
    },
}

function EndingCard({ ending }) {
    const [expanded, setExpanded] = useState(false)
    const style = ENDING_STYLES[ending.type] || ENDING_STYLES['Twist Ending']
    const dialogues = Array.isArray(ending.final_scene?.dialogue) ? ending.final_scene.dialogue : []

    return (
        <div className={`rounded-2xl border bg-gradient-to-br ${style.gradient} ${style.border} overflow-hidden transition-all duration-300`}>
            {/* Top accent */}
            <div className={`h-1 w-full ${style.accent} opacity-60`} />

            {/* Card Header */}
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{ending.emoji}</span>
                            <span className={`badge font-bold text-xs ${style.badge}`}>{ending.type}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white">{ending.title}</h3>
                    </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{ending.summary}</p>
            </div>

            {/* Final Scene */}
            {ending.final_scene?.slugline && (
                <>
                    <div className="border-t border-white/10 mx-4" />
                    <div className="px-6 pb-1 pt-4">
                        <button
                            onClick={() => setExpanded(p => !p)}
                            className="flex items-center justify-between w-full text-sm text-white/50 hover:text-white/80 transition-colors pb-3"
                        >
                            <span className="flex items-center gap-2">
                                <BookOpen className="w-3.5 h-3.5" />
                                View Final Scene Script
                            </span>
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {expanded && (
                            <div className="animate-fade-in pb-5 space-y-3">
                                {/* Slugline */}
                                <div className="text-xs font-bold tracking-widest uppercase text-white/70 border-b border-white/10 pb-2">
                                    {ending.final_scene.slugline}
                                </div>
                                {/* Action */}
                                {ending.final_scene.action && (
                                    <p className="text-white/60 text-sm leading-relaxed italic">
                                        {ending.final_scene.action}
                                    </p>
                                )}
                                {/* Dialogue */}
                                {dialogues.length > 0 && (
                                    <div className="space-y-3 pl-4 border-l-2 border-white/10">
                                        {dialogues.map((d, i) => (
                                            <div key={i} className="text-center">
                                                <div className="text-xs font-bold text-white/50 uppercase tracking-wider mb-0.5">
                                                    {d.character}
                                                </div>
                                                {d.parenthetical && (
                                                    <div className="text-xs text-white/30 italic mb-0.5">
                                                        ({d.parenthetical})
                                                    </div>
                                                )}
                                                <div className="text-sm text-white/70 leading-relaxed max-w-sm mx-auto">
                                                    "{d.line}"
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default function EndingsPanel({ project, setProject, isReadOnly }) {
    const [generating, setGenerating] = useState(false)

    let endings = []
    try {
        endings = typeof project?.endings === 'string'
            ? JSON.parse(project.endings)
            : (Array.isArray(project?.endings) ? project.endings : [])
    } catch { }

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const { data } = await apiClient.post('/api/generate/endings', { projectId: project.id })
            let finalData = Array.isArray(data) ? data : []
            if (!finalData.length && data?.endings) finalData = data.endings
            setProject(prev => ({ ...prev, endings: finalData }))
            toast.success('3 alternate endings generated!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Endings generation failed')
        } finally {
            setGenerating(false)
        }
    }

    if (endings.length === 0) {
        return (
            <div className="glass-card p-12 text-center animate-fade-in">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <span className="text-3xl">🔀</span>
                </div>
                <h3 className="font-bold text-xl mb-3">Multiple Ending Generator</h3>
                <p className="text-white/40 text-sm mb-2 max-w-lg mx-auto">
                    Can't decide how your story ends? Generate three completely different alternate endings — a heartwarming resolution, a gut-wrenching tragedy, and a mind-bending twist.
                </p>
                <div className="flex items-center justify-center gap-4 my-6">
                    <span className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">😊 Happy Ending</span>
                    <span className="text-white/20">·</span>
                    <span className="flex items-center gap-1 text-red-400 text-sm font-semibold">💔 Tragic Ending</span>
                    <span className="text-white/20">·</span>
                    <span className="flex items-center gap-1 text-purple-400 text-sm font-semibold">🌀 Twist Ending</span>
                </div>
                {!isReadOnly && (
                    <button
                        onClick={handleGenerate}
                        disabled={generating || !project?.scenes?.length}
                        className="btn-primary flex items-center gap-2 mx-auto"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        {!project?.scenes?.length ? 'Generate Screenplay First' : 'Generate 3 Endings'}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold">Alternate Endings</h2>
                        <span className="badge bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold">🔀 3 Versions</span>
                    </div>
                    <p className="text-white/40 text-sm mt-1">Three different ways your story could end</p>
                </div>
                {!isReadOnly && (
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="btn-secondary flex items-center gap-2 text-sm"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Regenerate All
                    </button>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                {endings.map((ending, i) => (
                    <EndingCard key={i} ending={ending} />
                ))}
            </div>
        </div>
    )
}
