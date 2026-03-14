import { useState, useRef } from 'react'
import { GripVertical, RefreshCw, Trash2 } from 'lucide-react'
import RegenerateModal from '../modals/RegenerateModal'

export default function SceneBlock({ scene, projectId, dragHandleProps, onChange, onRegenerated }) {
    const [hovered, setHovered] = useState(false)
    const [showRegen, setShowRegen] = useState(false)
    const [fadeIn, setFadeIn] = useState(false)

    const dialogues = Array.isArray(scene.dialogue) ? scene.dialogue : []

    const handleRegenerated = (updated) => {
        setFadeIn(true)
        onRegenerated(updated)
        setTimeout(() => setFadeIn(false), 600)
    }

    return (
        <>
            <div
                className={`glass-card p-6 group relative transition-all duration-300 ${fadeIn ? 'animate-fade-in ring-1 ring-gold-500/30' : ''}`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Drag handle */}
                <div
                    {...dragHandleProps}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 text-white/15 hover:text-white/40 cursor-grab transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
                >
                    <GripVertical className="w-4 h-4" />
                </div>

                {/* Toolbar */}
                <div className={`absolute top-3 right-3 flex items-center gap-1 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        onClick={() => setShowRegen(true)}
                        className="flex items-center gap-1 text-xs text-white/40 hover:text-gold-400 bg-white/5 hover:bg-gold-500/10 border border-white/10 hover:border-gold-500/30 px-2 py-1 rounded-lg transition-all duration-200"
                    >
                        <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                </div>

                {/* Scene number badge */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded">
                        SCENE {scene.sceneNumber}
                    </span>
                    <span className="text-xs text-white/20">ACT {scene.actNumber}</span>
                </div>

                {/* Slugline */}
                <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => onChange(scene.id, 'slugline', e.currentTarget.textContent)}
                    className="screenplay-block text-sm font-bold tracking-widest text-white uppercase mb-3 outline-none 
                     focus:bg-white/5 rounded px-1 -mx-1 transition-colors min-h-[1.5em]"
                >
                    {scene.slugline}
                </div>

                {/* Action */}
                <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => onChange(scene.id, 'action', e.currentTarget.textContent)}
                    className="screenplay-block text-sm text-white/70 mb-5 outline-none leading-relaxed
                     focus:bg-white/5 rounded px-1 -mx-1 transition-colors min-h-[2em] whitespace-pre-wrap"
                >
                    {scene.action}
                </div>

                {/* Dialogue */}
                {dialogues.length > 0 && (
                    <div className="space-y-3 border-l-2 border-white/10 pl-4">
                        {dialogues.map((d, i) => (
                            <div key={i} className="screenplay-block">
                                <div className="text-xs font-bold text-white/60 uppercase tracking-wider text-center mb-0.5">
                                    {d.character}
                                </div>
                                {d.parenthetical && (
                                    <div className="text-xs text-white/40 italic text-center mb-0.5">({d.parenthetical})</div>
                                )}
                                <div className="text-sm text-white/60 text-center leading-relaxed max-w-sm mx-auto">
                                    {d.line}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showRegen && (
                <RegenerateModal
                    projectId={projectId}
                    targetType="scene"
                    targetId={scene.id}
                    onClose={() => setShowRegen(false)}
                    onRegenerated={handleRegenerated}
                />
            )}
        </>
    )
}
