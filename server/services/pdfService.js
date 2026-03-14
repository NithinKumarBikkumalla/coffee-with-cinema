const puppeteer = require('puppeteer')

function buildHTMLTemplate(project, exportType) {
  const { title, genre, tone, user, scenes, characters, sound, schedule } = project

  // Basic styling for the PDF
  const styles = `
    body { font-family: "Courier New", Courier, monospace; font-size: 12pt; line-height: 1.2; margin: 0; padding: 0; }
    .page { padding: 1in; page-break-after: always; text-align: left; }
    .cover { display: flex; flex-direction: column; justify-content: center; height: 100vh; text-align: center; }
    .title { font-size: 24pt; font-weight: bold; margin-bottom: 2rem; text-transform: uppercase; }
    .author { font-size: 14pt; margin-bottom: 4rem; }
    .metadata { font-size: 12pt; color: #555; }
    
    /* Screenplay specific */
    .scene-heading { text-transform: uppercase; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; }
    .action { margin-bottom: 1rem; }
    .dialogue-block { margin-top: 1rem; margin-bottom: 1rem; }
    .character-name { text-align: center; text-transform: uppercase; margin-left: 20%; margin-right: 20%; }
    .parenthetical { text-align: center; margin-left: 25%; margin-right: 25%; }
    .dialogue-line { text-align: left; margin-left: 15%; margin-right: 15%; }

    /* General sections */
    h2 { font-size: 18pt; font-weight: bold; margin-bottom: 1rem; margin-top: 2rem; border-bottom: 1px solid #ccc; padding-bottom: 0.5rem; }
    h3 { font-size: 14pt; font-weight: bold; margin-top: 1.5rem; }
    .character-card { margin-bottom: 2rem; border: 1px solid #eee; padding: 1rem; border-radius: 4px; }
    .sound-card { margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px dashed #eee; }
    
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    
    @page { margin: 0; }
  `

  let html = `<!DOCTYPE html><html><head><style>${styles}</style></head><body>`

  // --- Cover Page ---
  html += `
    <div class="page cover">
      <div class="title">${title || 'UNTITLED PROJECT'}</div>
      <div class="author">written by<br/><br/>${user?.name || 'Author'}</div>
      <div class="metadata">
        Genre: ${genre || 'Unspecified'}<br/>
        Tone: ${tone || 'Unspecified'}<br/><br/>
        Generated via Coffee-with-Cinema<br/>
        ${new Date().toLocaleDateString()}
      </div>
    </div>
  `

  // --- Screenplay Section ---
  if (['full', 'screenplay'].includes(exportType) && scenes && scenes.length > 0) {
    html += `<div class="page">`
    scenes.forEach(scene => {
      html += `<div class="scene-heading">SCENE ${scene.sceneNumber} - ${scene.slugline || 'UNTITLED SCENE'}</div>`
      if (scene.action) {
        html += `<div class="action">${scene.action.replace(/\n/g, '<br/>')}</div>`
      }
      if (scene.dialogue && Array.isArray(scene.dialogue)) {
        scene.dialogue.forEach(d => {
          html += `<div class="dialogue-block">
            <div class="character-name">${d.character || 'UNKNOWN'}</div>
            ${d.parenthetical ? `<div class="parenthetical">(${d.parenthetical})</div>` : ''}
            <div class="dialogue-line">${(d.line || '').replace(/\n/g, '<br/>')}</div>
          </div>`
        })
      }
    })
    html += `</div>`
  }

  // --- Characters Section ---
  if (['full', 'characters'].includes(exportType) && characters && characters.length > 0) {
    html += `<div class="page"><h2>Character Profiles</h2>`
    characters.forEach(c => {
      const p = c.profileJSON || {}
      html += `
        <div class="character-card">
          <h3>${c.name} (${c.role})</h3>
          ${p.age ? `<p><strong>Age:</strong> ${p.age}</p>` : ''}
          ${p.motivation ? `<p><strong>Motivation:</strong> ${p.motivation}</p>` : ''}
          ${p.backstory ? `<p><strong>Backstory:</strong> ${p.backstory}</p>` : ''}
          ${p.character_arc ? `<p><strong>Arc:</strong> ${p.character_arc}</p>` : ''}
          ${p.personality_traits && p.personality_traits.length ? `<p><strong>Traits:</strong> ${p.personality_traits.join(', ')}</p>` : ''}
        </div>
      `
    })
    html += `</div>`
  }

  // --- Sound Design Section ---
  if (exportType === 'full' && sound && sound.length > 0) {
    html += `<div class="page"><h2>Sound Design Plan</h2>`
    sound.forEach(s => {
      html += `
        <div class="sound-card">
          <h3>Scene ${s.sceneNumber}</h3>
          <p><strong>Ambient:</strong> ${s.ambient || 'None'}</p>
          <p><strong>Music Mood:</strong> ${s.musicMood || 'None'} ${s.musicGenre ? `(${s.musicGenre})` : ''}</p>
          <p><strong>SFX:</strong> ${s.sfx && s.sfx.length ? s.sfx.join(', ') : 'None'}</p>
          ${s.notes ? `<p><strong>Notes:</strong> ${s.notes}</p>` : ''}
        </div>
      `
    })
    html += `</div>`
  }

  // --- Schedule Section ---
  if (['full', 'schedule'].includes(exportType) && schedule?.scheduleJSON?.shoot_days) {
    const sData = schedule.scheduleJSON
    html += `<div class="page"><h2>Production Schedule</h2>`
    html += `<p>Total Shoot Days: ${sData.total_shoot_days || 'Unknown'}</p>`

    html += `<table><thead><tr><th>Day</th><th>Location</th><th>Scenes</th><th>Hours</th><th>Notes</th></tr></thead><tbody>`
    sData.shoot_days.forEach(day => {
      html += `
        <tr>
          <td>Day ${day.day}</td>
          <td>${day.location || 'Unknown'}</td>
          <td>${day.scenes ? day.scenes.join(', ') : 'None'}</td>
          <td>${day.estimated_hours || '-'}</td>
          <td>${day.notes || '-'}</td>
        </tr>
      `
    })
    html += `</tbody></table></div>`
  }

  html += `</body></html>`
  return html
}

async function generatePDF(htmlString) {
  // Use --no-sandbox to play nicely with Railway/Docker/Linux deployments
  const browserArgs = process.env.PUPPETEER_ARGS
    ? process.env.PUPPETEER_ARGS.split(',')
    : ['--no-sandbox', '--disable-setuid-sandbox']

  const browser = await puppeteer.launch({
    headless: 'new',
    args: browserArgs
  })

  try {
    const page = await browser.newPage()
    await page.setContent(htmlString, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    })
    return pdfBuffer
  } finally {
    await browser.close()
  }
}

module.exports = { buildHTMLTemplate, generatePDF }
