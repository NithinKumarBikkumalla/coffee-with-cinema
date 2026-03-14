import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Film, ArrowLeft, Download, History, Loader2, AlertCircle, HelpCircle, MessageSquare } from 'lucide-react'
import { useProject } from '../hooks/useProject'
import ScreenplayEditor from '../components/editor/ScreenplayEditor'
import CharacterList from '../components/characters/CharacterList'
import SoundDesignPanel from '../components/sound/SoundDesignPanel'
import ProductionCalendar from '../components/schedule/ProductionCalendar'
import ExportButton from '../components/export/ExportButton'
import VersionHistoryModal from '../components/modals/VersionHistoryModal'
import HelpModal from '../components/modals/HelpModal'
import ContactModal from '../components/modals/ContactModal'
import ShotListPanel from '../components/shots/ShotListPanel'

const TABS = [
    { id: 'storyline', label: '📖 Story Line' },
    { id: 'screenplay', label: '📜 Screenplay' },
    { id: 'characters', label: '🎭 Characters' },
    { id: 'sound', label: '🎵 Sound Design' },
    { id: 'shots', label: '🎥 Shot List' },
]

export default function ProjectView() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { project, setProject, loading, loadProject } = useProject()
    const [activeTab, setActiveTab] = useState('storyline')
    const [showVersions, setShowVersions] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const [showContact, setShowContact] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadProject(id).catch(() => setError('Project not found or access denied'))
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-navy-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/40 text-sm">Loading project…</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-navy-900 flex items-center justify-center px-6">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
                    <p className="text-white/40 mb-6">{error}</p>
                    <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-navy-900">
            {/* Header */}
            <header className="border-b border-white/5 bg-navy-900/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
                    <Link to="/dashboard" className="btn-ghost p-2">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gold-gradient rounded flex items-center justify-center">
                            <Film className="w-3.5 h-3.5 text-navy-900" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-bold text-sm truncate">{project?.title}</h1>
                            <p className="text-white/30 text-xs">{project?.genre} · {project?.tone}</p>
                        </div>
                    </div>

                    {/* Toolbar right */}
                    <div className="ml-auto flex items-center gap-1 sm:gap-2">
                        <button onClick={() => setShowHelp(true)} className="btn-ghost p-1.5 sm:p-2 sm:px-3 text-sm flex items-center gap-1.5" title="Help Guide">
                            <HelpCircle className="w-4 h-4" />
                            <span className="hidden sm:block">Help</span>
                        </button>
                        <button onClick={() => setShowContact(true)} className="btn-ghost p-1.5 sm:p-2 sm:px-3 text-sm flex items-center gap-1.5 border-r border-white/10 pr-2 sm:pr-4" title="Contact Support">
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:block">Contact</span>
                        </button>
                        <button
                            id="version-history-btn"
                            onClick={() => setShowVersions(true)}
                            className="btn-ghost text-sm flex items-center gap-1.5"
                        >
                            <History className="w-4 h-4" />
                            <span className="hidden sm:block">History</span>
                        </button>
                        <ExportButton projectId={id} project={project} />
                    </div>
                </div>

                {/* Tab bar */}
                <div className="max-w-7xl mx-auto px-6 flex gap-1 pb-0 overflow-x-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            id={`tab-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab-btn whitespace-nowrap ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'storyline' && (
                    <div className="animate-fade-in text-center max-w-3xl mx-auto py-12 px-6">
                        <div className="glass-card p-10 relative mt-4">
                            <h3 className="text-sm font-bold text-gold-400 mb-6 uppercase tracking-wider">The Story Line Idea</h3>
                            <textarea
                                defaultValue={project?.premise || ''}
                                onBlur={async (e) => {
                                    const val = e.target.value
                                    if (val !== project?.premise) {
                                        setProject(p => ({ ...p, premise: val }))
                                        try {
                                            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
                                            await fetch(`${apiBase}/api/projects/${project.id}`, {
                                                method: 'PATCH',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${localStorage.getItem('scriptoria_token')}`
                                                },
                                                body: JSON.stringify({ premise: val })
                                            })
                                        } catch { }
                                    }
                                }}
                                className="w-full bg-transparent text-lg md:text-xl text-white/90 leading-relaxed font-serif animate-slide-up text-center resize-none outline-none border-b border-white/0 focus:border-white/20 transition-colors pb-2"
                                rows={6}
                                placeholder="Write your core story idea here..."
                            />
                            <p className="text-white/30 text-xs mt-4">You can edit your story idea here at any time. Click away to save.</p>
                        </div>
                    </div>
                )}
                {activeTab === 'screenplay' && (
                    <ScreenplayEditor project={project} setProject={setProject} />
                )}
                {activeTab === 'characters' && (
                    <CharacterList project={project} setProject={setProject} />
                )}
                {activeTab === 'sound' && (
                    <SoundDesignPanel project={project} setProject={setProject} />
                )}
                {activeTab === 'shots' && (
                    <ShotListPanel project={project} setProject={setProject} />
                )}
            </main>

            {/* Version History Modal */}
            {showVersions && (
                <VersionHistoryModal
                    projectId={id}
                    onClose={() => setShowVersions(false)}
                    onRestore={(data) => { setProject(data); setShowVersions(false) }}
                />
            )}

            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
            {showContact && <ContactModal onClose={() => setShowContact(false)} />}
        </div>
    )
}
