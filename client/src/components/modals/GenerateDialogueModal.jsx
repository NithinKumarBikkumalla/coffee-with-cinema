import { useState } from 'react'
import { X, MessageSquarePlus, Sparkles, Loader2 } from 'lucide-react'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'

export default function GenerateDialogueModal({ projectId, sceneId, charactersList = [], onClose, onGenerated }) {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        character1: charactersList[0] || '',
        character2: charactersList[1] || '',
        contextPrompt: ''
    })

    const handleGenerate = async (e) => {
        e.preventDefault()
        if (!form.character1 || !form.character2 || !form.contextPrompt) {
            toast.error("Please fill in all fields.")
            return
        }

        setLoading(true)
        try {
            const { data } = await apiClient.post('/api/generate/dialogue', {
                projectId,
                ...form
            })
            toast.success("Dialogue generated!")
            onGenerated(data)
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate dialogue')
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-lg animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center">
                            <MessageSquarePlus className="w-4 h-4 text-navy-900" />
                        </div>
                        <h2 className="text-xl font-bold">Generate Dialogue</h2>
                    </div>
                    <button onClick={onClose} disabled={loading} className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form onSubmit={handleGenerate} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">Character 1</label>
                                {charactersList.length > 0 ? (
                                    <select
                                        className="input-field text-sm bg-navy-900"
                                        value={form.character1}
                                        onChange={e => setForm(p => ({ ...p, character1: e.target.value }))}
                                    >
                                        <option value="" disabled>Select Character</option>
                                        {charactersList.map(c => <option key={`c1-${c}`} value={c}>{c}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        className="input-field text-sm"
                                        placeholder="e.g. John"
                                        value={form.character1}
                                        onChange={e => setForm(p => ({ ...p, character1: e.target.value }))}
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">Character 2</label>
                                {charactersList.length > 0 ? (
                                    <select
                                        className="input-field text-sm bg-navy-900"
                                        value={form.character2}
                                        onChange={e => setForm(p => ({ ...p, character2: e.target.value }))}
                                    >
                                        <option value="" disabled>Select Character</option>
                                        {charactersList.map(c => <option key={`c2-${c}`} value={c}>{c}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        className="input-field text-sm"
                                        placeholder="e.g. Mary"
                                        value={form.character2}
                                        onChange={e => setForm(p => ({ ...p, character2: e.target.value }))}
                                    />
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">Context Prompt</label>
                            <textarea
                                required
                                rows={3}
                                className="input-field text-sm resize-none"
                                placeholder="What are they talking about? e.g. 'John tries to hide a secret feeling from Mary but fails.'"
                                value={form.contextPrompt}
                                onChange={e => setForm(p => ({ ...p, contextPrompt: e.target.value }))}
                            ></textarea>
                        </div>
                        <button disabled={loading} type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Generate Lines</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
