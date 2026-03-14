import { useState } from 'react'
import { Download, ChevronDown, Loader2 } from 'lucide-react'
import apiClient from '../../api/client'
import toast from 'react-hot-toast'

const EXPORT_OPTIONS = [
    { value: 'pdf', label: '📄 Export as PDF', desc: 'Standard production format' },
    { value: 'docx', label: '📝 Export as DOCX', desc: 'Editable Word document' },
    { value: 'txt', label: '🔤 Export as Text', desc: 'Plain text file' },
]

export default function ExportButton({ projectId, project }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleExport = async (format) => {
        setOpen(false)
        const title = (project?.title || 'project').replace(/\s+/g, '-').toLowerCase()
        const toastId = toast.loading(`Generating ${format.toUpperCase()}…`)

        try {
            if (format === 'pdf') {
                setLoading(true)
                const response = await apiClient.post('/api/export/pdf', { projectId, exportType: 'full' }, {
                    responseType: 'blob',
                })
                const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
                const a = document.createElement('a')
                a.href = url
                a.download = `coffee-with-cinema-${title}.pdf`
                a.click()
                URL.revokeObjectURL(url)
            } else if (format === 'txt') {
                const textContent = `TITLE: ${project?.title}\n\nSTORY IDEA:\n${project?.premise}\n\nSCREENPLAY:\n${project?.screenplayJSON?.raw || 'Not generated yet'}\n`
                const url = URL.createObjectURL(new Blob([textContent], { type: 'text/plain' }))
                const a = document.createElement('a')
                a.href = url
                a.download = `coffee-with-cinema-${title}.txt`
                a.click()
                URL.revokeObjectURL(url)
            } else if (format === 'docx') {
                // Word-compatible HTML string saved as a .doc file
                const docHTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><title>${project?.title}</title></head>
                <body>
                    <h1>${project?.title}</h1>
                    <h3>Story Idea</h3>
                    <p>${project?.premise || ''}</p>
                    <hr/>
                    <h3>Screenplay</h3>
                    <pre style="font-family: Courier New, monospace;">${(project?.screenplayJSON?.raw || '').replace(/\n/g, '<br/>')}</pre>
                </body></html>`
                const url = URL.createObjectURL(new Blob([docHTML], { type: 'application/msword' }))
                const a = document.createElement('a')
                a.href = url
                a.download = `coffee-with-cinema-${title}.doc`
                a.click()
                URL.revokeObjectURL(url)
            }
            toast.success(`${format.toUpperCase()} downloaded!`, { id: toastId })
        } catch (err) {
            toast.error(`${format.toUpperCase()} export failed`, { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            <button
                id="export-btn"
                onClick={() => setOpen(p => !p)}
                disabled={loading}
                className="btn-secondary flex items-center gap-2 text-sm py-2"
            >
                {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Exporting…</>
                    : <><Download className="w-4 h-4" /> Export <ChevronDown className="w-3 h-3" /></>
                }
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 glass-card p-2 z-50 animate-slide-up shadow-card">
                        {EXPORT_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                id={`export-${opt.value}`}
                                onClick={() => handleExport(opt.value)}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 transition-colors duration-150 group"
                            >
                                <div className="text-sm font-medium text-white group-hover:text-gold-400 transition-colors">{opt.label}</div>
                                <div className="text-xs text-white/30 mt-0.5">{opt.desc}</div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
