import type { NavbarOptions, SidebarOptions } from 'vuepress-theme-hope'

export const postSeries = [
  { text: 'Java', path: 'java' },
  { text: 'Git', path: 'git' },
  { text: 'Demo', path: 'demo' },
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
    link: '/projects.html',
    activeMatch: '^/projects',
  },
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
  '/about/': [
    {
      text: '关于',
      collapsible: false,
      expanded: true,
      children: 'structure',
    },
  ],
  '/projects': ['/projects'],
}
