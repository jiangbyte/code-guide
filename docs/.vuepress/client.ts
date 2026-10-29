import { defineClientConfig } from 'vuepress/client'
import Bilibili from './components/Bilibili.vue'
import FloatingRail from './components/FloatingRail.vue'

const ZOOM_STEP = 0.25
const ZOOM_MIN = 0.5
const ZOOM_MAX = 3

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

/**
 * 给每个 Mermaid 图工具栏挂上放大 / 缩小 / 重置，方便查看复杂架构图。
 */
function mountMermaidZoom(root: ParentNode = document): void {
  // 1. 找出尚未注入缩放按钮的 mermaid-actions
  root.querySelectorAll('.mermaid-actions').forEach((actions) => {
    if (!(actions instanceof HTMLElement)) return
    if (actions.dataset.jbZoom === '1') return

    // 2. 工具栏后一个兄弟节点应是 mermaid-wrapper
    const wrapper = actions.nextElementSibling
    if (!(wrapper instanceof HTMLElement) || !wrapper.classList.contains('mermaid-wrapper')) {
      return
    }

    actions.dataset.jbZoom = '1'
    let scale = 1

    const apply = (): void => {
      const content = wrapper.querySelector('.mermaid-content')
      if (!(content instanceof HTMLElement)) return
      content.style.transform = scale === 1 ? '' : `scale(${scale})`
    }

    const makeButton = (
      className: string,
      title: string,
      label: string,
      onClick: () => void,
    ): HTMLButtonElement => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = className
      btn.title = title
      btn.setAttribute('aria-label', title)
      btn.textContent = label
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        onClick()
        apply()
      })
      return btn
    }

    // 3. 追加 + / − / 重置，并在内容晚到时再应用一次缩放
    actions.append(
      makeButton('zoom-in-button', '放大', '+', () => {
        scale = Math.min(ZOOM_MAX, +(scale + ZOOM_STEP).toFixed(2))
      }),
      makeButton('zoom-out-button', '缩小', '−', () => {
        scale = Math.max(ZOOM_MIN, +(scale - ZOOM_STEP).toFixed(2))
      }),
      makeButton('zoom-reset-button', '重置', '1×', () => {
        scale = 1
      }),
    )

    const observer = new MutationObserver(() => apply())
    observer.observe(wrapper, { childList: true, subtree: true })
  })
}

export default defineClientConfig({
  enhance({ app, router }) {
    app.component('Bilibili', Bilibili)

    if (typeof window !== 'undefined') {
      router.afterEach(() => {
        // 路由切换后等 Mermaid 渲染完再挂缩放
        window.setTimeout(() => mountMermaidZoom(), 0)
        window.setTimeout(() => mountMermaidZoom(), 400)
        // 目录 DOM 就绪后再按页脚夹紧高度
        window.setTimeout(() => mountTocFooterClamp(), 0)
        window.setTimeout(() => mountTocFooterClamp(), 400)
      })
    }
  },
  setup() {
    if (typeof window === 'undefined') return
    // 首屏与后续动态插入的图都覆盖到
    const run = (): void => {
      mountMermaidZoom()
      mountTocFooterClamp()
    }
    window.setTimeout(run, 0)
    window.setTimeout(run, 400)
    const observer = new MutationObserver(() => mountMermaidZoom())
    window.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true })
      run()
    })
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true })
      run()
    }
  },
  rootComponents: [FloatingRail],
})
