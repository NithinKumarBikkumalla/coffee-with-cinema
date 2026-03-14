/**
 * promptBuilder.js — Constructs structured prompts for each AI generation type
 */

function buildScreenplayPrompt(title, genre, tone, premise, length) {
  const sceneCount = length === 'feature' ? '40-60' : '10-15'
  return {
    system: `You are an expert Hollywood screenwriter. Write professional screenplays in proper Final Draft format.
Always return VALID JSON only — no markdown, no code blocks, just raw JSON.
Use proper 3-act structure: Setup (Act 1), Confrontation (Act 2), Resolution (Act 3).`,
    user: `Write a complete ${genre.toLowerCase()} screenplay titled "${title}".
Tone: ${tone}
Premise: ${premise}
Length: approximately ${sceneCount} scenes total across 3 acts.

Return ONLY this JSON structure (no other text):
{
  "title": "${title}",
  "acts": [
    {
      "act_number": 1,
      "scenes": [
        {
          "scene_number": 1,
          "slugline": "INT. LOCATION - DAY",
          "action": "Vivid action description here.",
          "dialogue": [
            { "character": "CHARACTER NAME", "line": "Spoken line of dialogue.", "parenthetical": "optional tone note" }
          ]
        }
      ]
    }
  ]
}

Write compelling, cinematic content. Make dialogue feel authentic. Include at least 3 named characters.`,
  }
}

function buildCharacterPrompt(title, genre, tone, premise, characterNames, dialogueByChar) {
  const charList = characterNames.map(name => {
    const lines = (dialogueByChar[name] || []).slice(0, 5).join(' | ')
    return `${name}: "${lines}"`
  }).join('\n')

  return {
    system: `You are a professional script consultant specializing in deep character development.
Always return VALID JSON only — no markdown, no preamble.`,
    user: `For the ${genre} film "${title}" (${tone} tone):
Premise: ${premise}

Create detailed character profiles for these characters:
${charList}

Return ONLY a JSON array:
[
  {
    "name": "Character Name",
    "role": "protagonist|antagonist|supporting",
    "age": "30s",
    "backstory": "150-200 word backstory",
    "personality_traits": ["trait1", "trait2", "trait3"],
    "motivation": "Core motivation in one sentence",
    "character_arc": "How they change through the story",
    "relationship_to_protagonist": "How they relate to the main character"
  }
]`,
  }
}

function buildSoundPrompt(scenes) {
  const sceneList = scenes.slice(0, 30).map(s =>
    `Scene ${s.sceneNumber}: ${s.slugline} — ${s.action?.slice(0, 100)}`
  ).join('\n')

  return {
    system: `You are a professional sound designer and music supervisor for film.
Always return VALID JSON only.`,
    user: `Create a detailed sound design plan for these scenes:

${sceneList}

Return ONLY a JSON array (one object per scene):
[
  {
    "scene_number": 1,
    "ambient": "Environmental background sound description",
    "sfx": ["specific sound effect 1", "specific sound effect 2"],
    "music_mood": "Emotional quality and instrumentation description",
    "music_genre": "Genre label (e.g. Orchestral thriller)",
    "notes": "Director guidance note for the sound designer"
  }
]`,
  }
}

function buildSchedulePrompt(scenes) {
  const locationGroups = {}
  scenes.forEach(s => {
    const loc = s.slugline?.split(' — ')[0]?.replace(/^(INT\.|EXT\.)/, '').trim() || 'UNKNOWN'
    if (!locationGroups[loc]) locationGroups[loc] = []
    locationGroups[loc].push(s.sceneNumber)
  })

  return {
    system: `You are an experienced film production manager with expertise in scheduling.
Always return VALID JSON only.`,
    user: `Create a realistic production schedule for a film with ${scenes.length} scenes.

Location groups (scenes): ${JSON.stringify(locationGroups)}

Return ONLY this JSON:
{
  "total_shoot_days": <number>,
  "phases": [
    {
      "phase_name": "Pre-production",
      "start_day": -14,
      "end_day": -1,
      "tasks": ["task 1", "task 2", "task 3"]
    },
    {
      "phase_name": "Principal Photography",
      "start_day": 1,
      "end_day": <total_shoot_days>,
      "tasks": ["task 1", "task 2"]
    },
    {
      "phase_name": "Post-production",
      "start_day": <total_shoot_days + 1>,
      "end_day": <total_shoot_days + 30>,
      "tasks": ["editing", "sound mixing", "color grading"]
    }
  ],
  "shoot_days": [
    {
      "day": 1,
      "location": "Location name",
      "scenes": [1, 2, 3],
      "estimated_hours": 10,
      "notes": "Practical note for this shoot day"
    }
  ]
}`,
  }
}

function buildRegeneratePrompt(targetType, currentContent, surroundingContext, refinementNote) {
  return {
    system: `You are an expert Hollywood screenwriter. Rewrite only the requested section.
Keep it consistent with surrounding context. Always return VALID JSON only.`,
    user: `Rewrite this ${targetType}. Keep it consistent with context provided.
${refinementNote ? `\nSpecific instruction: ${refinementNote}` : ''}

Current content:
${JSON.stringify(currentContent, null, 2)}

Surrounding context:
${JSON.stringify(surroundingContext, null, 2)}

Return the rewritten ${targetType} as a JSON object matching the same structure as the current content.`,
  }
}

function buildDialoguePrompt(character1, character2, context, projectTone, projectGenre) {
  return {
    system: `You are an expert Hollywood screenwriter specializing in authentic, punchy dialogue. Always return VALID JSON only.`,
    user: `Write a short dialogue exchange between two characters for a ${projectGenre} film (${projectTone} tone).
Characters: ${character1} and ${character2}.
Scene Context/Prompt: ${context}

The dialogue should be a back-and-forth exchange (approx 4-8 lines).

Return ONLY this JSON structure (no other text or markdown):
[
  { "character": "CHARACTER NAME", "line": "Spoken line of dialogue.", "parenthetical": "optional action/feeling" }
]`,
  }
}

function buildRelationshipPrompt(characters, projectTitle, projectGenre) {
  const charNames = characters.map(c => c.name).join(', ')
  return {
    system: `You are a Hollywood script analyst. Analyze character relationships. Always return VALID JSON only.`,
    user: `For the ${projectGenre} film "${projectTitle}", analyze the dynamic between these characters: ${charNames}.

Return ONLY this structured JSON array containing significant relational edges:
[
  {
    "source": "Character A",
    "target": "Character B",
    "type": "Friends|Enemies|Lovers|Family|Rivals|Mentor",
    "description": "Short description of dynamic"
  }
]`,
  }
}

function buildShotListPrompt(scenes, projectTitle, projectGenre) {
  return {
    system: `You are an experienced Film Director and Director of Photography (DP). Generate professional shot lists. Always return VALID JSON only.`,
    user: `Create a detailed shot list for the ${projectGenre} film "${projectTitle}".

Scenes:
${scenes.slice(0, 30).map(s => `Scene ${s.sceneNumber}: ${s.slugline} — ${s.action?.slice(0, 120)}`).join('\n')}

Return ONLY a JSON array where EACH scene has an object with shots:
[
  {
    "scene_number": 1,
    "slugline": "INT. LOCATION - DAY",
    "shots": [
      {
        "shot_number": 1,
        "shot_type": "Wide Shot",
        "camera_angle": "Eye Level",
        "movement": "Static",
        "lens": "24mm",
        "description": "Brief description of what the camera sees"
      }
    ]
  }
]

Use professional shot types: Extreme Wide Shot, Wide Shot, Medium Shot, Close-Up, Extreme Close-Up, Two Shot, Over-the-Shoulder, Point of View.
Use professional movements: Static, Pan, Tilt, Dolly In, Dolly Out, Tracking, Handheld, Crane Up/Down.`,
  }
}

function buildEndingsPrompt(title, genre, tone, premise, lastSceneAction) {
  return {
    system: `You are a master storyteller and Hollywood screenwriter. Generate multiple alternate endings. Always return VALID JSON only.`,
    user: `For the ${genre} film "${title}" (${tone} tone):
Premise: ${premise}
Story so far (last scene): ${lastSceneAction}

Generate exactly 3 compelling alternate endings for this story.

Return ONLY this JSON array:
[
  {
    "type": "Happy Ending",
    "emoji": "😊",
    "title": "Short catchy title for this ending",
    "summary": "2-3 sentences describing how the story resolves",
    "final_scene": {
      "slugline": "INT./EXT. LOCATION - TIME",
      "action": "Vivid 2-4 sentence description of the final scene action.",
      "dialogue": [
        { "character": "CHARACTER", "line": "Final powerful line of dialogue.", "parenthetical": "tone" }
      ]
    }
  },
  {
    "type": "Tragic Ending",
    "emoji": "💔",
    "title": "Short catchy title for this ending",
    "summary": "2-3 sentences",
    "final_scene": { "slugline": "", "action": "", "dialogue": [] }
  },
  {
    "type": "Twist Ending",
    "emoji": "🌀",
    "title": "Short catchy title for this ending",
    "summary": "2-3 sentences",
    "final_scene": { "slugline": "", "action": "", "dialogue": [] }
  }
]`,
  }
}

function buildPosterPrompt(title, genre, tone, premise) {
  return {
    system: `You are a professional film marketing executive and graphic designer. Always return VALID JSON only.`,
    user: `Generate 3 distinct movie poster concepts for the ${genre} film "${title}" (${tone} tone).
    Premise: ${premise}

    For each concept, provide:
    1. A catchy tagline
    2. Visual style (e.g. Minimalist, Noir, Vibrant, Epic)
    3. Key imagery (main characters, objects, setting)
    4. Color palette
    5. Typography description

    Return ONLY a JSON array:
    [
      {
        "concept_name": "Short descriptive name",
        "tagline": "The hook",
        "visual_style": "Artistic direction",
        "key_imagery": "What is on the poster",
        "color_palette": ["Color 1", "Color 2", "Color 3"],
        "typography": "Font style and placement",
        "mood_summary": "1-2 sentences on the vibe"
      }
    ]`,
  }
}

module.exports = {
  buildScreenplayPrompt,
  buildCharacterPrompt,
  buildSoundPrompt,
  buildSchedulePrompt,
  buildRegeneratePrompt,
  buildDialoguePrompt,
  buildRelationshipPrompt,
  buildShotListPrompt,
  buildEndingsPrompt,
  buildPosterPrompt,
}
