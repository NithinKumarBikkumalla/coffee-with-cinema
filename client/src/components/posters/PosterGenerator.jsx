import { useState } from 'react'
import { Loader2, Palette, Sparkles, Image as ImageIcon, Type, Layout, Info } from 'lucide-react'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'

export default function PosterGenerator({ project, setProject, isReadOnly }) {
    const [generating, setGenerating] = useState(false)

    const concepts = Array.isArray(project?.posterConcepts) ? project.posterConcepts : []

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const { data } = await apiClient.post('/api/generate/poster', { projectId: project.id })
            setProject(prev => ({ ...prev, posterConcepts: data }))
            toast.success('Generated 3 poster concepts!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Generation failed')
        } finally {
            setGenerating(false)
        }
    }

    if (concepts.length === 0) {
        return (
            <div className="glass-card p-12 text-center animate-fade-in max-w-4xl mx-auto">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="w-8 h-8 text-gold-400" />
                </div>
                <h3 className="font-bold text-2xl mb-4">Movie Poster Concept Generator</h3>
                <p className="text-white/40 text-base mb-8 max-w-xl mx-auto leading-relaxed">
                    Ready to market your masterpiece? Generate unique visual concepts for your movie's poster,
                    including artistic styles, taglines, color palettes, and typography guidance.
                </p>
                {!isReadOnly && (
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="btn-primary flex items-center gap-2 mx-auto px-8 py-3 text-lg"
                    >
                        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        Generate Concepts
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Poster Concepts</h2>
                    <p className="text-white/40 text-sm">Visual marketing directions for "{project?.title}"</p>
                </div>
                {!isReadOnly && (
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="btn-secondary flex items-center gap-2"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Regenerate All
                    </button>
                )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {concepts.map((concept, i) => (
                    <div key={i} className="group flex flex-col items-stretch h-full">
                        {/* Poster Mockup Previews */}
                        <div className="poster-mockup relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 border border-white/5 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                            {/* Abstract background representing style */}
                            <div className={`absolute inset-0 bg-gradient-to-br opacity-80 ${i === 0 ? 'from-gold-600/30 to-navy-900' :
                                    i === 1 ? 'from-purple-600/30 to-black' :
                                        'from-teal-600/30 to-navy-950'
                                }`} />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />

                            {/* Overlay content */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-between text-center">
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Concept {i + 1}</p>
                                    <h4 className="text-xs font-bold text-white/50 tracking-widest uppercase">{concept.visual_style}</h4>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-2xl">
                                        {project.title}
                                    </h3>
                                    <div className="w-12 h-1 bg-gold-500 mx-auto rounded-full opacity-60" />
                                    <p className="text-xs font-medium text-white/70 italic line-clamp-2 px-4">
                                        "{concept.tagline}"
                                    </p>
                                </div>

                                <div className="text-[8px] uppercase tracking-widest text-white/30 font-bold">
                                    Coming Soon to Theaters
                                </div>
                            </div>
                        </div>

                        {/* Concept Details Panel */}
                        <div className="glass-card flex-1 p-6 space-y-4 border-t-0 rounded-t-none">
                            <h3 className="font-bold text-lg text-gold-400 flex items-center gap-2">
                                <Info className="w-4 h-4" /> {concept.concept_name}
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <ImageIcon className="w-4 h-4 text-white/20 mt-1 shrink-0" />
                                    <div>
                                        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider block mb-0.5">Key Imagery</span>
                                        <p className="text-sm text-white/70 leading-snug">{concept.key_imagery}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Palette className="w-4 h-4 text-white/20 mt-1 shrink-0" />
                                    <div>
                                        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider block mb-1">Color Palette</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {concept.color_palette.map((c, ci) => (
                                                <span key={ci} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Type className="w-4 h-4 text-white/20 mt-1 shrink-0" />
                                    <div>
                                        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider block mb-0.5">Typography</span>
                                        <p className="text-sm text-white/70 leading-snug">{concept.typography}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Layout className="w-4 h-4 text-white/20 mt-1 shrink-0" />
                                    <div>
                                        <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider block mb-0.5">Mood</span>
                                        <p className="text-sm text-white/70 leading-snug italic">"{concept.mood_summary}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
