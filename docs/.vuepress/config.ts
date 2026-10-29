import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { hopeTheme } from 'vuepress-theme-hope'
import { navbarEn, navbarZh, sidebarEn, sidebarZh } from './catalog'

const rootDir = resolve(fileURLToPath(new URL('.', import.meta.url)), '../..')

/**
 * 把仓库根目录的 .env / .env.local 载入 process.env（不覆盖已有环境变量）。
 */
function loadEnvFiles() {
  // 1. 先快照已有环境变量（CI / shell），这些键全程不覆盖
  // 2. 再读 .env，最后读 .env.local（本地覆盖示例配置）
  // 3. 只解析 KEY=VALUE，忽略空行与 # 注释
  const preset = new Set(Object.keys(process.env))
  for (const name of ['.env', '.env.local']) {
    const file = resolve(rootDir, name)
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!preset.has(key)) process.env[key] = value
    }
  }
}

loadEnvFiles()

/** DocSearch 三项齐全时启用云端搜索，否则回退本地 slimsearch。 */
function resolveSearchPlugins() {
  // 1. 从环境变量读取；缺任一则不启用 DocSearch，避免半成品配置打进站点
  // 2. 未配置时保留 slimsearch，本地预览仍有搜索框
  const appId = process.env.DOCSEARCH_APP_ID?.trim()
  const apiKey = process.env.DOCSEARCH_API_KEY?.trim()
  const indexName = process.env.DOCSEARCH_INDEX_NAME?.trim()
  if (appId && apiKey && indexName) {
    return {
      docsearch: {
        appId,
        apiKey,
        indexName,
      },
    }
  }
  return {
    slimsearch: {
      indexContent: true,
      locales: {
        '/': {
          placeholder: '搜索',
        },
        '/en/': {
          placeholder: 'Search',
        },
      },
    },
  }
}

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
  locales: {
    '/': {
      lang: 'zh-CN',
      title: '摸鱼猫泡泡',
      description: '摸鱼猫泡泡：记录 Java、工具与工程实践。',
    },
    '/en/': {
      lang: 'en-US',
      title: 'Moyu Cat Bubble',
      description: 'Moyu Cat Bubble: notes on Java, tools, and engineering practice.',
    },
  },

  head: [
    ['meta', { name: 'keywords', content: '摸鱼猫泡泡,Charlie,技术文档,Java,Git,VuePress' }],
    ['meta', { name: 'author', content: 'Charlie' }],
    ['meta', { name: 'theme-color', content: '#e8913a' }],
    ['link', { rel: 'icon', href: '/img/logo.png', type: 'image/png' }],
    ['link', { rel: 'apple-touch-icon', href: '/img/logo.png' }],
  ],

  bundler: viteBundler({
    viteOptions: {
      plugins: [fixSlimsearchWorker()],
      worker: {
        format: 'es',
      },
      // elk / echarts 等图表分包本身 >1MB，属预期体积；提高阈值避免误报
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
    // 确保覆盖 VuePress 内部 build 合并后的最终阈值
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
    // 小屏导航同时显示站点名（默认有 logo 时会隐藏）
    hideSiteNameOnMobile: false,
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

    locales: {
      '/': {
        navbarTitle: '摸鱼猫泡泡',
        navbar: navbarZh,
        sidebar: sidebarZh,
        metaLocales: {
          toc: '本页目录',
        },
      },
      '/en/': {
        navbarTitle: 'Moyu Cat Bubble',
        navbar: navbarEn,
        sidebar: sidebarEn,
        metaLocales: {
          toc: 'On This Page',
        },
      },
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

      ...resolveSearchPlugins(),

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
