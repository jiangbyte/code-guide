import { defineClientConfig } from 'vuepress/client'
import Bilibili from './components/Bilibili.vue'
import FloatingRail from './components/FloatingRail.vue'
import FriendsList from './components/FriendsList.vue'
import SiteTimeline from './components/SiteTimeline.vue'

/** 本页目录底边与页脚顶边的间隙 */
const TOC_FOOTER_GAP = 8
/** 与主题 hope-config.$pc 对齐，仅桌面侧栏目录需要夹紧 */
const TOC_CLAMP_MIN_WIDTH = 1440

let tocClampBound = false

/**
 * 按页脚顶边夹紧 .vp-toc-wrapper，避免目录伸进脚部；不改 #toc overflow，避免双滚动条。
 */
function clampTocAboveFooter(): void {
  // 1. 仅宽屏本页目录需要处理；窄屏目录在正文流内
  const toc = document.querySelector('#toc')
  const wrapper = document.querySelector('#toc .vp-toc-wrapper')
  const footer = document.querySelector('.vp-footer-wrapper')
  if (
    !(toc instanceof HTMLElement) ||
    !(wrapper instanceof HTMLElement) ||
    !(footer instanceof HTMLElement)
  ) {
    return
  }

  if (window.innerWidth < TOC_CLAMP_MIN_WIDTH) {
    toc.style.maxHeight = ''
    wrapper.style.maxHeight = ''
    return
  }

  // 2. 整块目录可用高度（含标题），再扣掉 header 得到列表区高度
  const tocTop = toc.getBoundingClientRect().top
  const footerTop = footer.getBoundingClientRect().top
  const tocBudget =
    Math.min(window.innerHeight, footerTop) - tocTop - TOC_FOOTER_GAP
  const header = toc.querySelector('.vp-toc-header')
  const headerH =
    header instanceof HTMLElement ? header.getBoundingClientRect().height : 0
  const wrapperLimit = Math.floor(tocBudget - headerH)

  // 3. 只限制列表容器；清空旧的 #toc maxHeight，避免双层滚动
  toc.style.maxHeight = ''
  if (wrapperLimit < 48) {
    wrapper.style.maxHeight = ''
    return
  }
  wrapper.style.maxHeight = `${wrapperLimit}px`
}

/**
 * 绑定 scroll/resize，路由切换后重新夹紧一次。
 */
function mountTocFooterClamp(): void {
  clampTocAboveFooter()
  if (tocClampBound) return
  tocClampBound = true
  window.addEventListener('scroll', clampTocAboveFooter, { passive: true })
  window.addEventListener('resize', clampTocAboveFooter)
}

export default defineClientConfig({
  enhance({ app, router }) {
    app.component('Bilibili', Bilibili)
    app.component('FriendsList', FriendsList)
    app.component('SiteTimeline', SiteTimeline)

    if (typeof window !== 'undefined') {
      router.afterEach(() => {
        // 目录 DOM 就绪后再按页脚夹紧高度
        window.setTimeout(() => mountTocFooterClamp(), 0)
        window.setTimeout(() => mountTocFooterClamp(), 400)
      })
    }
  },
  setup() {
    if (typeof window === 'undefined') return
    window.setTimeout(() => mountTocFooterClamp(), 0)
    window.setTimeout(() => mountTocFooterClamp(), 400)
  },
  rootComponents: [FloatingRail],
})
