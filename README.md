# 上古世纪 NA 攻略知识库

这是一个基于《上古世纪 胎教级日活图文攻略》整理的 VitePress 在线知识库，面向玩家查询、攻略检索和 AI/RAG 阅读。

## 在线地址

https://psyduuuuuck.github.io/sgsj/

## 技术方案

- VitePress 文档站
- GitHub Pages 自动部署
- 本地全文搜索
- Markdown 章节化阅读
- 保留 AI/RAG 数据文件

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 主要目录

- `docs/`：VitePress 文档源码
- `docs/.vitepress/config.mts`：站点配置
- `scripts/prepare-vitepress.mjs`：从完整 Markdown 自动拆分 VitePress 页面
- `assets/`：原 PDF 图片资源，构建时复制到线上站点
- `rag/chunks.jsonl`：AI/RAG 分块数据
- `api/section_catalog.csv`：章节索引
- `api/image_manifest.csv`：图片清单
