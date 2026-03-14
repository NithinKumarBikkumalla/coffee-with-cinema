import { useState, useRef } from 'react'
import { Loader2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'
import RegenerateModal from '../modals/RegenerateModal'
import CharacterRelationshipMap from './CharacterRelationshipMap'

const ROLE_COLORS = {
    protagonist: 'bg-gold-500/20 text-gold-400 border-gold-500/30',
    antagonist: 'bg-red-500/20 text-red-400 border-red-500/30',
    supporting: 'bg-teal-400/20 text-teal-400 border-teal-400/30',
}

function CharacterCard({ character, onUpdated }) {
    const [expanded, setExpanded] = useState(false)
    const [showRegen, setShowRegen] = useState(false)
    const debounceRef = useRef({})

    const profile = character.profileJSON || {}

    const debouncedSave = (field, value) => {
        const key = `${character.id}-${field}`
        if (debounceRef.current[key]) clearTimeout(debounceRef.current[key])
        debounceRef.current[key] = setTimeout(async () => {
            try {
                await apiClient.patch(`/api/characters/${character.id}`, {
                    profileJSON: { ...profile, [field]: value }
                })
            } catch { toast.error('Save failed') }
        }, 2000)
    }

    return (
        <>
            <div className="glass-card p-6 hover-lift">
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-lg">{character.name}</h3>
                        <span className={`badge border mt-1 ${ROLE_COLORS[character.role] || 'bg-white/10 text-white/50 border-white/20'}`}>
                            {character.role}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowRegen(true)}
                            className="p-2 text-white/30 hover:text-gold-400 hover:bg-gold-500/10 rounded-lg transition-all duration-200"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setExpanded(p => !p)}
                            className="p-2 text-white/30 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                        >
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Summary */}
                {profile.motivation && (
                    <p className="text-white/50 text-sm mb-3 line-clamp-2">{profile.motivation}</p>
                )}

                {/* Expanded */}
                {expanded && (
                    <div className="mt-4 space-y-4 animate-fade-in border-t border-white/10 pt-4">
                        {[
                            { key: 'backstory', label: 'Backstory', multiline: true },
                            { key: 'motivation', label: 'Motivation', multiline: false },
                            { key: 'character_arc', label: 'Character Arc', multiline: false },
                            { key: 'relationship_to_protagonist', label: 'Relationship to Protagonist', multiline: false },
                        ].map(({ key, label, multiline }) => (
                            <div key={key}>
                                <label className="text-xs font-semibold text-white/30 uppercase tracking-wider block mb-1.5">{label}</label>
                                {multiline ? (
                                    <textarea
                                        defaultValue={profile[key] || ''}
                                        onChange={e => debouncedSave(key, e.target.value)}
                                        rows={3}
                                        className="input-field text-sm resize-none"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        defaultValue={profile[key] || ''}
                                        onChange={e => debouncedSave(key, e.target.value)}
                                        className="input-field text-sm"
                                    />
                                )}
                            </div>
                        ))}

                        {/* Traits */}
                        {profile.personality_traits?.length > 0 && (
                            <div>
                                <label className="text-xs font-semibold text-white/30 uppercase tracking-wider block mb-2">Traits</label>
                                <div className="flex flex-wrap gap-2">
                                    {profile.personality_traits.map((t, i) => (
                                        <span key={i} className="badge bg-white/5 text-white/60 border border-white/10">{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showRegen && (
                <RegenerateModal
                    projectId={character.projectId}
                    targetType="character"
                    targetId={character.id}
                    onClose={() => setShowRegen(false)}
                    onRegenerated={onUpdated}
                />
            )}
        </>
    )
}

export default function CharacterList({ project, setProject }) {
    const [generating, setGenerating] = useState(false)

    const characters = project?.characters || []

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const { data } = await apiClient.post('/api/generate/characters', { projectId: project.id })
            setProject(prev => ({ ...prev, characters: data }))
            toast.success(`Generated ${data.length} character profiles!`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Generation failed')
        } finally {
            setGenerating(false)
        }
    }

    const handleUpdated = (updated) => {
        setProject(prev => ({
            ...prev,
            characters: prev.characters.map(c => c.id === updated.id ? updated : c)
        }))
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold">Character Profiles</h2>
                    <p className="text-white/40 text-sm">{characters.length} characters generated</p>
                </div>
                <button
                    id="generate-characters-btn"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : '✨ Generate Characters'}
                </button>
            </div>

            {characters.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-4">🎭</div>
                    <h3 className="font-bold mb-2">No characters yet</h3>
                    <p className="text-white/40 text-sm mb-6">Generate character profiles from your screenplay</p>
                    <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2 mx-auto">
                        {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                        Generate Character Profiles
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {characters.map(c => (
                        <CharacterCard key={c.id} character={c} onUpdated={handleUpdated} />
                    ))}
                </div>
            )}

            {/* Relationship Map section */}
            <CharacterRelationshipMap project={project} setProject={setProject} />
        </div>
    )
}
