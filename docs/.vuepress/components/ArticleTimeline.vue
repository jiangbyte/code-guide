<script setup lang="ts">
import { computed } from 'vue'
import { RouteLink } from 'vuepress/client'
// @ts-expect-error 构建期由 jb-article-timeline 插件写入
import { timelineArticles } from '@temp/jb-article-timeline.js'

type Item = {
  title: string
  path: string
  date: string
  category?: string
  section: string
}

const articles = timelineArticles as Item[]

const MONTH_LABELS = [
  '',
  '1 月',
  '2 月',
  '3 月',
  '4 月',
  '5 月',
  '6 月',
  '7 月',
  '8 月',
  '9 月',
  '10 月',
  '11 月',
  '12 月',
]

/** 年 → 月 → 文章，均倒序；附带数量统计 */
const groups = computed(() => {
  type MonthBucket = { month: string; label: string; count: number; items: Item[] }
  type YearBucket = { year: string; count: number; months: MonthBucket[] }

  const yearMap = new Map<string, Map<string, Item[]>>()
  for (const item of articles) {
    const year = item.date.slice(0, 4) || '未知'
    const month = item.date.slice(5, 7) || '00'
    let monthMap = yearMap.get(year)
    if (!monthMap) {
      monthMap = new Map()
      yearMap.set(year, monthMap)
    }
    const list = monthMap.get(month)
    if (list) list.push(item)
    else monthMap.set(month, [item])
  }

  const years: YearBucket[] = []
  for (const [year, monthMap] of yearMap) {
    const months: MonthBucket[] = [...monthMap.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([month, items]) => ({
        month,
        label: MONTH_LABELS[Number(month)] || `${month} 月`,
        count: items.length,
        items,
      }))
    years.push({
      year,
      count: months.reduce((n, m) => n + m.count, 0),
      months,
    })
  }
  return years
})

function dayLabel(date: string): string {
  const day = date.slice(8, 10)
  return day ? `${Number(day)} 日` : date
}
</script>

<template>
  <div class="jb-timeline">
    <p class="jb-timeline__summary">
      共 <strong>{{ articles.length }}</strong> 篇，按写作日期倒序。
    </p>

    <section
      v-for="yearGroup in groups"
      :key="yearGroup.year"
      class="jb-timeline__year"
    >
      <h2 class="jb-timeline__year-title">
        {{ yearGroup.year }} 年
        <span class="jb-timeline__count">{{ yearGroup.count }} 篇</span>
      </h2>

      <div
        v-for="monthGroup in yearGroup.months"
        :key="`${yearGroup.year}-${monthGroup.month}`"
        class="jb-timeline__month"
      >
        <h3 class="jb-timeline__month-title">
          {{ monthGroup.label }}
          <span class="jb-timeline__count">{{ monthGroup.count }} 篇</span>
        </h3>

        <ol class="jb-timeline__list">
          <li
            v-for="item in monthGroup.items"
            :key="item.path"
            class="jb-timeline__item"
          >
            <time class="jb-timeline__date" :datetime="item.date">{{ dayLabel(item.date) }}</time>
            <div class="jb-timeline__main">
              <RouteLink class="jb-timeline__link" :to="item.path">
                {{ item.title }}
              </RouteLink>
              <span class="jb-timeline__meta">
                <span class="jb-timeline__section">{{ item.section }}</span>
                <span v-if="item.category" class="jb-timeline__cat">{{ item.category }}</span>
              </span>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <p v-if="!articles.length" class="jb-timeline__empty">暂无文章。</p>
  </div>
</template>

<style scoped>
.jb-timeline {
  max-width: 44rem;
}

.jb-timeline__summary {
  margin: 0 0 1.5rem;
  color: var(--vp-c-text-mute);
  font-size: 0.95rem;
}

.jb-timeline__year {
  margin-bottom: 2.25rem;
}

.jb-timeline__year-title {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  margin: 0 0 1rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--vp-c-accent);
}

.jb-timeline__month {
  margin-bottom: 1.25rem;
}

.jb-timeline__month-title {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.4rem 0.65rem;
  margin: 0 0 0.55rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--vp-c-text);
}

.jb-timeline__count {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--vp-c-text-mute);
  padding: 0.1rem 0.45rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg-alt);
}

.jb-timeline__list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-left: 2px solid var(--vp-c-border);
}

.jb-timeline__item {
  position: relative;
  display: grid;
  grid-template-columns: 3.5rem 1fr;
  gap: 0.75rem 1rem;
  padding: 0.65rem 0 0.65rem 1.1rem;
}

.jb-timeline__item::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 1.15rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-accent);
  box-shadow: 0 0 0 2px var(--vp-c-bg);
}

.jb-timeline__date {
  color: var(--vp-c-text-mute);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.6;
  padding-top: 0.15rem;
}

.jb-timeline__main {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.jb-timeline__link {
  color: var(--vp-c-text);
  font-weight: 600;
  text-decoration: none;
  line-height: 1.45;
  word-break: break-word;
}

.jb-timeline__link:hover {
  color: var(--vp-c-accent);
}

.jb-timeline__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.6rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-mute);
}

.jb-timeline__section,
.jb-timeline__cat {
  padding: 0.05rem 0.4rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg-alt);
}

.jb-timeline__empty {
  color: var(--vp-c-text-mute);
}

@media (max-width: 560px) {
  .jb-timeline__item {
    grid-template-columns: 1fr;
    gap: 0.2rem;
    padding-left: 1rem;
  }

  .jb-timeline__date {
    padding-top: 0;
  }
}
</style>
