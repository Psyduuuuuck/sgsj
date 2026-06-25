import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const root = process.cwd()
const docsDir = path.join(root, 'docs')
const apiDir = path.join(root, 'api')
const siteBaseUrl = 'https://psyduuuuuck.github.io/sgsj'

function loadMap() {
  let b64 = ''
  for (let i = 0; i < 100; i++) {
    const name = `image_anchor_map.part${String(i).padStart(2, '0')}.b64`
    const file = path.join(apiDir, name)
    if (!fs.existsSync(file)) break
    b64 += fs.readFileSync(file, 'utf8').trim()
  }
  if (!b64) return {}
  const json = zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8')
  return JSON.parse(json).g || {}
}

function sectionDoc(sectionTitle) {
  const match = String(sectionTitle || '').match(/^(\d+)\.(\d+)/)
  if (!match) return null
  const chapter = match[1]
  const section = match[2]
  const dir = { '1': 'life', '2': 'pve', '3': 'grandmaster', '4': 'war' }[chapter]
  if (!dir) return null
  return path.join(docsDir, dir, `${chapter}-${section}.md`)
}

function normalizeText(text) {
  return String(text || '')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/[\s`*_#>\-—–、，。,.：:；;（）()\[\]【】「」『』“”"'·/\\|]+/g, '')
    .toLowerCase()
}

function escapeAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function figureHtml(file, anchor) {
  const src = `${siteBaseUrl}/${String(file || '').replace(/^\.\//, '')}`
  return `<figure class="image-flow" data-pdf-anchor="${escapeAttr(anchor)}"><img src="${escapeAttr(src)}" alt="图示" loading="lazy" /></figure>`
}

function removeImageFigures(markdown) {
  return markdown.replace(/\n*<figure class="image-flow"[\s\S]*?<\/figure>\n*/g, '\n')
}

function sameAnchor(line, anchor) {
  const a = normalizeText(anchor)
  const b = normalizeText(line)
  if (!a || !b) return false
  if (a.length <= 4 || b.length <= 4) return false
  return b.includes(a) || a.includes(b)
}

function applyPlacements(markdown, placements) {
  let text = removeImageFigures(markdown)
  const lines = text.split(/\r?\n/)
  const remaining = placements.map((item) => ({ anchor: item[0] || '', file: item[1] || '', used: false }))
  const out = []

  for (const line of lines) {
    out.push(line)
    const matches = remaining.filter((item) => !item.used && sameAnchor(line, item.anchor))
    for (const item of matches) {
      out.push('', figureHtml(item.file, item.anchor), '')
      item.used = true
    }
  }

  const missed = remaining.filter((item) => !item.used)
  if (missed.length) {
    out.push('', '<!-- 未精确命中的图片，保留在本页末尾 -->', '')
    for (const item of missed) out.push(figureHtml(item.file, item.anchor), '')
  }

  return out.join('\n').replace(/\n{4,}/g, '\n\n\n').trim() + '\n'
}

const placementMap = loadMap()
const byDoc = new Map()
for (const [sectionId, placements] of Object.entries(placementMap)) {
  for (const item of placements) {
    const sectionTitle = item[2] || sectionId
    const file = sectionDoc(sectionTitle)
    if (!file || !fs.existsSync(file)) continue
    if (!byDoc.has(file)) byDoc.set(file, [])
    byDoc.get(file).push(item)
  }
}

let changed = 0
let total = 0
for (const [file, placements] of byDoc.entries()) {
  total += placements.length
  const before = fs.readFileSync(file, 'utf8')
  const after = applyPlacements(before, placements)
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8')
    changed++
  }
}

console.log(`Applied PDF image anchors: ${total} images across ${changed} docs.`)
