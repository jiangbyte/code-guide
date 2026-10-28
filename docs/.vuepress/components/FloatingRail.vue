<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const open = ref(false)
const showTop = ref(false)

function onScroll() {
  showTop.value = window.scrollY > 320
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openWechat() {
  open.value = true
}

function closeWechat() {
  open.value = false
}

function toggleWechat() {
  open.value = !open.value
}

function canHoverOpen() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function onDocPointer(e: Event) {
  const target = e.target as HTMLElement | null
  // 点在整个侧栏（含二维码面板）内不关闭
  if (target?.closest('.jb-rail')) return
  open.value = false
}

/** 仅精细指针设备用悬停展开，触屏只靠点击 */
function onWechatEnter() {
  if (canHoverOpen()) openWechat()
}

function onWechatLeave() {
  if (canHoverOpen()) closeWechat()
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  // 冒泡阶段：按钮上的 pointerdown 先于 document，避免误关
  document.addEventListener('pointerdown', onDocPointer)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('pointerdown', onDocPointer)
})
</script>

<template>
  <aside class="jb-rail" aria-label="快捷入口">
    <div class="jb-rail__stack">
      <div
        class="jb-rail__item-wrap"
        @mouseenter="onWechatEnter"
        @mouseleave="onWechatLeave"
      >
        <button
          type="button"
          class="jb-rail__item jb-rail__item--wechat"
          :aria-expanded="open"
          aria-controls="jb-wechat-panel"
          @pointerdown.stop
          @click.stop.prevent="toggleWechat"
        >
          <span class="jb-rail__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path
                d="M9.5 4C5.91 4 3 6.47 3 9.5c0 1.72.9 3.26 2.31 4.3L4.7 16.2l2.66-1.33c.66.18 1.37.28 2.14.28.2 0 .4 0 .59-.02A4.85 4.85 0 0 1 9.5 14c-2.9 0-5.25-1.93-5.25-4.3S6.6 5.4 9.5 5.4c2.55 0 4.66 1.5 5.1 3.48.7-.2 1.45-.33 2.24-.33.15 0 .3 0 .45.02C16.66 5.9 13.4 4 9.5 4zm5.84 6.15c-2.5 0-4.53 1.7-4.53 3.8 0 2.1 2.03 3.8 4.53 3.8.5 0 .98-.06 1.43-.17l2.05 1.03-.55-1.7c1.1-.8 1.8-1.96 1.8-3.26 0-2.1-2.03-3.5-4.73-3.5zM8.4 7.55a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8zm3.1 0a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8zm2.55 4.55a.7.7 0 1 0 0 1.4.7.7 0 0 0 0-1.4zm2.7 0a.7.7 0 1 0 0 1.4.7.7 0 0 0 0-1.4z"
              />
            </svg>
          </span>
          <span class="jb-rail__label">公众号</span>
        </button>

        <div
          v-show="open"
          id="jb-wechat-panel"
          class="jb-rail__panel"
          role="dialog"
          aria-label="微信公众号二维码"
          @click.stop
        >
          <img
            class="jb-rail__qr"
            src="/img/wechat-qr.jpg"
            width="148"
            height="148"
            alt="微信公众号二维码"
          />
          <p class="jb-rail__panel-text">扫码关注公众号</p>
        </div>
      </div>

      <a class="jb-rail__item" href="/about/me.html">
        <span class="jb-rail__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="8" r="3.2" />
            <path d="M5.5 19c1.2-3.2 3.5-4.8 6.5-4.8s5.3 1.6 6.5 4.8" stroke-linecap="round" />
          </svg>
        </span>
        <span class="jb-rail__label">关于</span>
      </a>

      <a class="jb-rail__item" href="/projects/">
        <span class="jb-rail__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
            <path d="M8 9.5h8M8 13h5" stroke-linecap="round" />
          </svg>
        </span>
        <span class="jb-rail__label">项目</span>
      </a>
    </div>

    <button
      v-show="showTop"
      type="button"
      class="jb-rail__top"
      aria-label="回到顶部"
      @click="scrollTop"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M6 14.5 12 8.5l6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </aside>
</template>
