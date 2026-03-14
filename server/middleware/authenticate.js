const jwt = require('jsonwebtoken')

module.exports = function authenticate(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' })
    }
    const token = authHeader.slice(7)
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = { id: decoded.userId }
        next()
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}
