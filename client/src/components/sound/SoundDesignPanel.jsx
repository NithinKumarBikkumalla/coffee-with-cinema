import { useState, useRef } from 'react'
import { Loader2, Volume2 } from 'lucide-react'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'

function SceneSoundCard({ sound, onUpdate }) {
    const debounceRef = useRef({})

    const debounceSave = (field, value) => {
        const key = `${sound.id}-${field}`
        if (debounceRef.current[key]) clearTimeout(debounceRef.current[key])
        debounceRef.current[key] = setTimeout(async () => {
            try {
                await apiClient.patch(`/api/sound/${sound.id}`, { [field]: value })
            } catch { toast.error('Save failed') }
        }, 2000)
    }

    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold bg-teal-400/10 text-teal-400 border border-teal-400/20 px-2 py-0.5 rounded">
                    SCENE {sound.sceneNumber}
                </span>
                <Volume2 className="w-3.5 h-3.5 text-white/20" />
            </div>

            <div className="space-y-3">
                {[
                    { key: 'ambient', label: '🌆 Ambient', placeholder: 'City traffic, rain on glass...' },
                    { key: 'musicMood', label: '🎵 Music Mood', placeholder: 'Tense, low strings, building...' },
                    { key: 'musicGenre', label: '🎸 Genre', placeholder: 'Orchestral thriller' },
                    { key: 'notes', label: '📝 Director Notes', placeholder: 'Additional audio guidance...' },
                ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                        <label className="text-xs text-white/30 font-medium block mb-1">{label}</label>
                        <input
                            type="text"
                            defaultValue={sound[key] || ''}
                            onChange={e => { onUpdate(sound.id, key, e.target.value); debounceSave(key, e.target.value) }}
                            placeholder={placeholder}
                            className="input-field text-sm py-2"
                        />
                    </div>
                ))}

                {/* SFX tags */}
                <div>
                    <label className="text-xs text-white/30 font-medium block mb-2">🔊 SFX</label>
                    <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                        {(Array.isArray(sound.sfx) ? sound.sfx : []).map((s, i) => (
                            <span key={i} className="badge bg-white/5 text-white/50 border border-white/10 text-xs">{s}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SoundDesignPanel({ project, setProject }) {
    const [generating, setGenerating] = useState(false)
    const sounds = project?.sound || []

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const { data } = await apiClient.post('/api/generate/sound', { projectId: project.id })
            setProject(prev => ({ ...prev, sound: data }))
            toast.success('Sound design plan generated!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Generation failed')
        } finally {
            setGenerating(false)
        }
    }

    const handleUpdate = (soundId, field, value) => {
        setProject(prev => ({
            ...prev,
            sound: prev.sound.map(s => s.id === soundId ? { ...s, [field]: value } : s)
        }))
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold">Sound Design Plan</h2>
                    <p className="text-white/40 text-sm">{sounds.length} scenes with audio notes</p>
                </div>
                <button
                    id="generate-sound-btn"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : '🎵 Generate Sound Design'}
                </button>
            </div>

            {sounds.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-4">🎵</div>
                    <h3 className="font-bold mb-2">No sound design yet</h3>
                    <p className="text-white/40 text-sm mb-6">Generate a scene-by-scene audio plan for your screenplay</p>
                    <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2 mx-auto">
                        {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                        Generate Sound Design
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {sounds.map(s => (
                        <SceneSoundCard key={s.id} sound={s} onUpdate={handleUpdate} />
                    ))}
                </div>
            )}
        </div>
    )
}
