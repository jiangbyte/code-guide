<script setup lang="ts">
import { siteEvents } from '../data/siteEvents'

const events = [...siteEvents].sort((a, b) =>
  a.date === b.date ? 0 : a.date < b.date ? -1 : 1,
)
</script>

<template>
  <div class="jb-site-tl">
    <p class="jb-site-tl__summary">
      共 <strong>{{ events.length }}</strong> 个站点事件。
    </p>

    <ol class="jb-site-tl__track">
      <li
        v-for="(ev, i) in events"
        :key="`${ev.date}-${ev.title}-${i}`"
        class="jb-site-tl__node"
        :class="i % 2 === 0 ? 'is-left' : 'is-right'"
      >
        <div class="jb-site-tl__card">
          <time class="jb-site-tl__date" :datetime="ev.date">{{ ev.date }}</time>
          <h3 class="jb-site-tl__title">{{ ev.title }}</h3>
          <p class="jb-site-tl__desc">{{ ev.description }}</p>
        </div>
        <span class="jb-site-tl__dot" aria-hidden="true" />
      </li>
    </ol>
  </div>
</template>

<style scoped>
.jb-site-tl {
  width: 100%;
  max-width: 52rem;
  margin: 0 auto;
}

.jb-site-tl__summary {
  margin: 0 0 1.5rem;
  color: var(--vp-c-text-mute);
  font-size: 0.95rem;
}

.jb-site-tl__track {
  position: relative;
  margin: 0;
  padding: 0.25rem 0 0.5rem;
  list-style: none;
}

/* 中间竖轴 */
.jb-site-tl__track::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: var(--vp-c-border);
}

.jb-site-tl__node {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1.5rem;
  margin-bottom: 1.75rem;
  align-items: start;
}

.jb-site-tl__node:last-child {
  margin-bottom: 0;
}

.jb-site-tl__card {
  box-sizing: border-box;
  width: 100%;
  max-width: 22rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  box-shadow: 0 1px 4px var(--vp-c-shadow);
}

.jb-site-tl__node.is-left .jb-site-tl__card {
  justify-self: end;
  text-align: right;
}

.jb-site-tl__node.is-right .jb-site-tl__card {
  grid-column: 2;
  justify-self: start;
  text-align: left;
}

.jb-site-tl__date {
  display: block;
  margin-bottom: 0.3rem;
  color: var(--vp-c-accent);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.jb-site-tl__title {
  margin: 0 0 0.35rem;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--vp-c-text);
}

.jb-site-tl__desc {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--vp-c-text-mute);
}

.jb-site-tl__dot {
  position: absolute;
  top: 1.1rem;
  left: 50%;
  z-index: 1;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--vp-c-accent);
  box-shadow: 0 0 0 3px var(--vp-c-bg);
  transform: translate(-50%, -50%);
}

@media (max-width: 719px) {
  .jb-site-tl__track::before {
    left: 0.65rem;
    transform: none;
  }

  .jb-site-tl__node {
    grid-template-columns: 1fr;
    padding-left: 1.75rem;
    margin-bottom: 1.25rem;
  }

  .jb-site-tl__node.is-left .jb-site-tl__card,
  .jb-site-tl__node.is-right .jb-site-tl__card {
    grid-column: 1;
    justify-self: stretch;
    max-width: none;
    text-align: left;
  }

  .jb-site-tl__dot {
    left: 0.65rem;
  }
}
</style>
