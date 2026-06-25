import { defineConfig } from 'vitepress'
import { generatedSidebar } from './sidebar.generated'

export default defineConfig({
  title: '上古世纪 NA 攻略知识库',
  description: '上古世纪 NA 日活图文攻略在线知识库',
  lang: 'zh-CN',
  base: '/sgsj/',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  markdown: {
    image: {
      lazyLoading: true
    }
  },
  head: [
    ['meta', { name: 'theme-color', content: '#0f172a' }],
    ['link', { rel: 'icon', href: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%230f172a%22/%3E%3Ctext x=%2250%22 y=%2264%22 font-size=%2254%22 text-anchor=%22middle%22 fill=%22%23facc15%22%3E古%3C/text%3E%3C/svg%3E' }]
  ],
  themeConfig: {
    logo: { src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%230f172a%22/%3E%3Ctext x=%2250%22 y=%2264%22 font-size=%2254%22 text-anchor=%22middle%22 fill=%22%23facc15%22%3E古%3C/text%3E%3C/svg%3E', width: 24, height: 24 },
    nav: [
      { text: '首页', link: '/' },
      { text: '生活篇', link: '/life/' },
      { text: 'PVE', link: '/pve/' },
      { text: '宗师', link: '/grandmaster/' },
      { text: '抗战', link: '/war/' }
    ],
    sidebar: generatedSidebar,
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索攻略', buttonAriaLabel: '搜索攻略' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清空搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到结果',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },
    outline: { level: 'deep', label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdated: { text: '最后更新', formatOptions: { dateStyle: 'short', timeStyle: 'medium' } },
    editLink: {
      pattern: 'https://github.com/Psyduuuuuck/sgsj/edit/main/docs/:path',
      text: '在 GitHub 编辑本页'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Psyduuuuuck/sgsj' }
    ],
    footer: {
      message: '基于攻略整理，仅作玩家知识库检索使用。',
      copyright: '上古世纪 NA 日活攻略知识库'
    }
  }
})
