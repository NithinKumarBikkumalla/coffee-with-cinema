const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.patch('/:projectId', async (req, res) => {
    try {
        const updated = await prisma.productionSchedule.upsert({
            where: { projectId: req.params.projectId },
            update: { scheduleJSON: req.body.scheduleJSON },
            create: { projectId: req.params.projectId, scheduleJSON: req.body.scheduleJSON },
        })
        res.json(updated)
    } catch (err) { res.status(500).json({ message: 'Schedule update failed' }) }
})

module.exports = router
