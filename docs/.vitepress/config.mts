import { defineConfig } from 'vitepress'
import { generatedSidebar } from './sidebar.generated.js'

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
    ['meta', { name: 'theme-color', content: '#07130f' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/sgsj/favicon.svg' }],
    ['link', { rel: 'shortcut icon', href: '/sgsj/favicon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/sgsj/favicon.svg' }]
  ],
  themeConfig: {
    logo: { src: '/sgsj/favicon.svg', width: 24, height: 24 },
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
