const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function writeVersion(projectId, changeNote) {
    const proj = await prisma.project.findUnique({
        where: { id: projectId },
        include: { scenes: true, characters: true, sound: true, schedule: true },
    })
    const lastVer = await prisma.projectVersion.findFirst({
        where: { projectId }, orderBy: { versionNumber: 'desc' },
    })
    await prisma.projectVersion.create({
        data: {
            projectId, versionNumber: (lastVer?.versionNumber || 0) + 1,
            snapshotJSON: proj, changeNote,
        },
    })
}

// GET /api/projects — list user projects
router.get('/', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { userId: req.user.id, deletedAt: null },
            orderBy: { updatedAt: 'desc' },
            include: { _count: { select: { scenes: true, characters: true } } },
        })
        res.json(projects)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to fetch projects' })
    }
})

// POST /api/projects — create project
router.post('/', async (req, res) => {
    try {
        const { title, genre, tone, premise, length, screenplayJSON } = req.body
        const project = await prisma.$transaction(async (tx) => {
            const p = await tx.project.create({
                data: { userId: req.user.id, title, genre, tone, premise },
            })
            // Save scenes from screenplay JSON
            if (screenplayJSON?.acts) {
                const sceneData = []
                for (const act of screenplayJSON.acts) {
                    for (const scene of act.scenes || []) {
                        sceneData.push({
                            projectId: p.id, actNumber: act.act_number || 1,
                            sceneNumber: scene.scene_number || sceneData.length + 1,
                            slugline: scene.slugline || '', action: scene.action || '',
                            dialogue: scene.dialogue || [], order: sceneData.length,
                        })
                    }
                }
                if (sceneData.length > 0) await tx.scene.createMany({ data: sceneData })
            }
            return tx.project.findUnique({
                where: { id: p.id },
                include: { scenes: { orderBy: { order: 'asc' } }, characters: true, sound: true, schedule: true, _count: { select: { scenes: true, characters: true } } },
            })
        })
        res.status(201).json(project)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to create project' })
    }
})

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: { scenes: { orderBy: { order: 'asc' } }, characters: true, sound: { orderBy: { sceneNumber: 'asc' } }, schedule: true },
        })
        if (!project) return res.status(404).json({ message: 'Project not found' })

        // Allow access to the owner OR an accepted collaborator
        const isOwner = project.userId === req.user.id
        let collaboratorRole = null
        if (!isOwner) {
            const user = await prisma.user.findUnique({ where: { id: req.user.id } })
            const collab = user ? await prisma.collaborator.findFirst({
                where: { projectId: project.id, email: user.email, status: 'accepted' }
            }) : null
            if (!collab) return res.status(403).json({ message: 'Project not found or access denied' })
            collaboratorRole = collab.role // 'viewer' | 'editor'
        }

        res.json({ ...project, collaboratorRole })
    } catch (err) { res.status(500).json({ message: 'Failed to load project' }) }
})

// PATCH /api/projects/:id
router.patch('/:id', async (req, res) => {
    try {
        if (!await canEdit(req.params.id, req.user.id)) return res.status(403).json({ message: 'Access denied' })
        await writeVersion(req.params.id, 'Auto-saved')
        const updated = await prisma.project.update({
            where: { id: req.params.id },
            data: { ...req.body, updatedAt: new Date() },
        })
        res.json(updated)
    } catch (err) { res.status(500).json({ message: 'Update failed' }) }
})

// DELETE /api/projects/:id (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.id } })
        if (!project || project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })
        await prisma.project.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } })
        res.json({ message: 'Project deleted' })
    } catch (err) { res.status(500).json({ message: 'Delete failed' }) }
})

// GET /api/projects/:id/versions
router.get('/:id/versions', async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.id } })
        if (!project) return res.status(404).json({ message: 'Project not found' })

        // Accessible if owner or collaborator
        if (project.userId !== req.user.id) {
            const user = await prisma.user.findUnique({ where: { id: req.user.id } })
            const collab = await prisma.collaborator.findFirst({
                where: { projectId: req.params.id, email: user.email, status: 'accepted' }
            })
            if (!collab) return res.status(403).json({ message: 'Access denied' })
        }

        const versions = await prisma.projectVersion.findMany({
            where: { projectId: req.params.id }, orderBy: { versionNumber: 'desc' },
            select: { id: true, versionNumber: true, changeNote: true, savedAt: true },
        })
        res.json(versions)
    } catch (err) { res.status(500).json({ message: 'Failed to fetch versions' }) }
})

// POST /api/projects/:id/restore
router.post('/:id/restore', async (req, res) => {
    try {
        if (!await canEdit(req.params.id, req.user.id)) return res.status(403).json({ message: 'Access denied' })
        const version = await prisma.projectVersion.findFirst({
            where: { projectId: req.params.id, versionNumber: req.body.versionNumber },
        })
        if (!version) return res.status(404).json({ message: 'Version not found' })
        const snapshot = version.snapshotJSON
        await writeVersion(req.params.id, `Pre-restore snapshot`)
        // Restore scenes
        await prisma.scene.deleteMany({ where: { projectId: req.params.id } })
        if (snapshot.scenes?.length) await prisma.scene.createMany({ data: snapshot.scenes.map(s => ({ ...s, id: undefined, createdAt: undefined, updatedAt: undefined })) })
        const restored = await prisma.project.findUnique({
            where: { id: req.params.id },
            include: { scenes: { orderBy: { order: 'asc' } }, characters: true, sound: true, schedule: true },
        })
        await prisma.projectVersion.create({
            data: { projectId: req.params.id, versionNumber: (await prisma.projectVersion.count({ where: { projectId: req.params.id } })) + 1, snapshotJSON: restored, changeNote: `Restored from v${req.body.versionNumber}` },
        })
        res.json(restored)
    } catch (err) { console.error(err); res.status(500).json({ message: 'Restore failed' }) }
})

// PATCH /api/projects/:id/scenes/reorder
router.patch('/:id/scenes/reorder', async (req, res) => {
    try {
        if (!await canEdit(req.params.id, req.user.id)) return res.status(403).json({ message: 'Access denied' })
        const { orderedSceneIds } = req.body
        await Promise.all(orderedSceneIds.map((sceneId, index) =>
            prisma.scene.update({ where: { id: sceneId }, data: { order: index } })
        ))
        res.json({ message: 'Reordered' })
    } catch (err) { res.status(500).json({ message: 'Reorder failed' }) }
})

// Helper: check if user has edit access (owner or accepted editor)
async function canEdit(projectId, userId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return false
    if (project.userId === userId) return true
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return false
    const collab = await prisma.collaborator.findFirst({
        where: { projectId, email: user.email, status: 'accepted', role: 'editor' }
    })
    return !!collab
}

// PATCH /api/projects/:id/scenes/:sceneId
router.patch('/:id/scenes/:sceneId', async (req, res) => {
    try {
        if (!await canEdit(req.params.id, req.user.id)) return res.status(403).json({ message: 'Access denied' })
        const { field, value } = req.body
        const allowedFields = ['slugline', 'action', 'dialogue']
        if (!allowedFields.includes(field)) return res.status(400).json({ message: 'Invalid field' })
        const updated = await prisma.scene.update({
            where: { id: req.params.sceneId }, data: { [field]: value },
        })
        res.json(updated)
    } catch (err) { res.status(500).json({ message: 'Scene update failed' }) }
})

// POST /api/projects/:id/scenes — add blank scene
router.post('/:id/scenes', async (req, res) => {
    try {
        if (!await canEdit(req.params.id, req.user.id)) return res.status(403).json({ message: 'Access denied' })
        const count = await prisma.scene.count({ where: { projectId: req.params.id } })
        const scene = await prisma.scene.create({
            data: { projectId: req.params.id, ...req.body, order: count },
        })
        res.status(201).json(scene)
    } catch (err) { res.status(500).json({ message: 'Failed to add scene' }) }
})

module.exports = router
