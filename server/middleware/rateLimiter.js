const rateLimit = require('express-rate-limit')

module.exports = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
    keyGenerator: (req) => req.user.id,
    message: { message: 'Too many generation requests. Please wait before trying again.' },
    standardHeaders: true,
    legacyHeaders: false,
})
