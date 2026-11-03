/** 友链数据：小伙伴 + 框架 + 本站信息，展示于 /friends.html */

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

/** 本站信息：供对方互换友链时复制 */
export type SelfSiteInfo = {
  name: string
  desc: string
  url: string
  /** Logo 绝对地址，方便对方直接粘贴 */
  logo: string
}

/** 小伙伴（个人站 / 博主） */
export const friends: FriendLink[] = [
  {
    name: '年华',
    desc: '分享生活和技术。',
    url: 'https://blog.amamo.top',
    logo: 'https://q1.qlogo.cn/g?b=qq&nk=1323860289&s=640',
  },
  {
    name: "UpXuu's blog",
    desc: '逐光而上',
    url: 'https://upxuu.com',
    logo: 'https://upxuu.com/images/me.jpg',
  },
]

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

/** 本站可复制字段（与 config 站点元信息保持一致） */
export const selfSite: SelfSiteInfo = {
  name: '摸鱼猫泡泡',
  desc: '记录开发、工具与工程实践。',
  url: 'https://jiangbyte.cn',
  logo: 'https://jiangbyte.cn/img/logo.png',
}
