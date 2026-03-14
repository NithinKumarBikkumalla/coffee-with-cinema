import { useState } from 'react'
import { Loader2, RefreshCw, Camera, ChevronDown, ChevronUp } from 'lucide-react'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'

const SHOT_TYPE_COLORS = {
    'Extreme Wide Shot': 'bg-blue-500/20 text-blue-300',
    'Wide Shot': 'bg-teal-500/20 text-teal-300',
    'Medium Shot': 'bg-green-500/20 text-green-300',
    'Close-Up': 'bg-amber-500/20 text-amber-300',
    'Extreme Close-Up': 'bg-red-500/20 text-red-300',
    'Two Shot': 'bg-purple-500/20 text-purple-300',
    'Over-the-Shoulder': 'bg-pink-500/20 text-pink-300',
    'Point of View': 'bg-indigo-500/20 text-indigo-300',
}

function SceneShotBlock({ sceneData }) {
    const [expanded, setExpanded] = useState(true)
    const shots = Array.isArray(sceneData.shots) ? sceneData.shots : []

    return (
        <div className="glass-card overflow-hidden">
            {/* Scene Header */}
            <button
                onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded">
                        SCENE {sceneData.scene_number}
                    </span>
                    <span className="text-sm font-semibold text-white/80 truncate max-w-xs">{sceneData.slugline}</span>
                    <span className="text-xs text-white/30">{shots.length} shots</span>
                </div>
                {expanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
            </button>

            {/* Shot Rows */}
            {expanded && shots.length > 0 && (
                <div className="border-t border-white/5">
                    <div className="grid grid-cols-12 gap-2 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white/20 border-b border-white/5">
                        <div className="col-span-1">#</div>
                        <div className="col-span-3">Shot Type</div>
                        <div className="col-span-2">Angle</div>
                        <div className="col-span-2">Movement</div>
                        <div className="col-span-1">Lens</div>
                        <div className="col-span-3">Description</div>
                    </div>
                    {shots.map((shot, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/5 hover:bg-white/3 last:border-0 transition-colors items-start"
                        >
                            <div className="col-span-1 text-white/30 text-xs font-bold pt-0.5">{shot.shot_number || i + 1}</div>
                            <div className="col-span-3">
                                <span className={`badge text-[10px] font-semibold ${SHOT_TYPE_COLORS[shot.shot_type] || 'bg-white/10 text-white/50'}`}>
                                    {shot.shot_type}
                                </span>
                            </div>
                            <div className="col-span-2 text-white/50 text-xs pt-0.5">{shot.camera_angle}</div>
                            <div className="col-span-2 text-white/50 text-xs pt-0.5">{shot.movement}</div>
                            <div className="col-span-1 text-white/30 text-xs font-mono pt-0.5">{shot.lens}</div>
                            <div className="col-span-3 text-white/60 text-xs leading-relaxed">{shot.description}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function ShotListPanel({ project, setProject }) {
    const [generating, setGenerating] = useState(false)

    let shotList = []
    try {
        shotList = typeof project?.shotList === 'string'
            ? JSON.parse(project.shotList)
            : (Array.isArray(project?.shotList) ? project.shotList : [])
    } catch { }

    const totalShots = shotList.reduce((acc, s) => acc + (Array.isArray(s.shots) ? s.shots.length : 0), 0)

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const { data } = await apiClient.post('/api/generate/shot-list', { projectId: project.id })
            let finalData = Array.isArray(data) ? data : []
            setProject(prev => ({ ...prev, shotList: finalData }))
            toast.success(`Generated ${finalData.length} scene shot lists!`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate shot list')
        } finally {
            setGenerating(false)
        }
    }

    if (shotList.length === 0) {
        return (
            <div className="glass-card p-12 text-center animate-fade-in">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="font-bold text-lg mb-2">Shot List Generator</h3>
                <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
                    Automatically generates a professional Director/DP-ready shot list from your screenplay, scene by scene, with shot type, camera angle, movement, and lens recommendations.
                </p>
                <button onClick={handleGenerate} disabled={generating || !project?.scenes?.length} className="btn-primary flex items-center gap-2 mx-auto">
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    {!project?.scenes?.length ? 'Generate Screenplay First' : 'Generate Shot List'}
                </button>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold">Shot List</h2>
                        <span className="badge bg-gold-500/10 text-gold-400 border border-gold-500/20 text-xs font-semibold">
                            🎬 Director's Cut
                        </span>
                    </div>
                    <p className="text-white/40 text-sm mt-1">
                        {shotList.length} scenes · {totalShots} total shots
                    </p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="btn-secondary flex items-center gap-2 text-sm"
                >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Regenerate
                </button>
            </div>

            {/* Shot List */}
            <div className="space-y-3">
                {shotList.map((sceneData, i) => (
                    <SceneShotBlock key={i} sceneData={sceneData} />
                ))}
            </div>
        </div>
    )
}
