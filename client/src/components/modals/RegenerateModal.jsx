import { useState } from 'react'
import { X, Loader2, RefreshCw } from 'lucide-react'
import { useStream } from '../../hooks/useStream'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'

export default function RegenerateModal({ projectId, targetType, targetId, onClose, onRegenerated }) {
    const [note, setNote] = useState('')
    const { data: streamData, isStreaming, start } = useStream()
    const [done, setDone] = useState(false)

    const handleRegenerate = () => {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
        start(`${apiBase}/api/generate/regenerate`, {
            body: { projectId, targetType, targetId, refinementNote: note },
            onComplete: async (rawData) => {
                try {
                    let parsed
                    try {
                        const cleanData = rawData.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()
                        const match = cleanData.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
                        parsed = JSON.parse(match ? match[0] : cleanData)
                    } catch { parsed = { raw: rawData } }
                    toast.success(`${targetType} regenerated!`)
                    onRegenerated({ id: targetId, ...parsed })
                    onClose()
                } catch {
                    toast.error('Regeneration failed')
                }
                setDone(true)
            },
        })
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card p-6 w-full max-w-md animate-slide-up">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="font-bold text-lg">Regenerate {targetType}</h3>
                        <p className="text-white/40 text-sm">AI will rewrite this keeping surrounding context</p>
                    </div>
                    <button onClick={onClose} disabled={isStreaming} className="btn-ghost p-2">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {!isStreaming && !done ? (
                    <>
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-white/60 mb-2">
                                Refinement note <span className="text-white/30">(optional)</span>
                            </label>
                            <textarea
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder='e.g. "Make this more tense" or "Give Marcus a darker motivation"'
                                rows={3}
                                className="input-field resize-none text-sm"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                            <button
                                id="confirm-regenerate-btn"
                                onClick={handleRegenerate}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" /> Regenerate
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <Loader2 className={`w-8 h-8 mx-auto mb-3 ${isStreaming ? 'animate-spin text-gold-500' : 'text-teal-400'}`} />
                        <p className="text-white/50 text-sm mb-3">
                            {isStreaming ? 'Regenerating…' : 'Saving result…'}
                        </p>
                        {streamData && (
                            <div className="text-left bg-navy-800/60 rounded-lg p-3 max-h-40 overflow-y-auto">
                                <p className="font-screenplay text-xs text-white/50 leading-relaxed">
                                    {streamData.slice(-400)}
                                    {isStreaming && <span className="streaming-cursor" />}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
