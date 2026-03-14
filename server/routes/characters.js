const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// PATCH /api/characters/:id
router.patch('/:id', async (req, res) => {
    try {
        const updated = await prisma.character.update({
            where: { id: req.params.id }, data: req.body,
        })
        res.json(updated)
    } catch (err) { res.status(500).json({ message: 'Character update failed' }) }
})

module.exports = router
