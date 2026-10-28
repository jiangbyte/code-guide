import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { hopeTheme } from 'vuepress-theme-hope'
import { navbar, sidebar } from './catalog'

function fixSlimsearchWorker() {
  return {
    name: 'fix-slimsearch-worker',
    transform(code: string, id: string) {
      if (!id.includes('plugin-slimsearch') || !code.includes('worker/dev.js')) {
        return null
      }
      return code.replace(
        'new URL(`worker/dev.js`,import.meta.url)',
        'new URL("../worker/dev.js", import.meta.url)',
      )
    },
  }
}

export default defineUserConfig({
  lang: 'zh-CN',
  title: '摸鱼猫泡泡',
  description: '摸鱼猫泡泡：记录 Java、工具与工程实践。',

  head: [
    ['meta', { name: 'keywords', content: '摸鱼猫泡泡,Charlie,技术文档,Java,Git,VuePress' }],
    ['meta', { name: 'author', content: 'Charlie' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['link', { rel: 'icon', href: '/img/logo.png' }],
  ],

  bundler: viteBundler({
    viteOptions: {
      plugins: [fixSlimsearchWorker()],
      worker: {
        format: 'es',
      },
      optimizeDeps: {
        include: [
          'mermaid',
          'dayjs',
          'dayjs/plugin/advancedFormat.js',
          'dayjs/plugin/customParseFormat.js',
          'dayjs/plugin/isoWeek.js',
          'chart.js',
          'echarts',
          'flowchart.ts',
          'markmap-lib',
          'markmap-view',
          'markmap-toolbar',
        ],
      },
    },
  }),

  theme: hopeTheme({
    hostname: 'https://jiangbyte.cn',
    author: 'Charlie',
    repo: 'jiangbyte/code-guide',
    docsDir: 'docs',
    hotReload: true,

    toc: {
      levels: [2, 3],
    },

    sidebarSorter: ['readme', 'order', 'date', 'title', 'filename'],

    pageInfo: ['Author', 'Date', 'Category', 'Tag', 'ReadingTime', 'Word'],
    lastUpdated: true,
    contributors: true,
    editLink: true,

    navbarLayout: {
      start: ['Brand', 'Links'],
      center: [],
      end: ['Language', 'Repo', 'Outlook', 'Search'],
    },

    navbar,
    sidebar,

    metaLocales: {
      toc: '本页目录',
    },

    displayFooter: true,
    footer:
      '<span class="jb-footer-chunk">' +
      '<a class="jb-footer-link" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">黔ICP备2026018565号-1</a>' +
      '</span>' +
      '<span class="jb-footer-sep" aria-hidden="true">|</span>' +
      '<span class="jb-footer-chunk">' +
      '<a class="jb-footer-link jb-footer-link--police" href="https://beian.mps.gov.cn/#/query/webSearch?code=52260102556648" target="_blank" rel="noopener noreferrer">' +
      '<img class="jb-beian-icon" src="/img/beian.png" alt="" width="14" height="14" />' +
      '贵公网安备52260102556648号</a>' +
      '</span>' +
      '<span class="jb-footer-sep" aria-hidden="true">|</span>' +
      '<span class="jb-footer-chunk">Copyright © 2026 Charlie. All rights reserved.</span>',
    copyright: false,

    markdown: {
      gfm: true,
      breaks: true,
      linkify: true,
      component: true,
      vPre: true,
      linksCheck: true,

      footnote: true,
      tasklist: true,
      include: true,
      fields: true,
      tabs: true,
      alert: true,
      hint: true,
      revealjs: true,

      figure: true,
      imgLazyload: true,
      imgMark: true,
      imgSize: true,
      obsidianImgSize: true,

      align: true,
      attrs: true,
      layout: true,
      mark: true,
      spoiler: true,
      steps: true,
      sub: true,
      sup: true,

      codeTabs: true,
      fileTree: true,
      codeTree: true,
      preview: true,
      demo: true,
      playground: {
        presets: ['ts', 'vue', 'unocss'],
      },
      vuePlayground: false,
      sandpack: false,
      kotlinPlayground: false,

      mermaid: true,
      chartjs: true,
      echarts: true,
      flowchart: true,
      markmap: true,
      plantuml: true,

      math: {
        type: 'katex',
        delimiters: 'all',
      },
    },

    plugins: {
      blog: false,
      comment: false,
      git: true,

      icon: {
        offline: true,
      },

      slimsearch: {
        indexContent: true,
        locales: {
          '/': {
            placeholder: '搜索',
          },
        },
      },

      components: {
        components: [
          'Badge',
          'VPCard',
          'SiteInfo',
          'VPBanner',
          'Share',
          'CodePen',
          'StackBlitz',
        ],
      },
      media: {
        embeds: ['bilibili', 'youtube'],
      },
      photoSwipe: true,
      readingTime: true,
      copyright: {
        global: false,
        author: 'Charlie',
        license: 'MIT',
      },
      feed: {
        atom: true,
        json: true,
        rss: true,
      },

      seo: {
        fallBackImage: '/img/logo.png',
        autoDescription: true,
        canonical: 'https://jiangbyte.cn',
        author: 'Charlie',
        isArticle: (page) => {
          const p = page.filePathRelative
          if (!p) return false
          if (p.startsWith('posts/') && p !== 'posts/README.md') return true
          if (p.startsWith('projects/') && p !== 'projects/README.md') return true
          return false
        },
        customHead: (head, page) => {
          const fm = page.frontmatter as {
            tag?: string | string[]
            category?: string | string[]
            keywords?: string
          }
          const tags = [fm.tag, fm.category]
            .flat()
            .filter((v): v is string => typeof v === 'string' && v.length > 0)
          const keywords =
            fm.keywords ||
            (tags.length ? [...new Set(tags)].join(',') : undefined)
          if (keywords) {
            head.push(['meta', { name: 'keywords', content: keywords }])
          }
        },
      },

      sitemap: {
        changefreq: 'weekly',
      },
    },
  }),
})
