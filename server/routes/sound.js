const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.patch('/:id', async (req, res) => {
    try {
        const updated = await prisma.soundDesign.update({
            where: { id: req.params.id }, data: req.body,
        })
        res.json(updated)
    } catch (err) { res.status(500).json({ message: 'Sound update failed' }) }
})

module.exports = router
