<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouteLink, useRoute } from 'vuepress/client'
import { useRelatedLinks } from 'vuepress-theme-hope/client'
import QrcodeVue from 'qrcode.vue'

type RailPanel = 'wechat' | 'mobile' | null

// 与文末 PageNav 同源（主题 App setup 已 provide 侧栏）
const { prevLink, nextLink } = useRelatedLinks()
const hasPageNav = computed(() => Boolean(prevLink.value || nextLink.value))

const route = useRoute()

/** 当前页完整 URL，供「手机看」二维码；服务端渲染时先空串 */
const pageUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}${route.fullPath}`
})

const aboutHref = '/about/me.html'
const labels = {
  mobile: '手机看',
  mobileTitle: '微信扫一扫',
  mobileDialog: '当前页二维码',
  wechat: '公众号',
  wechatPanel: '扫码关注公众号',
  wechatDialog: '微信公众号二维码',
  bubble: '泡泡',
  about: '关于',
  projects: '项目',
  prev: '上篇',
  next: '下篇',
  pageNav: '上下篇切换',
  top: '回到顶部',
  rail: '快捷入口',
}

/** 互斥：同一时间只开一个面板 */
const panel = ref<RailPanel>(null)
const showTop = ref(false)
/** 窄屏：侧栏默认收起，仅留展开钮 */
const isNarrow = ref(false)
const railOpen = ref(false)

const railExpanded = computed(() => !isNarrow.value || railOpen.value)

const mqNarrow = '(max-width: 959px)'

function syncNarrow() {
  const narrow = window.matchMedia(mqNarrow).matches
  isNarrow.value = narrow
  // 回到宽屏时重置，避免状态残留
  if (!narrow) {
    railOpen.value = false
    return
  }
  // 进窄屏关闭「手机看」（该项本身也会隐藏）
  if (panel.value === 'mobile') panel.value = null
}

function toggleRail() {
  railOpen.value = !railOpen.value
  if (!railOpen.value) panel.value = null
}

function onScroll() {
  showTop.value = window.scrollY > 320
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openPanel(name: Exclude<RailPanel, null>) {
  panel.value = name
}

function closePanel() {
  panel.value = null
}

function togglePanel(name: Exclude<RailPanel, null>) {
  panel.value = panel.value === name ? null : name
}

function canHoverOpen() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function onDocPointer(e: Event) {
  const target = e.target as HTMLElement | null
  // 点在整个侧栏（含二维码面板）内不关闭
  if (target?.closest('.jb-rail')) return
  panel.value = null
  // 窄屏展开态：点外侧一并收起，少挡正文
  if (isNarrow.value) railOpen.value = false
}

/** 仅精细指针设备用悬停展开，触屏只靠点击 */
function onPanelEnter(name: Exclude<RailPanel, null>) {
  if (canHoverOpen()) openPanel(name)
}

function onPanelLeave(name: Exclude<RailPanel, null>) {
  if (canHoverOpen() && panel.value === name) closePanel()
}

let narrowMql: MediaQueryList | null = null

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  // 冒泡阶段：按钮上的 pointerdown 先于 document，避免误关
  document.addEventListener('pointerdown', onDocPointer)
  narrowMql = window.matchMedia(mqNarrow)
  syncNarrow()
  narrowMql.addEventListener('change', syncNarrow)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('pointerdown', onDocPointer)
  narrowMql?.removeEventListener('change', syncNarrow)
})
</script>

<template>
  <aside
    class="jb-rail"
    :class="{ 'jb-rail--open': railExpanded, 'jb-rail--narrow': isNarrow }"
    :aria-label="labels.rail"
  >
    <div class="jb-rail__dock">
      <button
        v-if="isNarrow"
        type="button"
        class="jb-rail__toggle"
        :aria-expanded="railOpen"
        :aria-label="railOpen ? '收起快捷入口' : '展开快捷入口'"
        @pointerdown.stop
        @click.stop.prevent="toggleRail"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
          <!-- 收起态：箭头朝左=可展开；展开态：朝右=可贴边收回 -->
          <path
            v-if="railOpen"
            d="M10 6l6 6-6 6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            v-else
            d="M14 6l-6 6 6 6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <div
        class="jb-rail__body"
        :class="{ 'is-collapsed': isNarrow && !railOpen }"
      >
        <div class="jb-rail__stack">
          <!-- 桌面：扫当前页到手机；窄屏已在手机上，不展示 -->
          <div
            v-if="!isNarrow"
            class="jb-rail__item-wrap"
            @mouseenter="onPanelEnter('mobile')"
            @mouseleave="onPanelLeave('mobile')"
          >
            <button
              type="button"
              class="jb-rail__item jb-rail__item--mobile"
              :aria-expanded="panel === 'mobile'"
              aria-controls="jb-mobile-panel"
              @pointerdown.stop
              @click.stop.prevent="togglePanel('mobile')"
            >
              <span class="jb-rail__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="7" y="2.5" width="10" height="19" rx="2" />
                  <path d="M10 5.5h4M11 18.5h2" stroke-linecap="round" />
                </svg>
              </span>
              <span class="jb-rail__label">{{ labels.mobile }}</span>
            </button>

            <div
              v-show="panel === 'mobile'"
              id="jb-mobile-panel"
              class="jb-rail__panel jb-rail__panel--mobile"
              role="dialog"
              :aria-label="labels.mobileDialog"
              @click.stop
            >
              <p class="jb-rail__panel-title">{{ labels.mobileTitle }}</p>
              <div class="jb-rail__qr jb-rail__qr--gen">
                <QrcodeVue
                  v-if="pageUrl"
                  :value="pageUrl"
                  :size="144"
                  level="M"
                  render-as="canvas"
                />
              </div>
              <p class="jb-rail__panel-text jb-rail__panel-text--foot">
                可以<strong>手机看</strong>或分享至<strong>朋友圈</strong>
              </p>
            </div>
          </div>

          <div
            class="jb-rail__item-wrap"
            @mouseenter="onPanelEnter('wechat')"
            @mouseleave="onPanelLeave('wechat')"
          >
            <button
              type="button"
              class="jb-rail__item jb-rail__item--wechat"
              :aria-expanded="panel === 'wechat'"
              aria-controls="jb-wechat-panel"
              @pointerdown.stop
              @click.stop.prevent="togglePanel('wechat')"
            >
              <span class="jb-rail__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path
                    d="M9.5 4C5.91 4 3 6.47 3 9.5c0 1.72.9 3.26 2.31 4.3L4.7 16.2l2.66-1.33c.66.18 1.37.28 2.14.28.2 0 .4 0 .59-.02A4.85 4.85 0 0 1 9.5 14c-2.9 0-5.25-1.93-5.25-4.3S6.6 5.4 9.5 5.4c2.55 0 4.66 1.5 5.1 3.48.7-.2 1.45-.33 2.24-.33.15 0 .3 0 .45.02C16.66 5.9 13.4 4 9.5 4zm5.84 6.15c-2.5 0-4.53 1.7-4.53 3.8 0 2.1 2.03 3.8 4.53 3.8.5 0 .98-.06 1.43-.17l2.05 1.03-.55-1.7c1.1-.8 1.8-1.96 1.8-3.26 0-2.1-2.03-3.5-4.73-3.5zM8.4 7.55a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8zm3.1 0a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8zm2.55 4.55a.7.7 0 1 0 0 1.4.7.7 0 0 0 0-1.4zm2.7 0a.7.7 0 1 0 0 1.4.7.7 0 0 0 0-1.4z"
                  />
                </svg>
              </span>
              <span class="jb-rail__label">{{ labels.wechat }}</span>
            </button>

            <div
              v-show="panel === 'wechat'"
              id="jb-wechat-panel"
              class="jb-rail__panel"
              role="dialog"
              :aria-label="labels.wechatDialog"
              @click.stop
            >
              <img
                class="jb-rail__qr"
                src="/img/wechat-qr.jpg"
                width="148"
                height="148"
                :alt="labels.wechatDialog"
              />
              <p class="jb-rail__panel-text">{{ labels.wechatPanel }}</p>
            </div>
          </div>

          <a class="jb-rail__item jb-rail__item--bubble" href="/bubble/">
            <span class="jb-rail__icon jb-rail__icon--bubble" aria-hidden="true">
              <img src="/img/logo.png" width="22" height="22" alt="" />
            </span>
            <span class="jb-rail__label">{{ labels.bubble }}</span>
          </a>

          <a class="jb-rail__item" :href="aboutHref">
            <span class="jb-rail__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M5.5 19c1.2-3.2 3.5-4.8 6.5-4.8s5.3 1.6 6.5 4.8" stroke-linecap="round" />
              </svg>
            </span>
            <span class="jb-rail__label">{{ labels.about }}</span>
          </a>

          <a class="jb-rail__item" href="/projects/">
            <span class="jb-rail__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
                <path d="M8 9.5h8M8 13h5" stroke-linecap="round" />
              </svg>
            </span>
            <span class="jb-rail__label">{{ labels.projects }}</span>
          </a>
        </div>

        <nav v-if="hasPageNav" class="jb-rail__nav" :aria-label="labels.pageNav">
          <RouteLink
            v-if="prevLink"
            class="jb-rail__item jb-rail__item--nav"
            :to="prevLink.link"
            :title="prevLink.text"
          >
            <span class="jb-rail__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15.5 6 9.5 12l6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="jb-rail__label">{{ labels.prev }}</span>
          </RouteLink>

          <RouteLink
            v-if="nextLink"
            class="jb-rail__item jb-rail__item--nav"
            :to="nextLink.link"
            :title="nextLink.text"
          >
            <span class="jb-rail__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8.5 6 14.5 12l-6 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="jb-rail__label">{{ labels.next }}</span>
          </RouteLink>
        </nav>
      </div>
    </div>

    <!-- 窄屏收起时仍保留置顶，方便回顶 -->
    <button
      v-show="showTop"
      type="button"
      class="jb-rail__top"
      :aria-label="labels.top"
      @pointerdown.stop
      @click.stop.prevent="scrollTop"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M6 14.5 12 8.5l6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </aside>
</template>
