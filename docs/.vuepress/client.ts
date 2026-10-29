import { defineClientConfig } from 'vuepress/client'
import BeautyPack from './components/BeautyPack.vue'
import Bilibili from './components/Bilibili.vue'
import FloatingRail from './components/FloatingRail.vue'
import StickerPack from './components/StickerPack.vue'

const ZOOM_STEP = 0.25
const ZOOM_MIN = 0.5
const ZOOM_MAX = 3

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
    app.component('BeautyPack', BeautyPack)
    app.component('Bilibili', Bilibili)
    app.component('StickerPack', StickerPack)

    if (typeof window !== 'undefined') {
      router.afterEach(() => {
        // 路由切换后等 Mermaid 渲染完再挂缩放
        window.setTimeout(() => mountMermaidZoom(), 0)
        window.setTimeout(() => mountMermaidZoom(), 400)
      })
    }
  },
  setup() {
    if (typeof window === 'undefined') return
    // 首屏与后续动态插入的图都覆盖到
    const run = (): void => mountMermaidZoom()
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
