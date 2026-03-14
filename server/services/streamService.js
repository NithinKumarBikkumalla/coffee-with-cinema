/**
 * streamService.js — pipes an async generator to an SSE response
 */
async function pipeSSE(res, asyncGenerator) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders()

    try {
        for await (const chunk of asyncGenerator) {
            if (res.writableEnded) break
            res.write(chunk)
        }
        if (!res.writableEnded) {
            res.end()
        }
    } catch (err) {
        console.error('Stream error:', err)
        if (!res.writableEnded) {
            res.end()
        }
    }
}

module.exports = { pipeSSE }
