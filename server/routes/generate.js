const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { streamScreenplay, generateJSON } = require('../services/aiService')
const { pipeSSE } = require('../services/streamService')
const {
    buildScreenplayPrompt, buildCharacterPrompt,
    buildSoundPrompt, buildSchedulePrompt, buildRegeneratePrompt,
    buildDialoguePrompt, buildRelationshipPrompt, buildShotListPrompt, buildEndingsPrompt,
} = require('../services/promptBuilder')

// POST /api/generate/screenplay — SSE streaming
router.post('/screenplay', async (req, res) => {
    try {
        const { title, genre, tone, premise, length } = req.body
        if (!title || !premise) return res.status(400).json({ message: 'Title and premise required' })
        const prompt = buildScreenplayPrompt(title, genre, tone, premise, length)
        const stream = streamScreenplay(prompt)
        await pipeSSE(res, stream)
    } catch (err) {
        console.error('Screenplay generation error:', err)
        if (!res.headersSent) res.status(500).json({ message: err.message })
    }
})

// POST /api/generate/characters — JSON
router.post('/characters', async (req, res) => {
    try {
        const { projectId } = req.body
        const project = await prisma.project.findUnique({
            where: { id: projectId }, include: { scenes: true },
        })
        if (!project || project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })

        // Extract character names + dialogue from scenes
        const dialogueByChar = {}
        for (const scene of project.scenes) {
            const dialogues = Array.isArray(scene.dialogue) ? scene.dialogue : []
            for (const d of dialogues) {
                if (d.character) {
                    if (!dialogueByChar[d.character]) dialogueByChar[d.character] = []
                    dialogueByChar[d.character].push(d.line || '')
                }
            }
        }
        const characterNames = Object.keys(dialogueByChar)
        if (characterNames.length === 0) return res.status(400).json({ message: 'No characters found in screenplay' })

        const prompt = buildCharacterPrompt(project.title, project.genre, project.tone, project.premise, characterNames, dialogueByChar)
        const profiles = await generateJSON(prompt)

        // Delete existing characters and recreate
        await prisma.character.deleteMany({ where: { projectId } })
        const characters = await prisma.character.createManyAndReturn({
            data: profiles.map(p => ({
                projectId, name: p.name, role: p.role || 'supporting', profileJSON: p,
            })),
        })
        res.json(characters)
    } catch (err) {
        console.error('Character generation error:', err)
        res.status(500).json({ message: err.message || 'Character generation failed' })
    }
})

// POST /api/generate/sound — JSON
router.post('/sound', async (req, res) => {
    try {
        const { projectId } = req.body
        const project = await prisma.project.findUnique({
            where: { id: projectId }, include: { scenes: { orderBy: { order: 'asc' } } },
        })
        if (!project || project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })
        if (!project.scenes.length) return res.status(400).json({ message: 'No scenes found' })

        const prompt = buildSoundPrompt(project.scenes)
        const soundPlan = await generateJSON(prompt)

        await prisma.soundDesign.deleteMany({ where: { projectId } })
        const sounds = await prisma.soundDesign.createManyAndReturn({
            data: soundPlan.map(s => ({
                projectId,
                sceneNumber: s.scene_number,
                ambient: s.ambient || '',
                sfx: s.sfx || [],
                musicMood: s.music_mood || '',
                musicGenre: s.music_genre || '',
                notes: s.notes || '',
            })),
        })
        res.json(sounds)
    } catch (err) {
        console.error('Sound generation error:', err)
        res.status(500).json({ message: err.message || 'Sound generation failed' })
    }
})

// POST /api/generate/schedule — JSON
router.post('/schedule', async (req, res) => {
    try {
        const { projectId } = req.body
        const project = await prisma.project.findUnique({
            where: { id: projectId }, include: { scenes: { orderBy: { order: 'asc' } } },
        })
        if (!project || project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })
        if (!project.scenes.length) return res.status(400).json({ message: 'No scenes found' })

        const prompt = buildSchedulePrompt(project.scenes)
        const scheduleData = await generateJSON(prompt)

        const schedule = await prisma.productionSchedule.upsert({
            where: { projectId },
            update: { scheduleJSON: scheduleData },
            create: { projectId, scheduleJSON: scheduleData },
        })
        res.json(scheduleData)
    } catch (err) {
        console.error('Schedule generation error:', err)
        res.status(500).json({ message: err.message || 'Schedule generation failed' })
    }
})

// POST /api/generate/regenerate — SSE or JSON
router.post('/regenerate', async (req, res) => {
    try {
        const { projectId, targetType, targetId, refinementNote } = req.body
        const project = await prisma.project.findUnique({ where: { id: projectId } })
        if (!project || project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })

        let currentContent = null
        let surroundingContext = {}

        if (targetType === 'scene') {
            currentContent = await prisma.scene.findUnique({ where: { id: targetId } })
            const scenes = await prisma.scene.findMany({ where: { projectId }, orderBy: { order: 'asc' } })
            const idx = scenes.findIndex(s => s.id === targetId)
            surroundingContext = {
                prevScene: scenes[idx - 1] || null,
                nextScene: scenes[idx + 1] || null,
                projectInfo: { title: project.title, genre: project.genre, tone: project.tone },
            }
        } else if (targetType === 'character') {
            currentContent = await prisma.character.findUnique({ where: { id: targetId } })
        }

        const prompt = buildRegeneratePrompt(targetType, currentContent, surroundingContext, refinementNote)
        const stream = streamScreenplay(prompt)
        await pipeSSE(res, stream)
    } catch (err) {
        console.error('Regenerate error:', err)
        if (!res.headersSent) res.status(500).json({ message: err.message })
    }
})

// POST /api/generate/dialogue — JSON
router.post('/dialogue', async (req, res) => {
    try {
        const { projectId, character1, character2, contextPrompt } = req.body
        const project = await prisma.project.findUnique({ where: { id: projectId } })
        if (!project || project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })

        const prompt = buildDialoguePrompt(character1, character2, contextPrompt, project.tone, project.genre)
        const dialogueData = await generateJSON(prompt)

        res.json(dialogueData)
    } catch (err) {
        console.error('Dialogue generation error:', err)
        res.status(500).json({ message: err.message || 'Dialogue generation failed' })
    }
})

// POST /api/generate/relationships — JSON
router.post('/relationships', async (req, res) => {
    try {
        const { projectId } = req.body
        const project = await prisma.project.findUnique({
            where: { id: projectId }, include: { characters: true },
        })
        if (!project || project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })
        if (!project.characters || project.characters.length < 2) {
            return res.status(400).json({ message: 'Need at least 2 characters to map relationships.' })
        }

        const prompt = buildRelationshipPrompt(project.characters, project.title, project.genre)
        let relData = await generateJSON(prompt)

        if (!Array.isArray(relData)) {
            if (relData && Array.isArray(relData.relationships)) relData = relData.relationships
            else if (relData && Array.isArray(relData.edges)) relData = relData.edges
            else relData = []
        }

        const updated = await prisma.project.update({
            where: { id: projectId },
            data: { relationshipMap: relData },
        })

        res.json(updated.relationshipMap)
    } catch (err) {
        console.error('Relationship mapped failed:', err)
        res.status(500).json({ message: err.message || 'Relationship mapping failed' })
    }
})

// POST /api/generate/shot-list — JSON
router.post('/shot-list', async (req, res) => {
    try {
        const { projectId } = req.body
        const project = await prisma.project.findUnique({
            where: { id: projectId }, include: { scenes: { orderBy: { order: 'asc' } } },
        })
        if (!project || project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })
        if (!project.scenes.length) return res.status(400).json({ message: 'Generate a screenplay first to create a shot list.' })

        const prompt = buildShotListPrompt(project.scenes, project.title, project.genre)
        let shotData = await generateJSON(prompt)

        if (!Array.isArray(shotData)) {
            if (shotData && Array.isArray(shotData.shot_list)) shotData = shotData.shot_list
            else if (shotData && Array.isArray(shotData.scenes)) shotData = shotData.scenes
            else shotData = []
        }

        const updated = await prisma.project.update({
            where: { id: projectId },
            data: { shotList: shotData },
        })

        res.json(updated.shotList)
    } catch (err) {
        console.error('Shot list generation error:', err)
        res.status(500).json({ message: err.message || 'Shot list generation failed' })
    }
})

// POST /api/generate/endings — JSON
router.post('/endings', async (req, res) => {
    try {
        const { projectId } = req.body
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { scenes: { orderBy: { order: 'desc' }, take: 3 } },
        })
        if (!project || project.userId !== req.user.id) return res.status(403).json({ message: 'Access denied' })
        if (!project.scenes.length) return res.status(400).json({ message: 'Generate a screenplay first.' })

        const lastSceneAction = project.scenes[0]?.action || project.premise
        const prompt = buildEndingsPrompt(project.title, project.genre, project.tone, project.premise, lastSceneAction)
        let endingsData = await generateJSON(prompt)

        if (!Array.isArray(endingsData)) {
            if (endingsData && Array.isArray(endingsData.endings)) endingsData = endingsData.endings
            else endingsData = []
        }

        const updated = await prisma.project.update({
            where: { id: projectId },
            data: { endings: endingsData },
        })

        res.json(updated.endings)
    } catch (err) {
        console.error('Endings generation error:', err)
        res.status(500).json({ message: err.message || 'Endings generation failed' })
    }
})

module.exports = router
