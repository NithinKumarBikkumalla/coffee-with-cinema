require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const projectRoutes = require('./routes/projects')
const generateRoutes = require('./routes/generate')
const exportRoutes = require('./routes/export')
const authenticate = require('./middleware/authenticate')
const rateLimiter = require('./middleware/rateLimiter')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
    origin: function (origin, callback) { callback(null, true) },
    credentials: true,
}))
app.use(express.json({ limit: '2mb' }))

// Public routes
app.use('/api/auth', authRoutes)

// Protected routes
app.use('/api/projects', authenticate, projectRoutes)
app.use('/api/characters', authenticate, require('./routes/characters'))
app.use('/api/sound', authenticate, require('./routes/sound'))
app.use('/api/schedule', authenticate, require('./routes/schedule'))
app.use('/api/generate', authenticate, rateLimiter, generateRoutes)
app.use('/api/export', authenticate, exportRoutes)
app.use('/api/collaborators', authenticate, require('./routes/collaborators'))

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
    console.log(`🎬 Coffee-with-Cinema server running on http://localhost:${PORT}`)
})

module.exports = app
