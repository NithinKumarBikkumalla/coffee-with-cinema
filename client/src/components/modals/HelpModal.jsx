import { X, BookOpen, Film, Users, PlayCircle, Settings, Music, RefreshCw } from 'lucide-react'

export default function HelpModal({ onClose }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-navy-900" />
                        </div>
                        <h2 className="text-xl font-bold">How to use Coffee-with-Cinema</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-8">
                    <section>
                        <h3 className="text-lg font-bold text-gold-400 mb-3 flex items-center gap-2">
                            <Film className="w-5 h-5" /> 1. Creating a Project
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Click <strong>"New Project"</strong> on the dashboard. Enter your title, choose your format (Film, Web Series, etc.), select a genre and tone, and most importantly—write a detailed <strong>Story Idea</strong>. The more details you provide about the plot and characters, the better the AI will generate your screenplay.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-teal-400 mb-3 flex items-center gap-2">
                            <Settings className="w-5 h-5" /> 2. Editing the Screenplay
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Once generated, open the <strong>Screenplay</strong> tab. Every single line—sluglines, action lines, and dialogue—is completely editable. Just click on the text and start typing. Your changes auto-save in the background. You can also drag and drop the grip icon on the left of any scene to reorder them!
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5" /> 3. Regenerating Content
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Hover over any Scene, or look at the top right of any Character Card, to find the <strong>Regenerate</strong> button. Clicking this allows you to provide a specific refinement note (e.g., "Make this dialogue more aggressive"). The AI will read the surrounding context and cleanly rewrite just that piece.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
                            <Users className="w-5 h-5" /> 4. Characters
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            In the <strong>Characters</strong> tab, click "Generate Character Profiles". The AI will read your entire screenplay and automatically extract all speaking characters, generating deep backstories, motivations, and traits. You can expand their cards to manually edit these details.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                            <Music className="w-5 h-5" /> 5. Sound Design
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            In the <strong>Sound Design</strong> tab, click "Generate Sound Design". The AI will break down your screenplay scene-by-scene and suggest ambient tracks, specific SFX, and musical moods for your audio team. All fields are fully editable!
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
