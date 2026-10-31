import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { hopeTheme } from 'vuepress-theme-hope'
import { navbar, sidebar } from './catalog'
import { isSiteArticle } from './articleFilter'
import { articleTimelinePlugin } from './plugins/articleTimeline'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '摸鱼猫泡泡',
  description: '摸鱼猫泡泡：记录 Java、工具与工程实践。',

  plugins: [articleTimelinePlugin()],

  head: [
    ['meta', { name: 'keywords', content: '摸鱼猫泡泡,Charlie,技术文档,Java,Git,VuePress' }],
    ['meta', { name: 'author', content: 'Charlie' }],
    ['meta', { name: 'theme-color', content: '#e8913a' }],
    ['link', { rel: 'icon', href: '/img/logo.png', type: 'image/png' }],
    ['link', { rel: 'apple-touch-icon', href: '/img/logo.png' }],
  ],

  bundler: viteBundler({
    viteOptions: {
      // elk / echarts 等图表分包本身 >1MB，属预期体积；提高警告避免误报
      build: {
        chunkSizeWarningLimit: 1600,
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
    // 确保覆盖 VuePress 内部 build 合并后的最终警告
    configureVite: (config) => {
      config.build ??= {}
      config.build.chunkSizeWarningLimit = 1600
      return config
    },
  }),

  theme: hopeTheme({
    hostname: 'https://jiangbyte.cn',
    author: 'Charlie',
    repo: 'jiangbyte/code-guide',
    docsDir: 'docs',
    logo: '/img/logo.png',
    logoDark: '/img/logo.png',
    favicon: '/img/logo.png',
    // 小屏导航只留 logo，不显示站点名
    hideSiteNameOnMobile: true,
    hotReload: true,

    toc: {
      levels: [2, 3],
    },

    sidebarSorter: ['readme', 'order', 'date', 'title', 'filename'],

    pageInfo: ['Author', 'Date', 'Category', 'Tag', 'ReadingTime', 'Word'],
    lastUpdated: true,
    contributors: true,
    editLink: true,

    // 固定浅色，不提供深色 / 自动切换
    darkmode: 'disable',

    navbarLayout: {
      start: ['Brand', 'Links'],
      center: [],
      end: ['Repo', 'Search'],
    },

    navbarTitle: '摸鱼猫泡泡',
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
      // GitHub 风格代码高亮；conf 映射到 ini
      highlighter: {
        type: 'shiki',
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
        langAlias: {
          conf: 'ini',
        },
      },

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
        // 离线打包 Iconify；frontmatter 使用带集合前缀的图标名
        assets: 'iconify',
        prefix: 'mdi:',
        offline: true,
      },

      // 本地标题/大纲搜索：导航栏胶囊输入框 + 下拉标题与 > 小节
      search: {
        maxSuggestions: 10,
        hotKeys: ['s', '/'],
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
      // 复制正文达到一定长度时附加出处（可用 frontmatter copy: false 单页关闭）
      copyright: {
        global: true,
        author: 'Charlie',
        license: 'CC BY-NC 4.0',
        canonical: 'https://jiangbyte.cn',
        triggerLength: 100,
      },

      // 全站公告；showOnce + key，改文案时换 key 才会再弹一次
      notice: [
        {
          path: '/',
          title: '欢迎来到摸鱼猫泡泡',
          content:
            '本站记录技术笔记与项目说明。内容可引用改编，须署名并附来源，禁止商用（CC BY-NC 4.0）。',
          showOnce: true,
          key: 'welcome-2026-10-v2',
          actions: [
            {
              text: '关于本站',
              link: '/about/site.html',
              type: 'primary',
            },
            { text: '知道了' },
          ],
        },
      ],

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
        isArticle: (page) => isSiteArticle(page.filePathRelative),
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
