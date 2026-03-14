import { useState, useCallback, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, Loader2, GripVertical } from 'lucide-react'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'
import SceneBlock from './SceneBlock'

export default function ScreenplayEditor({ project, setProject }) {
    const [saving, setSaving] = useState(false)
    const debounceRef = useRef({})

    const scenes = project?.scenes || []

    const debouncedSave = useCallback((sceneId, field, value) => {
        if (debounceRef.current[sceneId]) clearTimeout(debounceRef.current[sceneId])
        debounceRef.current[sceneId] = setTimeout(async () => {
            setSaving(true)
            try {
                await apiClient.patch(`/api/projects/${project.id}/scenes/${sceneId}`, { field, value })
            } catch {
                toast.error('Auto-save failed')
            } finally {
                setSaving(false)
            }
        }, 2000)
    }, [project?.id])

    const handleSceneChange = (sceneId, field, value) => {
        setProject(prev => ({
            ...prev,
            scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, [field]: value } : s)
        }))
        debouncedSave(sceneId, field, value)
    }

    const handleDragEnd = async (result) => {
        if (!result.destination) return
        const reordered = Array.from(scenes)
        const [moved] = reordered.splice(result.source.index, 1)
        reordered.splice(result.destination.index, 0, moved)
        setProject(prev => ({ ...prev, scenes: reordered }))
        try {
            await apiClient.patch(`/api/projects/${project.id}/scenes/reorder`, {
                orderedSceneIds: reordered.map(s => s.id)
            })
        } catch {
            toast.error('Reorder save failed')
        }
    }

    const addScene = async () => {
        try {
            const { data } = await apiClient.post(`/api/projects/${project.id}/scenes`, {
                actNumber: 1, sceneNumber: scenes.length + 1,
                slugline: 'INT. NEW SCENE - DAY', action: '', dialogue: [], order: scenes.length,
            })
            setProject(prev => ({ ...prev, scenes: [...prev.scenes, data] }))
        } catch {
            toast.error('Failed to add scene')
        }
    }

    if (!project) return null

    return (
        <div className="animate-fade-in">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold">{project.title}</h2>
                        <span className="badge bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2 py-0.5 text-xs font-semibold whitespace-nowrap">✓ Industry Standard Format</span>
                    </div>
                    <p className="text-white/40 text-sm mt-1">{scenes.length} scenes · {project.genre} · {project.tone}</p>
                </div>
                <div className="flex items-center gap-3">
                    {saving && (
                        <div className="flex items-center gap-2 text-white/30 text-xs">
                            <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                        </div>
                    )}
                    <button onClick={addScene} className="btn-secondary flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> Add Scene
                    </button>
                </div>
            </div>

            {scenes.length === 0 ? (
                <div className="text-center py-20 glass-card">
                    <p className="text-white/40 mb-4">No scenes yet. Generate a screenplay to get started.</p>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="scenes">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                {scenes.map((scene, index) => (
                                    <Draggable key={scene.id} draggableId={scene.id} index={index}>
                                        {(drag, snapshot) => (
                                            <div
                                                ref={drag.innerRef}
                                                {...drag.draggableProps}
                                                className={`transition-all duration-200 ${snapshot.isDragging ? 'opacity-80 scale-[1.01]' : ''}`}
                                            >
                                                <SceneBlock
                                                    scene={scene}
                                                    projectId={project.id}
                                                    dragHandleProps={drag.dragHandleProps}
                                                    onChange={handleSceneChange}
                                                    onRegenerated={(updated) => {
                                                        setProject(prev => ({
                                                            ...prev,
                                                            scenes: prev.scenes.map(s => s.id === updated.id ? updated : s)
                                                        }))
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
    )
}
