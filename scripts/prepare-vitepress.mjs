import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourcePath = path.join(root, 'ArcheAge_NA_daily_guide_KB.md')
const docsDir = path.join(root, 'docs')
const guideDir = path.join(docsDir, 'guide')

if (!fs.existsSync(sourcePath)) {
  throw new Error('Missing ArcheAge_NA_daily_guide_KB.md. Please keep the generated Markdown file in repository root.')
}

fs.mkdirSync(guideDir, { recursive: true })

const raw = fs.readFileSync(sourcePath, 'utf8')
const body = raw.replace(/^---\n[\s\S]*?\n---\n\n/, '')

const headings = []
const headingRegex = /^##\s+(.+?)\s*(?:<a[^>]+><\/a>)?\s*$/gm
let match
while ((match = headingRegex.exec(body))) {
  const cleanTitle = match[1].replace(/\s*<a[^>]+><\/a>\s*/g, '').trim()
  headings.push({ title: cleanTitle, start: match.index })
}

function chunkFor(title) {
  const index = headings.findIndex((h) => h.title === title)
  if (index < 0) return ''
  const start = headings[index].start
  const end = index + 1 < headings.length ? headings[index + 1].start : body.length
  return body.slice(start, end).trim() + '\n'
}

function frontmatter(title, description = '上古世纪 NA 日活攻略知识库') {
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\noutline: deep\n---\n\n`
}

const overviewStart = body.search(/^## 0\. 知识库使用说明/m)
const textStart = body.search(/^## 3\. 正文知识库整理/m)
const overview = overviewStart >= 0 && textStart > overviewStart
  ? body.slice(overviewStart, textStart).trim() + '\n'
  : chunkFor('0. 知识库使用说明')

const pages = {
  'guide/overview.md': frontmatter('知识库使用说明', '检索方式、Topic Map、高频关键词索引') + overview,
  'guide/preface.md': frontmatter('前言', '原攻略前言与版本说明') + chunkFor('前言'),
  'guide/catalog.md': frontmatter('原始目录', 'PDF 原始目录') + chunkFor('目录'),
  'life.md': frontmatter('第一章 生活篇', '种地、跑商、钓鱼、采矿、债券、委托、妖精管家等') + chunkFor('第一章 生活篇'),
  'pve.md': frontmatter('第二章 PVE 篇', '副本、世界BOSS、日常活动、周常活动、神之庭院等') + chunkFor('第二章 PVE篇'),
  'grandmaster.md': frontmatter('第三章 宗师篇', '宗师防具、武器、饰品、披风、喂养与特化') + chunkFor('第三章 宗师篇'),
  'war.md': frontmatter('第四章 抗战篇', '对抗敌对势力、职业选择、活动组织与举报') + chunkFor('第四章 抗战篇'),
  'afterword.md': frontmatter('后记', '原攻略后记') + chunkFor('后记'),
  'full.md': frontmatter('完整 Markdown 原文', '完整知识库整理版') + body
}

for (const [relativePath, content] of Object.entries(pages)) {
  const filePath = path.join(docsDir, relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf8')
}

console.log(`Prepared ${Object.keys(pages).length} VitePress docs pages from ${path.basename(sourcePath)}.`)
