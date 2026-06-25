import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourcePath = path.join(root, 'ArcheAge_NA_daily_guide_KB.md')
const docsDir = path.join(root, 'docs')
const guideDir = path.join(docsDir, 'guide')
const vitepressDir = path.join(docsDir, '.vitepress')
const siteBaseUrl = 'https://psyduuuuuck.github.io/sgsj'

if (!fs.existsSync(sourcePath)) {
  throw new Error('Missing ArcheAge_NA_daily_guide_KB.md. Please keep the generated Markdown file in repository root.')
}

fs.mkdirSync(guideDir, { recursive: true })
fs.mkdirSync(vitepressDir, { recursive: true })

// 清理旧版按“大章节”生成的页面，避免 VitePress 继续构建旧页面。
for (const target of ['life.md', 'pve.md', 'grandmaster.md', 'war.md', 'afterword.md', 'full.md']) {
  const file = path.join(docsDir, target)
  if (fs.existsSync(file)) fs.rmSync(file, { force: true })
}
for (const target of ['life', 'pve', 'grandmaster', 'war']) {
  const dir = path.join(docsDir, target)
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
}

const raw = fs.readFileSync(sourcePath, 'utf8')
let body = raw.replace(/^---\n[\s\S]*?\n---\n\n/, '')

function normalizeAssetPath(url) {
  const clean = url.trim().replace(/^\.\//, '')
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean
  if (clean.startsWith('/sgsj/assets/')) return `https://psyduuuuuck.github.io${clean}`
  if (clean.startsWith('assets/')) return `${siteBaseUrl}/${clean}`
  return clean
}

function escapeAttr(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function cleanImageLabel(label) {
  return label
    .replace(/^PDF\s*p\.\d+(?:\s*[–-]\s*p?\.\d+)?\s*/i, '')
    .replace(/^图\d+\s*[:：]\s*/, '图示：')
    .replace(/PDF\s*p\.\d+(?:\s*[–-]\s*p?\.\d+)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim() || '图示'
}

function imageFigure(label, url) {
  const src = normalizeAssetPath(url)
  const alt = cleanImageLabel(label)
  return `<figure class="image-flow"><img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" /></figure>`
}

function cleanContent(markdown) {
  const lines = markdown.split(/\r?\n/)
  const out = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    const trimmed = line.trim()

    if (trimmed.startsWith('<!-- section_id:')) continue

    if (/^>\s*\*\*(PDF页码|关键词|摘要)\*\*/.test(trimmed)) {
      continue
    }

    if (trimmed === '**整理正文**') continue

    if (trimmed === '**相关图像资源**') {
      const images = []
      let j = i + 1
      while (j < lines.length) {
        const next = lines[j].trim()
        if (!next) { j++; continue }
        const match = next.match(/^-\s*\[([^\]]+)\]\(([^)]+)\)/)
        if (!match) break
        images.push({ label: match[1], url: match[2] })
        j++
      }
      if (images.length) {
        out.push('')
        for (const image of images) {
          out.push(imageFigure(image.label, image.url), '')
        }
      }
      i = j - 1
      continue
    }

    line = line
      .replace(/!\[([^\]]*)\]\((\.\/assets\/[^)]+|assets\/[^)]+|\/sgsj\/assets\/[^)]+)\)/g, (_all, label, url) => imageFigure(label, url))
      .replace(/!\[([^\]]*)\]\(\.\/assets\//g, `![$1](${siteBaseUrl}/assets/`)
      .replace(/!\[([^\]]*)\]\(assets\//g, `![$1](${siteBaseUrl}/assets/`)
      .replace(/src=["']\.\/assets\//g, `src="${siteBaseUrl}/assets/`)
      .replace(/src=["']assets\//g, `src="${siteBaseUrl}/assets/`)
      .replace(/src=["']\/sgsj\/assets\//g, `src="${siteBaseUrl}/assets/`)
      .replace(/（PDF\s*p\.[^)]+）/gi, '')
      .replace(/（p\.\d+(?:\s*[–-]\s*p?\.\d+)?\s*起?）/gi, '')
      .replace(/\s+p\.\d+(?:\s*[–-]\s*p?\.\d+)?\s*$/gi, '')
      .replace(/`PDF页码`、?/g, '')
      .replace(/PDF页码/g, '')
      .replace(/原\s*PDF/g, '原攻略')

    out.push(line)
  }

  return out.join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim() + '\n'
}

body = cleanContent(body)

const headingRegex = /^(#{2,5})\s+(.+?)\s*$/gm
const sections = []
let match
while ((match = headingRegex.exec(body))) {
  const rawTitle = match[2].trim()
  const title = rawTitle.replace(/\s*<a[^>]+><\/a>\s*/g, '').trim()
  const anchorMatch = rawTitle.match(/<a\s+id=["']([^"']+)["']><\/a>/)
  sections.push({
    level: match[1].length,
    title,
    rawTitle,
    anchor: anchorMatch?.[1] || '',
    start: match.index
  })
}
for (let i = 0; i < sections.length; i++) {
  sections[i].end = i + 1 < sections.length ? sections[i + 1].start : body.length
}

function sectionByTitle(title) {
  return sections.find((section) => section.title === title)
}

function sectionContent(section) {
  if (!section) return ''
  return body.slice(section.start, section.end).trim() + '\n'
}

function contentRange(startSection, stopLevel) {
  if (!startSection) return ''
  const startIndex = sections.indexOf(startSection)
  let end = body.length
  for (let i = startIndex + 1; i < sections.length; i++) {
    if (sections[i].level <= stopLevel) {
      end = sections[i].start
      break
    }
  }
  return body.slice(startSection.start, end).trim() + '\n'
}

function shiftHeadings(markdown, rootLevel) {
  return markdown.replace(/^(#{2,6})\s+/gm, (_, hashes) => {
    const nextLevel = Math.max(1, hashes.length - rootLevel + 1)
    return `${'#'.repeat(nextLevel)} `
  })
}

function frontmatter(title, description = '上古世纪 NA 日活攻略知识库') {
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\noutline: deep\n---\n\n`
}

function writeDoc(relativePath, content) {
  const filePath = path.join(docsDir, relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8')
}

function sectionNumber(title) {
  return title.match(/^(\d+(?:\.\d+)*)/)?.[1] || ''
}

function fileSlug(title) {
  const number = sectionNumber(title)
  if (number) return number.replace(/\./g, '-')
  return title.replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase()
}

function cleanTextForCard(markdown) {
  return markdown
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}

function descendantsOf(section, maxLevel = 4) {
  const startIndex = sections.indexOf(section)
  const result = []
  for (let i = startIndex + 1; i < sections.length; i++) {
    if (sections[i].level <= section.level) break
    if (sections[i].level <= maxLevel) result.push(sections[i])
  }
  return result
}

const overviewStart = body.search(/^## 0\. 知识库使用说明/m)
const textStart = body.search(/^## 3\. 正文知识库整理/m)
const overview = overviewStart >= 0 && textStart > overviewStart
  ? body.slice(overviewStart, textStart).trim() + '\n'
  : sectionContent(sectionByTitle('0. 知识库使用说明'))

// 这些页面仍然生成，但不进入左侧菜单，避免干扰攻略阅读。
writeDoc('guide/overview.md', frontmatter('知识库使用说明', '检索方式、Topic Map、高频关键词索引') + shiftHeadings(overview, 2))
writeDoc('guide/preface.md', frontmatter('前言', '原攻略前言与版本说明') + shiftHeadings(sectionContent(sectionByTitle('前言')), 2))
writeDoc('guide/catalog.md', frontmatter('原始目录', '攻略原始目录') + shiftHeadings(sectionContent(sectionByTitle('目录')), 2))

const groups = [
  { key: 'life', title: '第一章 生活篇', prefix: '1.', desc: '种地、跑商、钓鱼、采矿、债券、委托、妖精管家等。' },
  { key: 'pve', title: '第二章 PVE篇', prefix: '2.', desc: '副本、世界BOSS、日常活动、周常活动、神之庭院等。' },
  { key: 'grandmaster', title: '第三章 宗师篇', prefix: '3.', desc: '宗师防具、武器、饰品、披风、喂养与特化。' },
  { key: 'war', title: '第四章 抗战篇', prefix: '4.', desc: '势力对抗、职业选择、对抗活动组织与举报。' }
]

// 左侧菜单只保留攻略正文，并把原来的章节层级整体上升一级。
const sidebar = []

for (const group of groups) {
  const children = sections.filter((section) => section.level === 3 && section.title.startsWith(group.prefix))
  const cards = children.map((section) => {
    const slug = fileSlug(section.title)
    const summary = cleanTextForCard(contentRange(section, 3))
    return `- [${section.title}](/${group.key}/${slug})${summary ? `：${summary}` : ''}`
  }).join('\n')

  writeDoc(`${group.key}/index.md`, frontmatter(group.title, group.desc) + `# ${group.title}\n\n${group.desc}\n\n## 本章目录\n\n${cards}\n`)

  const groupItems = []
  for (const section of children) {
    const slug = fileSlug(section.title)
    const content = shiftHeadings(contentRange(section, 3), section.level)
    writeDoc(`${group.key}/${slug}.md`, frontmatter(section.title, cleanTextForCard(content)) + content)

    const subItems = descendantsOf(section, 4)
      .filter((item) => item.anchor)
      .map((item) => ({ text: item.title, link: `/${group.key}/${slug}#${item.anchor}` }))

    groupItems.push(subItems.length
      ? { text: section.title, link: `/${group.key}/${slug}`, collapsed: true, items: subItems }
      : { text: section.title, link: `/${group.key}/${slug}` })
  }

  sidebar.push({ text: group.title, link: `/${group.key}/`, collapsed: false, items: groupItems })
}

const afterword = sectionByTitle('后记')
writeDoc('afterword.md', frontmatter('后记', '原攻略后记') + shiftHeadings(sectionContent(afterword), afterword?.level || 2))
writeDoc('full.md', frontmatter('完整 Markdown 原文', '完整知识库整理版') + body)
sidebar.push({ text: '后记', link: '/afterword' })

fs.writeFileSync(
  path.join(vitepressDir, 'sidebar.generated.js'),
  `export const generatedSidebar = ${JSON.stringify(sidebar, null, 2)}\n`,
  'utf8'
)

console.log(`Prepared VitePress docs with promoted guide sidebar: ${groups.map((g) => g.key).join(', ')}.`)
