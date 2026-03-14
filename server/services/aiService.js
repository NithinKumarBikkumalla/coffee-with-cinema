const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * streamScreenplay — streams Gemini response as async iterator
 */
async function* streamScreenplay(prompt) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: prompt.system,
        generationConfig: {
            responseMimeType: 'application/json'
        }
    })

    const result = await model.generateContentStream(prompt.user)

    for await (const chunk of result.stream) {
        yield chunk.text()
    }
}

/**
 * generateJSON — non-streaming call, parses JSON from response
 */
async function generateJSON(prompt) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: prompt.system + "\nAlways return VALID JSON only.",
        generationConfig: {
            responseMimeType: 'application/json'
        }
    })

    const response = await model.generateContent(prompt.user)
    const raw = response.response.text() || ''

    // Extract JSON from response (handle any wrapping markdown)
    const jsonMatch = raw.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
    if (!jsonMatch) throw new Error('AI returned invalid JSON format')
    return JSON.parse(jsonMatch[0])
}

module.exports = { streamScreenplay, generateJSON }
