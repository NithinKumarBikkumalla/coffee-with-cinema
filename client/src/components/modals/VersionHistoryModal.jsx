import { useState, useEffect } from 'react'
import { X, Loader2, RotateCcw, Clock, AlertCircle } from 'lucide-react'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'

export default function VersionHistoryModal({ projectId, onClose, onRestore }) {
    const [versions, setVersions] = useState([])
    const [loading, setLoading] = useState(true)
    const [restoring, setRestoring] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        apiClient.get(`/api/projects/${projectId}/versions`)
            .then(({ data }) => setVersions(data))
            .catch(() => setError('Failed to load versions'))
            .finally(() => setLoading(false))
    }, [projectId])

    const handleRestore = async (versionNumber) => {
        setRestoring(versionNumber)
        try {
            const { data } = await apiClient.post(`/api/projects/${projectId}/restore`, { versionNumber })
            onRestore(data)
            toast.success(`Restored to version ${versionNumber}`)
        } catch {
            toast.error('Restore failed')
        } finally {
            setRestoring(null)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card p-6 w-full max-w-lg animate-slide-up max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-5 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg">Version History</h3>
                        <p className="text-white/40 text-sm">Click a version to restore it</p>
                    </div>
                    <button onClick={onClose} className="btn-ghost p-2">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 space-y-2">
                    {loading && (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-gold-500" />
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm py-6 justify-center">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    {!loading && versions.length === 0 && (
                        <div className="text-center text-white/40 py-10 text-sm">No versions saved yet</div>
                    )}
                    {versions.map((v) => (
                        <div key={v.id} className="flex items-center gap-4 p-4 bg-navy-800/40 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                            <div className="w-10 h-10 bg-gold-500/10 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-gold-500">v{v.versionNumber}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {v.changeNote || `Version ${v.versionNumber}`}
                                </p>
                                <div className="flex items-center gap-1.5 text-white/30 text-xs mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {new Date(v.savedAt).toLocaleString('en-US', {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                    })}
                                </div>
                            </div>
                            <button
                                onClick={() => handleRestore(v.versionNumber)}
                                disabled={restoring === v.versionNumber}
                                className="btn-ghost text-xs flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                {restoring === v.versionNumber
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : <RotateCcw className="w-3 h-3" />
                                }
                                Restore
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
