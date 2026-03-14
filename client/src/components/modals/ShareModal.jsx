import { useState, useEffect } from 'react'
import { X, UserPlus, Trash2, Loader2, Users, Crown, Eye, Edit3 } from 'lucide-react'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'

const ROLE_STYLES = {
    editor: { label: 'Editor', icon: <Edit3 className="w-3 h-3" />, cls: 'bg-gold-500/20 text-gold-400' },
    viewer: { label: 'Viewer', icon: <Eye className="w-3 h-3" />, cls: 'bg-white/10 text-white/50' },
    owner: { label: 'Owner', icon: <Crown className="w-3 h-3" />, cls: 'bg-teal-500/20 text-teal-400' },
}

export default function ShareModal({ project, onClose }) {
    const [collaborators, setCollaborators] = useState([])
    const [loading, setLoading] = useState(true)
    const [inviting, setInviting] = useState(false)
    const [removing, setRemoving] = useState(null)
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('viewer')

    useEffect(() => {
        apiClient.get(`/api/collaborators/${project.id}`)
            .then(({ data }) => setCollaborators(data))
            .catch(() => toast.error('Failed to load collaborators'))
            .finally(() => setLoading(false))
    }, [project.id])

    const handleInvite = async (e) => {
        e.preventDefault()
        if (!email.trim()) return
        setInviting(true)
        try {
            const { data } = await apiClient.post(`/api/collaborators/${project.id}`, { email: email.trim(), role })
            setCollaborators(prev => {
                const exists = prev.findIndex(c => c.email === data.email)
                if (exists >= 0) {
                    const updated = [...prev]
                    updated[exists] = data
                    return updated
                }
                return [data, ...prev]
            })
            setEmail('')
            toast.success(`Invited ${email} as ${role}!`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to invite')
        } finally {
            setInviting(false)
        }
    }

    const handleRemove = async (collaboratorId, colEmail) => {
        setRemoving(collaboratorId)
        try {
            await apiClient.delete(`/api/collaborators/${project.id}/${collaboratorId}`)
            setCollaborators(prev => prev.filter(c => c.id !== collaboratorId))
            toast.success(`Removed ${colEmail}`)
        } catch {
            toast.error('Failed to remove')
        } finally {
            setRemoving(null)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-lg animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-navy-900" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Share Project</h2>
                            <p className="text-white/40 text-xs truncate max-w-[200px]">{project.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Invite Form */}
                <div className="p-6 border-b border-white/5">
                    <p className="text-sm text-white/50 mb-4">Invite a collaborator by their registered email address.</p>
                    <form onSubmit={handleInvite} className="flex gap-2">
                        <input
                            type="email"
                            required
                            placeholder="colleague@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="input-field text-sm flex-1"
                        />
                        <select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            className="input-field text-sm w-28 bg-navy-900 cursor-pointer"
                        >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                        </select>
                        <button
                            type="submit"
                            disabled={inviting}
                            className="btn-primary flex items-center gap-1.5 text-sm whitespace-nowrap px-4"
                        >
                            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            Invite
                        </button>
                    </form>
                </div>

                {/* Collaborator List */}
                <div className="p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">People with Access</h3>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-white/30" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Owner row */}
                            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 bg-gold-gradient rounded-full flex items-center justify-center text-[10px] font-bold text-navy-900">
                                        YOU
                                    </div>
                                    <span className="text-sm text-white/70">You (Owner)</span>
                                </div>
                                <span className={`badge flex items-center gap-1 ${ROLE_STYLES.owner.cls}`}>
                                    {ROLE_STYLES.owner.icon} {ROLE_STYLES.owner.label}
                                </span>
                            </div>

                            {collaborators.length === 0 ? (
                                <p className="text-white/30 text-sm text-center py-4">No collaborators yet. Invite someone above!</p>
                            ) : (
                                collaborators.map(c => {
                                    const style = ROLE_STYLES[c.role] || ROLE_STYLES.viewer
                                    return (
                                        <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-bold text-white/60">
                                                    {c.email[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm text-white/60">{c.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`badge flex items-center gap-1 ${style.cls}`}>
                                                    {style.icon} {style.label}
                                                </span>
                                                <button
                                                    onClick={() => handleRemove(c.id, c.email)}
                                                    disabled={removing === c.id}
                                                    className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    {removing === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
