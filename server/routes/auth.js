const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' })
        if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email format' })

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) return res.status(409).json({ message: 'An account with this email already exists' })

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
        const user = await prisma.user.create({
            data: { name: name.trim(), email: email.toLowerCase().trim(), hashedPassword },
        })

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } })
    } catch (err) {
        console.error('Register error:', err)
        res.status(500).json({ message: 'Registration failed' })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
        if (!user) return res.status(401).json({ message: 'Invalid email or password' })

        const valid = await bcrypt.compare(password, user.hashedPassword)
        if (!valid) return res.status(401).json({ message: 'Invalid email or password' })

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ message: 'Login failed' })
    }
})

module.exports = router
