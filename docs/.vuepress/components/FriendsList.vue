<script setup lang="ts">
import { computed, ref } from 'vue'
import { frameworks, friends, selfSite, type FriendLink } from '../data/friends'

const APPLY_MAIL =
  'mailto:jiangbytebiz@163.com' +
  '?subject=' +
  encodeURIComponent('友链申请 · 摸鱼猫泡泡') +
  '&body=' +
  encodeURIComponent(
    [
      '你好，希望互换友链。',
      '',
      '站点名称：',
      '站点链接：',
      '一句话简介：',
      '站点图标（可选）：',
    ].join('\n'),
  )

const friendCount = computed(() => friends.length)
const frameworkCount = computed(() => frameworks.length)

/** 本站字段行：标签 + 值，统一走复制逻辑 */
const selfFields = computed(() => [
  { key: 'name', label: '名称', value: selfSite.name },
  { key: 'desc', label: '描述', value: selfSite.desc },
  { key: 'url', label: '链接', value: selfSite.url },
  { key: 'logo', label: 'Logo', value: selfSite.logo },
])

/** 一整段可粘贴文本，方便对方直接发邮件 / 填表 */
const selfSiteBlock = computed(() =>
  [
    `名称：${selfSite.name}`,
    `描述：${selfSite.desc}`,
    `链接：${selfSite.url}`,
    `Logo：${selfSite.logo}`,
  ].join('\n'),
)

/** 最近一次复制成功的标记：字段 key 或 `all`；空串表示无反馈 */
const copiedKey = ref('')
let copiedTimer: ReturnType<typeof setTimeout> | undefined

/**
 * 把列表铺到足够长，供横向无缝滚动；空列表返回空。
 */
function buildMarqueeRow(source: FriendLink[], minCount: number): FriendLink[] {
  if (source.length === 0) return []
  const row: FriendLink[] = []
  while (row.length < minCount) row.push(...source)
  return [...row, ...row]
}

const marqueeRowA = computed(() => buildMarqueeRow(friends, 16))
const marqueeRowB = computed(() => {
  const rotated =
    friends.length > 1 ? [...friends.slice(1), friends[0]] : [...friends]
  return buildMarqueeRow(rotated, 16)
})

function initial(name: string): string {
  return (name.trim().charAt(0) || '?').toUpperCase()
}

function visitRandom(): void {
  if (friends.length === 0) return
  const item = friends[Math.floor(Math.random() * friends.length)]
  window.open(item.url, '_blank', 'noopener,noreferrer')
}

/**
 * 复制文本到剪贴板，并短暂展示「已复制」反馈。
 */
async function copyText(text: string, key: string): Promise<void> {
  // 1. 优先用 Clipboard API；失败再走 textarea 回退，兼容旧环境
  // 2. 成功后写入 copiedKey，约 1.6s 后清空，避免反馈残留
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.left = '-9999px'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    copiedKey.value = key
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      copiedKey.value = ''
    }, 1600)
  } catch {
    copiedKey.value = ''
  }
}
</script>

<template>
  <div class="jb-friends-page">
    <!-- 顶部横幅 -->
    <section class="jb-friends-hero">
      <div class="jb-friends-hero__top">
        <div class="jb-friends-hero__copy">
          <p class="jb-friends-hero__eyebrow">友情链接</p>
          <h1 class="jb-friends-hero__title">与博主们一起无限进步</h1>
        </div>

        <div class="jb-friends-hero__actions">
          <button
            type="button"
            class="jb-friends-btn jb-friends-btn--ghost"
            :disabled="friends.length === 0"
            @click="visitRandom"
          >
            <span class="jb-friends-btn__icon" aria-hidden="true">🎲</span>
            随机访问
          </button>
          <a class="jb-friends-btn jb-friends-btn--solid" :href="APPLY_MAIL">
            <span class="jb-friends-btn__icon" aria-hidden="true">↗</span>
            申请友链
          </a>
        </div>
      </div>

      <div v-if="friends.length > 0" class="jb-friends-marquee" aria-hidden="true">
        <div class="jb-friends-marquee__row jb-friends-marquee__row--a">
          <div class="jb-friends-marquee__track">
            <div
              v-for="(item, i) in marqueeRowA"
              :key="`a-${item.url}-${i}`"
              class="jb-friends-marquee__item"
            >
              <img v-if="item.logo" :src="item.logo" :alt="item.name" loading="lazy" />
              <span v-else>{{ initial(item.name) }}</span>
            </div>
          </div>
        </div>
        <div class="jb-friends-marquee__row jb-friends-marquee__row--b">
          <div class="jb-friends-marquee__track">
            <div
              v-for="(item, i) in marqueeRowB"
              :key="`b-${item.url}-${i}`"
              class="jb-friends-marquee__item"
            >
              <img v-if="item.logo" :src="item.logo" :alt="item.name" loading="lazy" />
              <span v-else>{{ initial(item.name) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 小伙伴 -->
    <section class="jb-friends-section">
      <header class="jb-friends-section__head">
        <h2 class="jb-friends-section__title">小伙伴({{ friendCount }})</h2>
        <p class="jb-friends-section__sub">那些人，那些事</p>
      </header>

      <p v-if="friends.length === 0" class="jb-friends-empty">
        暂无友链，点击上方「申请友链」互换。
      </p>

      <div v-else class="jb-friends-grid">
        <a
          v-for="item in friends"
          :key="item.url"
          class="jb-friends-card"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span v-if="item.recommended" class="jb-friends-card__badge">推荐</span>
          <div class="jb-friends-card__avatar">
            <img v-if="item.logo" :src="item.logo" :alt="item.name" loading="lazy" />
            <span v-else>{{ initial(item.name) }}</span>
          </div>
          <div class="jb-friends-card__body">
            <div class="jb-friends-card__name">{{ item.name }}</div>
            <div class="jb-friends-card__desc">{{ item.desc }}</div>
          </div>
        </a>
      </div>
    </section>

    <!-- 框架友链 -->
    <section v-if="frameworks.length > 0" class="jb-friends-section jb-friends-section--framework">
      <header class="jb-friends-section__head jb-friends-section__head--line">
        <h2 class="jb-friends-section__title">框架({{ frameworkCount }})</h2>
      </header>

      <div class="jb-framework-grid">
        <a
          v-for="item in frameworks"
          :key="item.url"
          class="jb-framework-card"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="jb-framework-card__preview">
            <!-- 有 preview 用预览图；否则用 logo 放大模糊当背景 -->
            <img
              v-if="item.preview || item.logo"
              class="jb-framework-card__preview-img"
              :class="{ 'is-blur': !item.preview && !!item.logo }"
              :src="item.preview || item.logo"
              alt=""
              loading="lazy"
            />
          </div>
          <div class="jb-framework-card__logo">
            <img v-if="item.logo" :src="item.logo" :alt="item.name" loading="lazy" />
            <span v-else>{{ initial(item.name) }}</span>
          </div>
          <div class="jb-framework-card__name">{{ item.name }}</div>
        </a>
      </div>
    </section>

    <!-- 本站信息：方便对方互换时复制 -->
    <section class="jb-friends-section jb-friends-section--self">
      <header class="jb-friends-section__head jb-friends-section__head--line">
        <h2 class="jb-friends-section__title">本站信息</h2>
      </header>
      <p class="jb-friends-section__sub jb-friends-section__sub--self">
        互换友链时可直接复制以下字段
      </p>

      <div class="jb-self-card">
        <div class="jb-self-card__intro">
          <div class="jb-self-card__avatar" aria-hidden="true">
            <img :src="selfSite.logo" :alt="selfSite.name" loading="lazy" />
          </div>
          <div class="jb-self-card__intro-body">
            <div class="jb-self-card__name">{{ selfSite.name }}</div>
            <div class="jb-self-card__desc">{{ selfSite.desc }}</div>
          </div>
          <button
            type="button"
            class="jb-friends-btn jb-friends-btn--ghost jb-self-card__copy-all"
            @click="copyText(selfSiteBlock, 'all')"
          >
            {{ copiedKey === 'all' ? '已复制' : '一键复制' }}
          </button>
        </div>

        <ul class="jb-self-card__fields">
          <li v-for="field in selfFields" :key="field.key" class="jb-self-card__row">
            <span class="jb-self-card__label">{{ field.label }}</span>
            <code class="jb-self-card__value" :title="field.value">{{ field.value }}</code>
            <button
              type="button"
              class="jb-self-card__copy"
              :aria-label="`复制${field.label}`"
              @click="copyText(field.value, field.key)"
            >
              {{ copiedKey === field.key ? '已复制' : '复制' }}
            </button>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.jb-friends-page {
  margin: 1.5rem 0 2rem;
}

/* —— 横幅 —— */
.jb-friends-hero {
  overflow: hidden;
  padding: 1.5rem 0 1.15rem;
  border-radius: 16px;
  background: var(--vp-c-bg-elv);
  box-shadow: 0 2px 14px var(--vp-c-shadow);
}

.jb-friends-hero__top {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.25rem;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 1.5rem 1.15rem;
}

.jb-friends-hero__copy {
  min-width: 0;
  flex: 1 1 12rem;
}

.jb-friends-hero__eyebrow {
  margin: 0 0 0.3rem;
  color: var(--vp-c-text-mute);
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}

.jb-friends-hero__title {
  margin: 0;
  color: var(--vp-c-text);
  font-weight: 800;
  font-size: clamp(1.4rem, 3vw, 1.8rem);
  line-height: 1.35;
}

.jb-friends-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  flex: 0 0 auto;
  padding-top: 0.15rem;
}

.jb-friends-btn {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 2.35rem;
  padding: 0.45rem 1rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1;
  text-decoration: none !important;
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s,
    border-color 0.15s,
    transform 0.15s;
}

.jb-friends-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.jb-friends-btn__icon {
  font-size: 0.95rem;
  line-height: 1;
}

.jb-friends-btn--ghost {
  border-color: var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text);
}

.jb-friends-btn--ghost:not(:disabled):hover {
  border-color: var(--vp-c-accent);
  color: var(--vp-c-accent);
}

.jb-friends-btn--solid {
  background: var(--vp-c-text);
  color: var(--vp-c-bg);
}

.jb-friends-btn--solid:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

[data-theme='dark'] .jb-friends-btn--solid {
  background: var(--vp-c-accent);
  color: #fff;
}

/* —— 双排滚动头像 —— */
.jb-friends-marquee {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.15rem 0 0.25rem;
}

.jb-friends-marquee__row {
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}

.jb-friends-marquee__track {
  display: flex;
  gap: 0.55rem;
  width: max-content;
  will-change: transform;
}

.jb-friends-marquee__row--a .jb-friends-marquee__track {
  animation: jb-friends-marquee-left 36s linear infinite;
}

.jb-friends-marquee__row--b .jb-friends-marquee__track {
  animation: jb-friends-marquee-right 42s linear infinite;
}

.jb-friends-marquee__row:hover .jb-friends-marquee__track {
  animation-play-state: paused;
}

.jb-friends-marquee__item {
  display: flex;
  flex: 0 0 auto;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  border: 2px solid var(--vp-c-bg-elv);
  border-radius: 50%;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-mute);
  font-weight: 700;
  font-size: 0.75rem;
  box-shadow: 0 1px 4px var(--vp-c-shadow);
}

.jb-friends-marquee__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes jb-friends-marquee-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes jb-friends-marquee-right {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .jb-friends-marquee__track {
    animation: none !important;
  }
}

@media (max-width: 640px) {
  .jb-friends-page {
    margin-top: 1.15rem;
  }

  .jb-friends-hero__top {
    padding-inline: 1.15rem;
  }

  .jb-friends-hero__actions {
    width: 100%;
  }
}

/* —— 分区 —— */
.jb-friends-section {
  margin-top: 1.75rem;
}

.jb-friends-section--framework {
  margin-top: 2.25rem;
}

.jb-friends-section__head {
  margin-bottom: 1rem;
}

.jb-friends-section__head--line {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.1rem;
}

.jb-friends-section__head--line::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--vp-c-border);
}

.jb-friends-section__title {
  margin: 0;
  color: var(--vp-c-text);
  font-weight: 800;
  font-size: 1.35rem;
  line-height: 1.3;
  white-space: nowrap;
}

.jb-friends-section__sub {
  margin: 0.25rem 0 0;
  color: var(--vp-c-text-mute);
  font-size: 0.9rem;
}

.jb-friends-empty {
  margin: 0.5rem 0;
  color: var(--vp-c-text-mute);
  font-size: 0.95rem;
}

/* —— 小伙伴卡片 —— */
.jb-friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13.5rem, 1fr));
  gap: 0.85rem;
}

.jb-friends-card {
  position: relative;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  box-sizing: border-box;
  min-height: 4.25rem;
  padding: 0.85rem 0.95rem;
  border-radius: 12px;
  background: var(--vp-c-bg-elv);
  box-shadow: 0 1px 8px var(--vp-c-shadow);
  color: var(--vp-c-text);
  text-decoration: none !important;
  transition:
    background-color 0.18s,
    color 0.18s,
    box-shadow 0.18s,
    transform 0.18s;
}

.jb-friends-card:hover,
.jb-friends-card:focus,
.jb-friends-card:focus-visible {
  /* 仅上浮 + 阴影，不改背景色与文字色 */
  box-shadow: 0 6px 18px var(--vp-c-shadow);
  text-decoration: none !important;
  transform: translateY(-3px);
}

.jb-friends-card__badge {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  padding: 0.12rem 0.45rem 0.18rem;
  border-radius: 12px 0 8px 0;
  background: #3b82f6;
  color: #fff;
  font-weight: 700;
  font-size: 0.68rem;
  line-height: 1.2;
}

.jb-friends-card__avatar {
  display: flex;
  flex: 0 0 auto;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-mute);
  font-weight: 700;
  font-size: 0.95rem;
}


.jb-friends-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.jb-friends-card__body {
  min-width: 0;
  flex: 1;
}

.jb-friends-card__name {
  overflow: hidden;
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jb-friends-card__desc {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 0.2rem;
  color: var(--vp-c-text-mute);
  font-size: 0.8rem;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  transition: color 0.18s;
}


/* —— 框架卡片（SiteInfo 风格） —— */
.jb-framework-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11.5rem, 1fr));
  gap: 1rem;
}

.jb-framework-card {
  position: relative;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  min-height: 9.5rem;
  padding: 0 0.75rem 0.95rem;
  border: none;
  border-radius: 12px;
  background: var(--vp-c-bg-elv);
  box-shadow: 0 1px 8px var(--vp-c-shadow);
  color: inherit;
  text-decoration: none !important;
  transition:
    box-shadow 0.18s,
    transform 0.18s;
}

.jb-framework-card:hover,
.jb-framework-card:focus,
.jb-framework-card:focus-visible {
  box-shadow: 0 8px 22px var(--vp-c-shadow);
  text-decoration: none !important;
  transform: translateY(-3px);
}

.jb-framework-card__preview {
  position: relative;
  overflow: hidden;
  width: calc(100% + 1.5rem);
  height: 4.25rem;
  margin: 0 -0.75rem 0.15rem;
  background: var(--vp-c-bg-alt);
}

.jb-framework-card__preview-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

/* 无独立预览图时：logo 放大模糊作氛围底 */
.jb-framework-card__preview-img.is-blur {
  inset: -30%;
  width: 160%;
  height: 160%;
  object-fit: contain;
  object-position: center;
  filter: blur(14px) saturate(1.15);
  opacity: 0.72;
  transform: scale(1.35);
}

.jb-framework-card__preview::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 35%,
    color-mix(in srgb, var(--vp-c-bg-elv) 55%, transparent)
  );
  pointer-events: none;
}

.jb-framework-card__logo {
  position: relative;
  z-index: 1;
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  width: 3.25rem;
  height: 3.25rem;
  margin-top: -1.65rem;
  border: 3px solid var(--vp-c-bg-elv);
  border-radius: 50%;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-mute);
  font-weight: 700;
  box-shadow: 0 2px 8px var(--vp-c-shadow);
}

.jb-framework-card__logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.jb-framework-card__name {
  margin-top: 0.55rem;
  color: var(--vp-c-text);
  font-weight: 650;
  font-size: 0.92rem;
  line-height: 1.35;
  text-align: center;
  text-decoration: none !important;
  word-break: break-word;
}

.jb-friends-card__name,
.jb-friends-card__desc {
  text-decoration: none !important;
}

/* —— 本站信息卡片 —— */
.jb-friends-section--self {
  margin-top: 2.25rem;
}

.jb-friends-section__sub--self {
  margin: -0.35rem 0 1rem;
}

.jb-self-card {
  box-sizing: border-box;
  padding: 1.15rem 1.25rem 1.05rem;
  border-radius: 14px;
  background: var(--vp-c-bg-elv);
  box-shadow: 0 1px 8px var(--vp-c-shadow);
}

.jb-self-card__intro {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 1rem;
  align-items: center;
  margin-bottom: 0.95rem;
  padding-bottom: 0.95rem;
  border-bottom: 1px solid var(--vp-c-border);
}

.jb-self-card__avatar {
  display: flex;
  flex: 0 0 auto;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 50%;
  background: var(--vp-c-bg-alt);
  box-shadow: 0 1px 4px var(--vp-c-shadow);
}

.jb-self-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.jb-self-card__intro-body {
  min-width: 0;
  flex: 1 1 10rem;
}

.jb-self-card__name {
  color: var(--vp-c-text);
  font-weight: 800;
  font-size: 1.05rem;
  line-height: 1.3;
}

.jb-self-card__desc {
  margin-top: 0.2rem;
  color: var(--vp-c-text-mute);
  font-size: 0.88rem;
  line-height: 1.45;
}

.jb-self-card__copy-all {
  flex: 0 0 auto;
  margin-left: auto;
}

.jb-self-card__fields {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.jb-self-card__row {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr) auto;
  gap: 0.55rem 0.75rem;
  align-items: center;
  min-height: 2.1rem;
}

.jb-self-card__label {
  color: var(--vp-c-text-mute);
  font-weight: 600;
  font-size: 0.82rem;
}

.jb-self-card__value {
  overflow: hidden;
  box-sizing: border-box;
  min-width: 0;
  padding: 0.35rem 0.55rem;
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text);
  font-family: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 0.82rem;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jb-self-card__copy {
  flex: 0 0 auto;
  min-width: 3.4rem;
  padding: 0.28rem 0.55rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text);
  font-weight: 600;
  font-size: 0.78rem;
  line-height: 1.2;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s,
    background-color 0.15s;
}

.jb-self-card__copy:hover {
  border-color: var(--vp-c-accent);
  color: var(--vp-c-accent);
}

@media (max-width: 640px) {
  .jb-self-card {
    padding: 1rem 1rem 0.9rem;
  }

  .jb-self-card__copy-all {
    width: 100%;
    margin-left: 0;
  }

  .jb-self-card__row {
    grid-template-columns: 2.75rem minmax(0, 1fr) auto;
    gap: 0.4rem 0.5rem;
  }

  .jb-self-card__value {
    font-size: 0.76rem;
  }
}
</style>
