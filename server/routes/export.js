const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { buildHTMLTemplate, generatePDF } = require('../services/pdfService')

router.post('/pdf', async (req, res) => {
    try {
        const { projectId, exportType } = req.body
        if (!['full', 'screenplay', 'characters', 'schedule'].includes(exportType)) {
            return res.status(400).json({ message: 'Invalid export type' })
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                user: true,
                scenes: { orderBy: { order: 'asc' } },
                characters: true,
                sound: { orderBy: { sceneNumber: 'asc' } },
                schedule: true,
            },
        })

        if (!project) return res.status(404).json({ message: 'Project not found' })
        if (project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })

        const htmlString = buildHTMLTemplate(project, exportType)
        const pdfBuffer = await generatePDF(htmlString)

        // Log the export
        await prisma.exportLog.create({
            data: {
                projectId,
                userId: req.user.id,
                exportType,
            },
        })

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="scriptoria-${project.title.replace(/\s+/g, '-').toLowerCase()}-${exportType}.pdf"`)
        res.status(200).send(pdfBuffer)
    } catch (err) {
        console.error('PDF Export Error:', err)
        res.status(500).json({ message: 'Failed to generate PDF document' })
    }
})

module.exports = router
