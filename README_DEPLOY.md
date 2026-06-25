# 上古世纪 NA 攻略知识库静态站

这是一个无需后端、无需数据库的纯静态知识库站点。

## 本地预览

```bash
cd archeage_kb_site
python3 -m http.server 8080
```

浏览器打开：`http://localhost:8080`

## 部署方式 1：GitHub Pages

1. 新建一个 GitHub 仓库。
2. 将本目录所有文件上传到仓库根目录。
3. 在仓库 `Settings > Pages` 中选择 `GitHub Actions`。
4. 推送后会自动执行 `.github/workflows/pages.yml`，部署完成后即可访问。

## 部署方式 2：Netlify / Cloudflare Pages / Vercel

直接拖拽本目录或上传 ZIP。构建命令留空，发布目录选择根目录 `/`。

## AI 知识库导入

- 使用 `rag/chunks.jsonl` 导入向量库或 RAG 系统。
- 使用 `ArcheAge_NA_daily_guide_KB.md` 作为完整上下文。
- 使用 `llms.txt` 让 AI Agent 快速了解站点结构。

## 文件结构

- `index.html`：知识库页面
- `kb-data.js`：前端搜索与阅读数据
- `assets/`：PDF 图片资源
- `rag/chunks.jsonl`：AI/RAG 分块
- `api/sections.json`：章节 JSON
- `api/section_catalog.csv`：章节索引
- `api/image_manifest.csv`：图片清单
