import { useRef, useState, useCallback } from 'react'

export function useStream() {
    const [data, setData] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState(null)
    const eventSourceRef = useRef(null)

    const start = useCallback((url, options = {}) => {
        setData('')
        setError(null)
        setIsStreaming(true)

        const token = localStorage.getItem('scriptoria_token')

        // Use fetch for POST SSE since EventSource doesn't support POST
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(options.body || {}),
        }).then(async (res) => {
            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Generation failed' }))
                throw new Error(err.message || 'Generation failed')
            }

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            const read = async () => {
                const { done, value } = await reader.read()
                if (done) {
                    setIsStreaming(false)
                    if (options.onComplete) options.onComplete(buffer)
                    return
                }

                const chunk = decoder.decode(value, { stream: true })
                buffer += chunk
                setData(buffer)

                read()
            }
            read()
        }).catch((err) => {
            setError(err.message)
            setIsStreaming(false)
        })
    }, [])

    const stop = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }
        setIsStreaming(false)
    }, [])

    const reset = useCallback(() => {
        setData('')
        setError(null)
        setIsStreaming(false)
    }, [])

    return { data, isStreaming, error, start, stop, reset }
}
