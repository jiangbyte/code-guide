import type { App, Plugin } from 'vuepress/core'
import { isSiteArticle } from '../articleFilter'

export type TimelineItem = {
  title: string
  path: string
  date: string
  category?: string
  section: string
}

/**
 * 从相对路径取一级栏目名，供时间线分组展示。
 */
function sectionOf(filePathRelative: string): string {
  const top = filePathRelative.split('/')[0] || ''
  const map: Record<string, string> = {
    posts: '笔记',
    projects: '项目',
    'source-reading': '源码阅读',
    kaoyan: '考研',
    'soft-exam': '软考',
    database: '数据库',
    career: '职场与面试',
  }
  return map[top] || top
}

/** 本地日历日 YYYY-MM-DD，避免 UTC 切日偏差。 */
function toLocalYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDate(raw: unknown, fallbackMs?: number): string {
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw.trim())) {
    return raw.trim().slice(0, 10)
  }
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return toLocalYmd(raw)
  }
  if (typeof raw === 'string' && raw.trim()) {
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) return toLocalYmd(d)
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return toLocalYmd(new Date(raw))
  }
  if (fallbackMs && Number.isFinite(fallbackMs)) {
    return toLocalYmd(new Date(fallbackMs))
  }
  return '1970-01-01'
}

/**
 * 构建期收集全站文章，写入 @temp 供客户端时间线页使用。
 */
export function articleTimelinePlugin(): Plugin {
  return {
    name: 'jb-article-timeline',
    async onPrepared(app: App) {
      // 1. 过滤出站点文章页
      // 2. 抽出标题、路径、日期、分类、栏目
      // 3. 按日期倒序写入临时模块
      const items: TimelineItem[] = app.pages
        .filter((page) => isSiteArticle(page.filePathRelative))
        .map((page) => {
          const fm = page.frontmatter as {
            date?: string | Date | number
            category?: string | string[]
            title?: string
          }
          const gitCreated = (page.data as { git?: { createdTime?: number } }).git
            ?.createdTime
          const category = Array.isArray(fm.category)
            ? fm.category[0]
            : typeof fm.category === 'string'
              ? fm.category
              : undefined
          return {
            title: page.title || fm.title || page.path,
            path: page.path,
            date: formatDate(fm.date, gitCreated),
            category,
            section: sectionOf(page.filePathRelative || ''),
          }
        })
        .sort((a, b) => {
          if (a.date === b.date) return a.title.localeCompare(b.title, 'zh-CN')
          return a.date < b.date ? 1 : -1
        })

      await app.writeTemp(
        'jb-article-timeline.js',
        `export const timelineArticles = ${JSON.stringify(items, null, 2)}\n`,
      )
    },
  }
}
