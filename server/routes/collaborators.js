const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// GET /api/collaborators/:projectId — list collaborators for project (owner only)
router.get('/:projectId', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.projectId } })
        if (!project || project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })
        const collaborators = await prisma.collaborator.findMany({
            where: { projectId: req.params.projectId },
            orderBy: { invitedAt: 'desc' },
        })
        res.json(collaborators)
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch collaborators' })
    }
})

// GET /api/collaborators/invitations/mine — get pending invitations for current user
router.get('/invitations/mine', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } })
        if (!user) return res.status(404).json({ message: 'User not found' })

        const invitations = await prisma.collaborator.findMany({
            where: { email: user.email, status: 'pending' },
            include: {
                project: {
                    select: {
                        id: true, title: true, genre: true, tone: true, userId: true,
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { invitedAt: 'desc' },
        })
        res.json(invitations)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to fetch invitations' })
    }
})

// GET /api/collaborators/shared/projects — get projects shared with current user (accepted)
router.get('/shared/projects', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } })
        if (!user) return res.status(404).json({ message: 'User not found' })

        const accepted = await prisma.collaborator.findMany({
            where: { email: user.email, status: 'accepted' },
            include: {
                project: {
                    include: {
                        _count: { select: { scenes: true, characters: true } },
                        user: { select: { name: true } }
                    }
                }
            },
        })
        res.json(accepted.map(a => ({ ...a.project, collaboratorRole: a.role })))
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch shared projects' })
    }
})

// POST /api/collaborators/:projectId — invite collaborator
router.post('/:projectId', async (req, res) => {
    try {
        const { email, role } = req.body
        if (!email || !['viewer', 'editor'].includes(role)) {
            return res.status(400).json({ message: 'Valid email and role (viewer/editor) required' })
        }

        const project = await prisma.project.findUnique({ where: { id: req.params.projectId } })
        if (!project || project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })

        const invitedUser = await prisma.user.findUnique({ where: { email } })
        if (!invitedUser) return res.status(404).json({ message: `No account found with email "${email}". They must register first.` })
        if (invitedUser.id === req.user.id) return res.status(400).json({ message: 'You cannot invite yourself.' })

        const collaborator = await prisma.collaborator.upsert({
            where: { projectId_email: { projectId: req.params.projectId, email } },
            update: { role, status: 'pending' },
            create: { projectId: req.params.projectId, email, role, status: 'pending' },
        })
        res.status(201).json(collaborator)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to invite collaborator' })
    }
})

// PATCH /api/collaborators/respond/:collaboratorId — accept or decline
router.patch('/respond/:collaboratorId', async (req, res) => {
    try {
        const { status } = req.body
        if (!['accepted', 'declined'].includes(status)) return res.status(400).json({ message: 'Invalid status' })

        const user = await prisma.user.findUnique({ where: { id: req.user.id } })
        const invitation = await prisma.collaborator.findUnique({ where: { id: req.params.collaboratorId } })
        if (!invitation || invitation.email !== user.email) return res.status(403).json({ message: 'Access denied' })

        const updated = await prisma.collaborator.update({
            where: { id: req.params.collaboratorId },
            data: { status },
        })
        res.json(updated)
    } catch (err) {
        res.status(500).json({ message: 'Failed to respond to invitation' })
    }
})

// DELETE /api/collaborators/:projectId/:collaboratorId — remove collaborator (owner only)
router.delete('/:projectId/:collaboratorId', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.projectId } })
        if (!project || project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })
        await prisma.collaborator.delete({ where: { id: req.params.collaboratorId } })
        res.json({ message: 'Collaborator removed' })
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove collaborator' })
    }
})

module.exports = router
