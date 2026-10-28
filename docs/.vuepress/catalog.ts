import type { NavbarOptions, SidebarOptions } from 'vuepress-theme-hope'

export const postSeries = [
  { text: 'Java', path: 'java' },
  { text: 'Tools', path: 'tools' },
  { text: 'Practice', path: 'practice' },
  { text: 'Embedded', path: 'embedded' },
  { text: 'Soft Exam', path: 'soft-exam' },
  { text: 'Ops', path: 'ops' },
] as const

const projectLinks = [
  { text: 'go-blog', path: 'go-blog' },
  { text: 'code-guide', path: 'code-guide' },
  { text: 'M3U8 Downloader', path: 'm3u8-downloader' },
  { text: 'SparkSandbox', path: 'spark-sandbox' },
  { text: 'Startpage', path: 'startpage' },
  { text: '玄鉴', path: 'xuanjian' },
  { text: 'ResumeFloat', path: 'resume-float' },
  { text: 'Voxel', path: 'voxel' },
  { text: 'ACOJ', path: 'acoj' },
] as const

const aboutLinks = [
  { text: '关于自己', link: '/about/me.html' },
  { text: '关于本站', link: '/about/site.html' },
] as const

export const navbar: NavbarOptions = [
  { text: '首页', link: '/', exact: true },
  {
    text: '笔记',
    prefix: '/posts/',
    children: postSeries.map(({ text, path }) => ({
      text,
      link: `/posts/${path}/`,
    })),
  },
  {
    text: '项目',
    prefix: '/projects/',
    children: projectLinks.map(({ text, path }) => ({
      text,
      link: `/projects/${path}.html`,
    })),
  },
  { text: '泡泡', link: '/bubble/' },
  {
    text: '关于',
    prefix: '/about',
    children: [...aboutLinks],
  },
]

export const sidebar: SidebarOptions = {
  ...Object.fromEntries(
    postSeries.map(({ text, path }) => [
      `/posts/${path}/`,
      [
        {
          text,
          collapsible: false,
          expanded: true,
          children: 'structure' as const,
        },
      ],
    ]),
  ),
  '/projects/': [
    {
      text: '项目',
      collapsible: false,
      expanded: true,
      children: 'structure',
    },
  ],
  '/about/': [
    {
      text: '关于',
      collapsible: false,
      expanded: true,
      children: 'structure',
    },
  ],
  '/bubble/': [
    {
      text: '泡泡',
      collapsible: false,
      expanded: true,
      children: 'structure',
    },
  ],
}
