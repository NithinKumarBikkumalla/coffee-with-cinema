import { useState } from 'react'
import { Loader2, MapPin, Clock } from 'lucide-react'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'

const LOCATION_COLORS = [
    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'bg-green-500/20 text-green-300 border-green-500/30',
    'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'bg-teal-500/20 text-teal-300 border-teal-500/30',
    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
]

export default function ProductionCalendar({ project, setProject }) {
    const [generating, setGenerating] = useState(false)
    const schedule = project?.schedule?.scheduleJSON || null

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const { data } = await apiClient.post('/api/generate/schedule', { projectId: project.id })
            setProject(prev => ({ ...prev, schedule: { scheduleJSON: data } }))
            toast.success('Production schedule generated!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Generation failed')
        } finally {
            setGenerating(false)
        }
    }

    const locationColorMap = {}
    let colorIdx = 0
    const getLocationColor = (loc) => {
        if (!locationColorMap[loc]) {
            locationColorMap[loc] = LOCATION_COLORS[colorIdx % LOCATION_COLORS.length]
            colorIdx++
        }
        return locationColorMap[loc]
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold">Production Schedule</h2>
                    <p className="text-white/40 text-sm">
                        {schedule ? `${schedule.total_shoot_days} shoot days · ${schedule.phases?.length || 0} phases` : 'Not generated yet'}
                    </p>
                </div>
                <button
                    id="generate-schedule-btn"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : '📅 Generate Schedule'}
                </button>
            </div>

            {!schedule ? (
                <div className="glass-card p-12 text-center">
                    <div className="text-4xl mb-4">📅</div>
                    <h3 className="font-bold mb-2">No schedule yet</h3>
                    <p className="text-white/40 text-sm mb-6">Auto-build a shoot schedule from your screenplay</p>
                    <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2 mx-auto">
                        {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                        Generate Schedule
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Phases */}
                    {schedule.phases?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Production Phases</h3>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {schedule.phases.map((phase, i) => (
                                    <div key={i} className="glass-card p-4">
                                        <h4 className="font-bold text-sm mb-1">{phase.phase_name}</h4>
                                        <p className="text-white/40 text-xs mb-3">Days {phase.start_day} – {phase.end_day}</p>
                                        <ul className="space-y-1">
                                            {phase.tasks?.slice(0, 3).map((t, j) => (
                                                <li key={j} className="text-xs text-white/50 flex items-start gap-1.5">
                                                    <span className="text-teal-400 mt-0.5">•</span>{t}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Shoot days */}
                    {schedule.shoot_days?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                                Shoot Days ({schedule.total_shoot_days} total)
                            </h3>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {schedule.shoot_days.map((day, i) => (
                                    <div key={i} className="glass-card p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-lg text-gold-500">Day {day.day}</span>
                                            <div className="flex items-center gap-1 text-white/30 text-xs">
                                                <Clock className="w-3 h-3" />
                                                {day.estimated_hours}h
                                            </div>
                                        </div>
                                        <div className={`badge border text-xs mb-3 ${getLocationColor(day.location)}`}>
                                            <MapPin className="w-2.5 h-2.5 mr-1" />
                                            {day.location}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {day.scenes?.map(s => (
                                                <span key={s} className="text-xs bg-white/5 text-white/40 border border-white/10 px-1.5 py-0.5 rounded">
                                                    Sc.{s}
                                                </span>
                                            ))}
                                        </div>
                                        {day.notes && <p className="text-white/30 text-xs leading-relaxed">{day.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
