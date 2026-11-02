import type { NavbarOptions, SidebarOptions } from 'vuepress-theme-hope'

export const postSeries = [
  { text: '工具', path: 'tools' },
  { text: '实践', path: 'practice' },
  { text: '嵌入式', path: 'embedded' },
  { text: '运维', path: 'ops' },
  { text: 'LeetCode', path: 'leetcode' },
] as const

/** 源码 · 子系列 */
export const sourceReadingSeries = [
  { text: 'Java', path: 'java' },
] as const

/** 考研 · 专业课 / 公共课 */
export const kaoyanSubjectSeries = [
  { text: '计算机原理', path: 'computer-organization' },
  { text: '计算机网络', path: 'computer-network' },
  { text: '数据结构', path: 'data-structure' },
  { text: '操作系统', path: 'operating-system' },
  { text: '高数', path: 'advanced-math' },
  { text: '英语', path: 'english' },
] as const

/** 考研 · 日常记录 */
export const kaoyanJournalSeries = [
  { text: '考研记录', path: 'journal' },
] as const

/** 考研全部子目录（侧栏注册用） */
export const kaoyanSeries = [...kaoyanSubjectSeries, ...kaoyanJournalSeries] as const

/** 软考 · 科目 */
export const softExamSeries = [
  { text: '高级架构设计师', path: 'advanced-architect' },
] as const

/** 数据库 · 引擎 */
export const databaseSeries = [
  { text: 'MySQL', path: 'mysql' },
  { text: 'Redis', path: 'redis' },
] as const

/** 职场 · 子栏目 */
export const careerSeries = [
  { text: '职场工作记录', path: 'workplace' },
  { text: '面试经验', path: 'interview' },
] as const

/** 项目 · 子栏目（导航进目录，侧栏出文章，同笔记） */
export const projectSeries = [
  { text: '开源项目', path: 'open-source' },
  { text: '个人项目', path: 'personal' },
] as const

function structureSidebar(text: string) {
  return [
    {
      text,
      collapsible: false,
      expanded: true,
      children: 'structure' as const,
    },
  ]
}

/** 顶部导航 */
export const navbar: NavbarOptions = [
  { text: '首页', link: '/', exact: true },
  {
    text: '博客',
    children: [
      { text: '文章', link: '/article/' },
      { text: '分类', link: '/category/' },
      { text: '标签', link: '/tag/' },
      { text: '文章时间线', link: '/blog-timeline/' },
      { text: '站点时间线', link: '/site-timeline.html' },
    ],
  },
  {
    text: '笔记',
    prefix: '/posts/',
    children: postSeries.map(({ text, path }) => ({
      text,
      link: `/posts/${path}/`,
    })),
  },
  {
    text: '源码',
    prefix: '/source-reading/',
    children: sourceReadingSeries.map(({ text, path }) => ({
      text,
      link: `/source-reading/${path}/`,
    })),
  },
  {
    text: '数据库',
    prefix: '/database/',
    children: databaseSeries.map(({ text, path }) => ({
      text,
      link: `/database/${path}/`,
    })),
  },
  {
    text: '考研',
    prefix: '/kaoyan/',
    children: [
      {
        text: '科目',
        children: kaoyanSubjectSeries.map(({ text, path }) => ({
          text,
          link: `/kaoyan/${path}/`,
        })),
      },
      {
        text: '记录',
        children: kaoyanJournalSeries.map(({ text, path }) => ({
          text,
          link: `/kaoyan/${path}/`,
        })),
      },
    ],
  },
  {
    text: '软考',
    prefix: '/soft-exam/',
    children: softExamSeries.map(({ text, path }) => ({
      text,
      link: `/soft-exam/${path}/`,
    })),
  },
  {
    text: '职场',
    prefix: '/career/',
    children: careerSeries.map(({ text, path }) => ({
      text,
      link: `/career/${path}/`,
    })),
  },
  {
    text: '项目',
    prefix: '/projects/',
    children: projectSeries.map(({ text, path }) => ({
      text,
      link: `/projects/${path}/`,
    })),
  },
  { text: '泡泡', link: '/bubble/' },
  { text: '友链', link: '/friends.html' },
  {
    text: '关于',
    prefix: '/about',
    children: [
      { text: '关于我', link: '/about/me.html' },
      { text: '关于本站', link: '/about/site.html' },
    ],
  },
]

/** 侧栏 */
export const sidebar: SidebarOptions = {
  ...Object.fromEntries(
    postSeries.map(({ text, path }) => [`/posts/${path}/`, structureSidebar(text)]),
  ),
  ...Object.fromEntries(
    sourceReadingSeries.map(({ text, path }) => [
      `/source-reading/${path}/`,
      structureSidebar(text),
    ]),
  ),
  '/source-reading/': structureSidebar('源码'),
  ...Object.fromEntries(
    databaseSeries.map(({ text, path }) => [`/database/${path}/`, structureSidebar(text)]),
  ),
  '/database/': structureSidebar('数据库'),
  ...Object.fromEntries(
    kaoyanSeries.map(({ text, path }) => [`/kaoyan/${path}/`, structureSidebar(text)]),
  ),
  '/kaoyan/': structureSidebar('考研'),
  ...Object.fromEntries(
    softExamSeries.map(({ text, path }) => [`/soft-exam/${path}/`, structureSidebar(text)]),
  ),
  '/soft-exam/': structureSidebar('软考'),
  ...Object.fromEntries(
    careerSeries.map(({ text, path }) => [`/career/${path}/`, structureSidebar(text)]),
  ),
  '/career/': structureSidebar('职场'),
  ...Object.fromEntries(
    projectSeries.map(({ text, path }) => [`/projects/${path}/`, structureSidebar(text)]),
  ),
  '/projects/': structureSidebar('项目'),
  '/about/': structureSidebar('关于'),
  '/bubble/': structureSidebar('泡泡'),
}
