<script setup lang="ts">
import { computed } from 'vue'
import { siteEvents } from '../data/siteEvents'

/** 与 Theme Hope Blog 时间线一致：MM/DD → M/D */
function formatMd(date: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date)
  if (!m) return date
  return `${Number(m[2])}/${Number(m[3])}`
}

/** 按年分组，组内与组间均为日期倒序（同 Blog） */
const years = computed(() => {
  const sorted = [...siteEvents].sort((a, b) =>
    a.date === b.date ? 0 : a.date < b.date ? 1 : -1,
  )
  const map = new Map<string, typeof sorted>()
  for (const ev of sorted) {
    const y = ev.date.slice(0, 4)
    if (!map.has(y)) map.set(y, [])
    map.get(y)!.push(ev)
  }
  return [...map.entries()].map(([year, items]) => ({
    year,
    items: items.map((ev) => ({
      ...ev,
      md: formatMd(ev.date),
    })),
  }))
})
</script>

<template>
  <!-- 结构 / class 对齐 vuepress-theme-hope TimelineItems -->
  <div class="timeline-wrapper jb-site-timeline">
    <ul class="timeline-content">
      <li class="motto">昨日不在</li>
      <template v-for="group in years" :key="group.year">
        <h3 :id="group.year" class="timeline-year-title">
          <span>{{ group.year }}</span>
        </h3>
        <li class="timeline-year-list">
          <ul class="timeline-year-wrapper">
            <li
              v-for="(ev, i) in group.items"
              :key="`${ev.date}-${ev.title}-${i}`"
              class="timeline-item"
              :title="ev.description"
            >
              <span class="timeline-date">{{ ev.md }}</span>
              <span class="timeline-title">{{ ev.title }}</span>
            </li>
          </ul>
        </li>
      </template>
    </ul>
  </div>
</template>

<style>
/* 对齐 theme-hope timeline-items.scss（站点页未必加载 Blog 分包样式） */
.jb-site-timeline.timeline-wrapper {
  --dot-color: #fff;
  --dot-bar-color: #eaecef;
  --dot-border-color: #ddd;

  max-width: 740px;
  margin: 0 auto;
  padding: 40px 0;
}

@media (max-width: 719px) {
  .jb-site-timeline.timeline-wrapper {
    margin: 0 1.2rem;
  }
}

.jb-site-timeline .timeline-content {
  position: relative;
  box-sizing: border-box;
  padding-inline-start: 76px;
  list-style: none;
}

.jb-site-timeline .timeline-content::before {
  content: ' ';
  position: absolute;
  inset-inline-start: 64px;
  top: 14px;
  width: 4px;
  height: calc(100% - 38px);
  margin-inline-end: -2px;
  background: var(--dot-bar-color);
}

.jb-site-timeline .motto {
  position: relative;
  color: var(--vp-c-text);
  font-size: 18px;
}

.jb-site-timeline .motto::before,
.jb-site-timeline .timeline-year-title span::before,
.jb-site-timeline .timeline-date::before {
  content: ' ';
  position: absolute;
  top: 50%;
  z-index: 2;
  margin-top: -6px;
  margin-inline-start: -6px;
  border: 2px solid var(--dot-border-color);
  border-radius: 50%;
  background: var(--dot-color);
}

.jb-site-timeline .motto::before {
  inset-inline-start: -10px;
  width: 8px;
  height: 8px;
}

.jb-site-timeline .timeline-year-title {
  margin-top: calc(3rem - var(--navbar-height, 3.75rem));
  margin-bottom: 0.5rem;
  padding-top: var(--navbar-height, 3.75rem);
  color: var(--vp-c-text);
  font-weight: 700;
  font-size: 26px;
  font-family: var(--vp-font-heading);
}

.jb-site-timeline .timeline-year-title span {
  position: relative;
}

.jb-site-timeline .timeline-year-title span::before {
  inset-inline-start: -10px;
  width: 8px;
  height: 8px;
}

.jb-site-timeline .timeline-year-wrapper {
  padding-inline-start: 0 !important;
  list-style: none;
}

.jb-site-timeline .timeline-item {
  position: relative;
  z-index: 3;
  display: flex;
  padding: 30px 0 10px;
  border-bottom: 1px dashed var(--vp-c-border);
  list-style: none;
}

.jb-site-timeline .timeline-date {
  position: absolute;
  inset-inline-end: calc(100% + 24px);
  width: 50px;
  font-size: 14px;
  line-height: 30px;
  text-align: end;
}

.jb-site-timeline .timeline-date::before {
  inset-inline-end: -19px;
  width: 6px;
  height: 6px;
}

.jb-site-timeline .timeline-title {
  position: relative;
  display: block;
  color: inherit;
  font-size: 16px;
  line-height: 30px;
}

.jb-site-timeline .timeline-item:hover .timeline-date::before {
  border-color: var(--vp-c-accent-bg, var(--vp-c-accent));
  background: var(--vp-c-bg-alt, #f6f6f7);
}

.jb-site-timeline .timeline-item:hover .timeline-title {
  color: var(--vp-c-accent);
  font-size: 18px;
}
</style>
