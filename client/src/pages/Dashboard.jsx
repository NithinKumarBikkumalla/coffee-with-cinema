import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Film, Plus, Trash2, Clock, Layers, Users, Loader2, AlertCircle, HelpCircle, MessageSquare, Bell, CheckCircle2, XCircle, Share2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import apiClient from '../api/client'
import toast from 'react-hot-toast'
import HelpModal from '../components/modals/HelpModal'
import ContactModal from '../components/modals/ContactModal'

const genreColors = {
    Drama: 'bg-blue-500/20 text-blue-300',
    Thriller: 'bg-red-500/20 text-red-300',
    'Sci-Fi': 'bg-purple-500/20 text-purple-300',
    Comedy: 'bg-yellow-500/20 text-yellow-300',
    Horror: 'bg-orange-500/20 text-orange-300',
    Action: 'bg-green-500/20 text-green-300',
    Romance: 'bg-pink-500/20 text-pink-300',
}

function ProjectCard({ project, onDelete }) {
    const navigate = useNavigate()
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async (e) => {
        e.stopPropagation()
        if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return
        setDeleting(true)
        try {
            await apiClient.delete(`/api/projects/${project.id}`)
            onDelete(project.id)
            toast.success('Project deleted')
        } catch {
            toast.error('Failed to delete project')
            setDeleting(false)
        }
    }

    const updatedAt = new Date(project.updatedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    })

    return (
        <div
            onClick={() => navigate(`/projects/${project.id}`)}
            className="glass-card p-6 cursor-pointer hover-lift group relative overflow-hidden"
        >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate mb-1">{project.title}</h3>
                    <span className={`badge text-xs ${genreColors[project.genre] || 'bg-white/10 text-white/50'}`}>
                        {project.genre}
                    </span>
                </div>
                <button
                    id={`delete-project-${project.id}`}
                    onClick={handleDelete}
                    disabled={deleting}
                    className="ml-3 p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
            </div>

            <p className="text-white/40 text-sm line-clamp-2 mb-5 leading-relaxed">{project.premise}</p>

            <div className="flex items-center gap-4 text-white/30 text-xs">
                <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{project._count?.scenes ?? 0} scenes</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project._count?.characters ?? 0} characters</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{updatedAt}</span>
                </div>
            </div>
        </div>
    )
}

function SkeletonCard() {
    return (
        <div className="glass-card p-6">
            <div className="skeleton h-5 w-3/4 mb-3 rounded" />
            <div className="skeleton h-4 w-1/4 mb-4 rounded" />
            <div className="skeleton h-3 w-full mb-2 rounded" />
            <div className="skeleton h-3 w-5/6 mb-5 rounded" />
            <div className="flex gap-4">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
            </div>
        </div>
    )
}

export default function Dashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showHelp, setShowHelp] = useState(false)
    const [showContact, setShowContact] = useState(false)
    const [invitations, setInvitations] = useState([])
    const [sharedProjects, setSharedProjects] = useState([])
    const [responding, setResponding] = useState(null)

    useEffect(() => {
        apiClient.get('/api/projects')
            .then(({ data }) => setProjects(data))
            .catch(() => setError('Failed to load projects'))
            .finally(() => setLoading(false))

        // Load invitations and shared projects
        apiClient.get('/api/collaborators/invitations/mine')
            .then(({ data }) => setInvitations(data))
            .catch(() => { })

        apiClient.get('/api/collaborators/shared/projects')
            .then(({ data }) => setSharedProjects(data))
            .catch(() => { })
    }, [])

    const handleDelete = (id) => setProjects(prev => prev.filter(p => p.id !== id))

    const handleRespond = async (invitationId, status) => {
        setResponding(invitationId)
        try {
            await apiClient.patch(`/api/collaborators/respond/${invitationId}`, { status })
            setInvitations(prev => prev.filter(i => i.id !== invitationId))
            if (status === 'accepted') {
                // Refresh shared projects
                const { data } = await apiClient.get('/api/collaborators/shared/projects')
                setSharedProjects(data)
                toast.success('Invitation accepted! Project added to Shared with Me.')
            } else {
                toast.success('Invitation declined.')
            }
        } catch {
            toast.error('Failed to respond to invitation')
        } finally {
            setResponding(null)
        }
    }

    return (
        <div className="min-h-screen bg-navy-900">
            {/* Header */}
            <header className="border-b border-white/5 bg-navy-900/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center">
                            <Film className="w-4 h-4 text-navy-900" />
                        </div>
                        <span className="font-bold text-base">Coffee-with-Cinema</span>
                    </Link>
                    <div className="flex items-center gap-1 sm:gap-4">
                        <button onClick={() => setShowHelp(true)} className="btn-ghost p-2 flex items-center gap-1.5 text-sm" title="Help Guide">
                            <HelpCircle className="w-4 h-4 text-white/60" />
                            <span className="hidden sm:inline">Help</span>
                        </button>
                        <button onClick={() => setShowContact(true)} className="btn-ghost p-2 flex items-center gap-1.5 text-sm border-r border-white/10 pr-4" title="Contact Support">
                            <MessageSquare className="w-4 h-4 text-white/60" />
                            <span className="hidden sm:inline">Contact</span>
                        </button>
                        <span className="text-white/40 text-sm hidden sm:block">
                            {user?.name}
                        </span>
                        <button
                            id="logout-btn"
                            onClick={() => { logout(); navigate('/') }}
                            className="btn-ghost text-sm"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-10">
                {/* Page header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Your Projects</h1>
                        <p className="text-white/40 text-sm">
                            {loading ? '…' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                    <Link
                        id="new-project-btn"
                        to="/projects/new"
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> New Project
                    </Link>
                </div>

                {/* Pending Invitations */}
                {invitations.length > 0 && (
                    <div className="mb-8 glass-card p-5 border border-gold-500/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient" />
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="w-4 h-4 text-gold-400" />
                            <h2 className="font-bold text-gold-400">Pending Invitations</h2>
                            <span className="badge bg-gold-500/20 text-gold-400 text-xs">{invitations.length}</span>
                        </div>
                        <div className="space-y-3">
                            {invitations.map(inv => (
                                <div key={inv.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                                    <div>
                                        <p className="font-semibold text-sm text-white">{inv.project.title}</p>
                                        <p className="text-xs text-white/40 mt-0.5">
                                            Invited by <span className="text-white/60">{inv.project.user.name}</span>
                                            {' · '}
                                            <span className={`font-semibold ${inv.role === 'editor' ? 'text-gold-400' : 'text-teal-400'}`}>
                                                {inv.role === 'editor' ? '✏️ Editor' : '👁️ Viewer'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleRespond(inv.id, 'accepted')}
                                            disabled={responding === inv.id}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg transition-all"
                                        >
                                            {responding === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleRespond(inv.id, 'declined')}
                                            disabled={responding === inv.id}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                        >
                                            <XCircle className="w-3.5 h-3.5" /> Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-400 mb-8">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                        <button onClick={() => window.location.reload()} className="ml-auto text-sm underline">Retry</button>
                    </div>
                )}

                {/* Loading state */}
                {loading && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && projects.length === 0 && (
                    <div className="text-center py-24">
                        <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <Film className="w-8 h-8 text-gold-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">No projects yet</h2>
                        <p className="text-white/40 text-sm mb-8">Create your first AI-powered film project</p>
                        <Link to="/projects/new" className="btn-primary inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Start Your First Project
                        </Link>
                    </div>
                )}

                {/* Project grid */}
                {!loading && projects.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(p => (
                            <ProjectCard key={p.id} project={p} onDelete={handleDelete} />
                        ))}
                    </div>
                )}

                {/* Shared with Me */}
                {sharedProjects.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Share2 className="w-5 h-5 text-teal-400" />
                            <h2 className="text-xl font-bold">Shared with Me</h2>
                            <span className="badge bg-teal-500/20 text-teal-400 text-xs">{sharedProjects.length}</span>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sharedProjects.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => navigate(`/projects/${p.id}`)}
                                    className="glass-card p-6 cursor-pointer hover-lift group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-white truncate mb-1">{p.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="badge bg-white/10 text-white/50 text-xs">{p.genre}</span>
                                                <span className={`badge text-xs ${p.collaboratorRole === 'editor' ? 'bg-gold-500/20 text-gold-400' : 'bg-teal-500/20 text-teal-400'}`}>
                                                    {p.collaboratorRole === 'editor' ? '✏️ Editor' : '👁️ Viewer'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-white/40 text-sm line-clamp-2 mb-4">{p.premise}</p>
                                    <div className="flex items-center gap-2 text-white/30 text-xs">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>By {p.user?.name}</span>
                                        <span className="ml-auto text-white/20">{p._count?.scenes ?? 0} scenes</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            {showContact && <ContactModal onClose={() => setShowContact(false)} />}
        </div>
    )
}
