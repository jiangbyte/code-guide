/** 站点里程碑：供「站点时间线」纵向展示，按日期升序。 */

export type SiteEvent = {
  date: string
  title: string
  description: string
}

export const siteEvents: SiteEvent[] = [
  {
    date: '2026-10-28',
    title: '站点起步',
    description: '摸鱼猫泡泡仓库初始化：VuePress + Theme Hope，双许可落地。',
  },
  {
    date: '2026-10-28',
    title: '文档骨架成型',
    description: '笔记系列、项目介绍、导航与检索等基础结构搭好。',
  },
  {
    date: '2026-10-29',
    title: '泡泡人设上线',
    description: '新增泡泡栏目与三视图。',
  },
]
