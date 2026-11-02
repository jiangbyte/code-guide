import { defineClientConfig } from 'vuepress/client'
import { useActiveState } from '@vuepress/plugin-slimsearch/client'
// 站点公共组件
import Bilibili from './components/Bilibili.vue'
import FloatingRail from './components/FloatingRail.vue'
import FriendsList from './components/FriendsList.vue'
import SiteTimeline from './components/SiteTimeline.vue'
// 文章专用演示（与站点壳层组件分离）
import BinarySearchDemo from './article-components/leetcode/BinarySearchDemo.vue'

/** 本页目录底边与页脚顶边的间隙 */
const TOC_FOOTER_GAP = 8
/** 与主题 hope-config.$pc 对齐，仅桌面侧栏目录需要夹紧 */
const TOC_CLAMP_MIN_WIDTH = 1440

let tocClampBound = false
/** slimsearch 开关；在 setup 里接到与面板同一份状态 */
let toggleSearchActive: ((value?: boolean) => void) | null = null
let slimsearchCloseBound = false

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

/**
 * 关闭 slimsearch：走官方 activeState，避免 mask.click 打断 Vue 更新。
 */
function closeSlimsearchModal(): void {
  toggleSearchActive?.(false)
}

/**
 * 结果点击后延后关面板；Esc 再兜底一次。
 */
function mountSlimsearchAutoClose(): void {
  if (slimsearchCloseBound) return
  slimsearchCloseBound = true

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      // 点结果项（含内部标题/图标）后关闭
      if (!target.closest('.vp-search-record-matches')) return
      if (target.closest('.vp-search-remove-icon')) return
      window.setTimeout(() => closeSlimsearchModal(), 0)
    },
    true,
  )

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape') return
      if (!document.querySelector('.vp-search-modal-wrapper')) return
      window.setTimeout(() => closeSlimsearchModal(), 0)
    },
    true,
  )
}

export default defineClientConfig({
  enhance({ app, router }) {
    app.component('Bilibili', Bilibili)
    app.component('FriendsList', FriendsList)
    app.component('SiteTimeline', SiteTimeline)
    app.component('BinarySearchDemo', BinarySearchDemo)

    if (typeof window !== 'undefined') {
      mountSlimsearchAutoClose()
      router.afterEach(() => {
        window.setTimeout(() => closeSlimsearchModal(), 0)
        window.setTimeout(() => mountTocFooterClamp(), 0)
        window.setTimeout(() => mountTocFooterClamp(), 400)
      })
    }
  },
  setup() {
    if (typeof window === 'undefined') return

    // 与 SearchModal 共用同一份 activeState
    const [, toggleActive] = useActiveState()
    toggleSearchActive = toggleActive

    mountSlimsearchAutoClose()
    window.setTimeout(() => mountTocFooterClamp(), 0)
    window.setTimeout(() => mountTocFooterClamp(), 400)
  },
  rootComponents: [FloatingRail],
})
