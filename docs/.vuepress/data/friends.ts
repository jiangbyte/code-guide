/** 友链数据：小伙伴 + 框架，展示于 /friends.html */

export type FriendLink = {
  name: string
  desc: string
  url: string
  /** 圆形头像 / 站点图标 */
  logo?: string
  /** 左上角「推荐」角标 */
  recommended?: boolean
}

/** 框架友链：偏 SiteInfo 卡片（预览底 + 居中 logo） */
export type FrameworkLink = {
  name: string
  url: string
  logo?: string
  /** 卡片上部预览图（可选） */
  preview?: string
}

/** 小伙伴（个人站 / 博主） */
export const friends: FriendLink[] = []

/** 框架与主题 */
export const frameworks: FrameworkLink[] = [
  {
    name: 'VuePress',
    url: 'https://vuepress.vuejs.org/zh/',
    logo: 'https://vuepress.vuejs.org/images/hero.png',
  },
  {
    name: 'vuepress-theme-hope',
    url: 'https://theme-hope.vuejs.press/zh/',
    // favicon 比外链 svg 更稳，避免破图；无 preview 时会用作模糊背景
    logo: 'https://theme-hope.vuejs.press/favicon.ico',
  },
]
