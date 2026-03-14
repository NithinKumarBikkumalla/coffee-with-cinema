import { useState } from 'react'
import { Loader2, RefreshCw, Network, Zap, Heart, Shield, Users, Swords } from 'lucide-react'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'

const TYPE_ICONS = {
    Friends: <Users className="w-5 h-5 text-blue-400" />,
    Enemies: <Swords className="w-5 h-5 text-red-400" />,
    Lovers: <Heart className="w-5 h-5 text-pink-400" />,
    Family: <Shield className="w-5 h-5 text-green-400" />,
    Rivals: <Zap className="w-5 h-5 text-orange-400" />,
    Mentor: <Shield className="w-5 h-5 text-purple-400" />,
}

export default function CharacterRelationshipMap({ project, setProject, isReadOnly }) {
    const [generating, setGenerating] = useState(false)
    let relationships = []
    try {
        relationships = typeof project?.relationshipMap === 'string'
            ? JSON.parse(project.relationshipMap)
            : (Array.isArray(project?.relationshipMap) ? project.relationshipMap : [])
    } catch { }

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const { data } = await apiClient.post('/api/generate/relationships', { projectId: project.id })

            let finalData = data
            if (typeof data === 'string') {
                try { finalData = JSON.parse(data) } catch { }
            }
            if (!Array.isArray(finalData)) {
                if (finalData && Array.isArray(finalData.relationships)) finalData = finalData.relationships
                else if (finalData && Array.isArray(finalData.edges)) finalData = finalData.edges
                else finalData = []
            }

            setProject(prev => ({ ...prev, relationshipMap: finalData }))
            toast.success("Relationship Map Generated!")
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate map')
        } finally {
            setGenerating(false)
        }
    }

    if (relationships.length === 0) {
        return (
            <div className="glass-card p-12 text-center mt-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Network className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="font-bold text-lg mb-2">Character Relationship Map</h3>
                <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
                    Generate a dynamic web of connections between your characters. See who are friends, enemies, rivals, and lovers.
                </p>
                {!isReadOnly && (
                    <button onClick={handleGenerate} disabled={generating || project?.characters?.length < 2} className="btn-primary flex items-center gap-2 mx-auto">
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Network className="w-4 h-4" />}
                        {project?.characters?.length < 2 ? 'Need 2+ characters to generate' : 'Generate Map'}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="glass-card p-6 mt-8 animate-fade-in relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                        <Network className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Relationship Map</h2>
                        <p className="text-white/40 text-sm">{relationships.length} connections forged</p>
                    </div>
                </div>
                {!isReadOnly && (
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="p-2 text-white/30 hover:text-gold-400 hover:bg-gold-500/10 rounded-lg transition-all duration-200"
                    >
                        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                    </button>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-4 relative z-10">
                {relationships.map((rel, i) => (
                    <div key={i} className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-colors">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex-1 font-bold text-sm text-right text-white/80">{rel.source}</div>
                            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-navy-900 border border-white/10">
                                {TYPE_ICONS[rel.type] || <Network className="w-4 h-4 text-white/40" />}
                            </div>
                            <div className="flex-1 font-bold text-sm text-left text-white/80">{rel.target}</div>
                        </div>
                        <div className="text-center">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-white/10 text-white/60 mb-2">
                                {rel.type}
                            </span>
                            <p className="text-white/50 text-xs leading-relaxed">{rel.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
