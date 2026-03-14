import { useState } from 'react'
import { X, Mail, Send, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactModal({ onClose }) {
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        // Simulate sending email
        setTimeout(() => {
            setLoading(false)
            setSent(true)
            toast.success("Message sent successfully!")
            setTimeout(onClose, 2000)
        }, 1500)
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gold-gradient rounded-lg flex items-center justify-center">
                            <Mail className="w-4 h-4 text-navy-900" />
                        </div>
                        <h2 className="text-xl font-bold">Contact Support</h2>
                    </div>
                    <button onClick={onClose} disabled={loading} className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {sent ? (
                        <div className="text-center py-8 animate-fade-in">
                            <CheckCircle2 className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold mb-2">Message Sent!</h3>
                            <p className="text-white/40 text-sm">Thank you for your feedback. Our team will get back to you shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">Subject</label>
                                <select required defaultValue="" className="input-field text-sm cursor-pointer w-full bg-navy-900">
                                    <option value="" disabled>Select a topic...</option>
                                    <option value="feedback">General Feedback</option>
                                    <option value="bug">Report a Bug</option>
                                    <option value="feature">Feature Request</option>
                                    <option value="billing">Billing & Access</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/60 mb-2">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="input-field text-sm resize-none"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            <button disabled={loading} type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                                {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
