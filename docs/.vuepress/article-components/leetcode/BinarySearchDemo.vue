<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

/**
 * 704 闭区间二分逐步演示（文章专用）。
 * 每轮拆成两拍：算出 mid 并比较 → 收缩区间（丢掉半边）。
 */
const props = defineProps({
  nums: {
    type: Array,
    default: () => [-1, 0, 3, 5, 9, 12],
  },
  target: {
    type: Number,
    default: 9,
  },
})

const presets = [
  { label: '示例 1：找 9（能找到）', target: 9 },
  { label: '示例 2：找 2（找不到）', target: 2 },
]

/** @typedef {'idle' | 'compare' | 'shrink' | 'found' | 'miss'} Phase */

const values = computed(() => props.nums.map((n) => Number(n)))
const target = ref(props.target)
const left = ref(0)
const right = ref(0)
const mid = ref(null)
/** 上一拍比较结果：'eq' | 'lt' | 'gt' | null */
const cmp = ref(null)
/** 即将被丢掉的一侧：'left-half' | 'right-half' | null */
const discard = ref(null)
const phase = ref(/** @type {Phase} */ ('idle'))
const round = ref(0)
const playing = ref(false)
const logs = ref(/** @type {string[]} */ ([]))

let timer = null

const n = computed(() => values.value.length)
const midExpr = computed(() => {
  if (mid.value === null) return ''
  return `${left.value} + ⌊(${right.value} − ${left.value}) / 2⌋ = ${mid.value}`
})
const midVal = computed(() =>
  mid.value === null ? null : values.value[mid.value],
)
const titleText = computed(() => {
  if (phase.value === 'idle') {
    return `目标：在升序数组里查找 ${target.value}`
  }
  if (phase.value === 'compare') {
    return `第 ${round.value} 轮 · 取出中点，和目标比大小`
  }
  if (phase.value === 'shrink') {
    return cmp.value === 'lt'
      ? `第 ${round.value} 轮 · 中点偏小，丢掉左半段（含 mid）`
      : `第 ${round.value} 轮 · 中点偏大，丢掉右半段（含 mid）`
  }
  if (phase.value === 'found') {
    return `结束：找到了，下标是 ${mid.value}`
  }
  return '结束：区间空了，返回 -1'
})
const detailText = computed(() => {
  if (phase.value === 'idle') {
    return `闭区间 [left, right] = [0, ${n.value - 1}]。点「下一步」开始第 1 轮。`
  }
  if (phase.value === 'compare' && mid.value !== null) {
    const v = midVal.value
    if (v === target.value) {
      return `nums[${mid.value}] = ${v}，正好等于 target ${target.value} → 直接返回 ${mid.value}`
    }
    if (v < target.value) {
      return `nums[${mid.value}] = ${v} < target ${target.value} → 答案只可能在更右边`
    }
    return `nums[${mid.value}] = ${v} > target ${target.value} → 答案只可能在更左边`
  }
  if (phase.value === 'shrink') {
    if (cmp.value === 'lt') {
      return `令 left = mid + 1 = ${mid.value} + 1 = ${left.value}，新区间 [${left.value}, ${right.value}]`
    }
    return `令 right = mid − 1 = ${mid.value} − 1 = ${right.value}，新区间 [${left.value}, ${right.value}]`
  }
  if (phase.value === 'found') {
    return `nums[${mid.value}] = ${midVal.value} == ${target.value}`
  }
  return `left = ${left.value} > right = ${right.value}，没有数可查了`
})
const finished = computed(
  () => phase.value === 'found' || phase.value === 'miss',
)

function clearTimer() {
  if (timer != null) {
    window.clearInterval(timer)
    timer = null
  }
}

function pushLog(line) {
  logs.value = [line, ...logs.value].slice(0, 8)
}

function reset() {
  clearTimer()
  playing.value = false
  left.value = 0
  right.value = Math.max(0, n.value - 1)
  mid.value = null
  cmp.value = null
  discard.value = null
  phase.value = 'idle'
  round.value = 0
  logs.value = [`准备：查找 ${target.value}，区间 [0, ${n.value - 1}]`]
}

function cellState(index) {
  if (phase.value === 'found' && index === mid.value) return 'found'
  if (phase.value === 'miss') return 'out'

  // 1. 收缩拍优先标「本步丢掉的半边」（此时 left/right 已更新，不能先按新区间判 out）
  if (phase.value === 'shrink' && mid.value !== null) {
    if (discard.value === 'left-half' && index <= mid.value) return 'discard'
    if (discard.value === 'right-half' && index >= mid.value) return 'discard'
  }

  // 2. 不在当前候选区间内：已排除
  if (index < left.value || index > right.value) return 'out'

  if (index === mid.value && phase.value === 'compare') return 'mid'
  if (index === left.value && index === right.value) return 'both'
  if (index === left.value) return 'left'
  if (index === right.value) return 'right'
  return 'in'
}

function markerText(index) {
  const tags = []
  if (index === left.value && !finished.value) tags.push('left')
  if (index === mid.value && phase.value !== 'idle') tags.push('mid')
  if (index === right.value && !finished.value) tags.push('right')
  return tags.join(' · ')
}

/**
 * 推进一拍：idle/shrink → compare；compare → shrink/found；空区间 → miss。
 */
function stepOnce() {
  if (finished.value) return

  // 1. 从空闲或上一轮收缩后进入「取中点比较」
  if (phase.value === 'idle' || phase.value === 'shrink') {
    if (left.value > right.value) {
      phase.value = 'miss'
      mid.value = null
      cmp.value = null
      discard.value = null
      pushLog(`区间空（left=${left.value} > right=${right.value}）→ 返回 -1`)
      playing.value = false
      clearTimer()
      return
    }
    round.value += 1
    const m = left.value + Math.floor((right.value - left.value) / 2)
    mid.value = m
    const v = values.value[m]
    discard.value = null
    phase.value = 'compare'
    if (v === target.value) {
      cmp.value = 'eq'
      pushLog(
        `第 ${round.value} 轮：mid=${m}，nums[mid]=${v} == ${target.value} → 命中`,
      )
    } else if (v < target.value) {
      cmp.value = 'lt'
      pushLog(
        `第 ${round.value} 轮：mid=${m}，nums[mid]=${v} < ${target.value} → 偏小`,
      )
    } else {
      cmp.value = 'gt'
      pushLog(
        `第 ${round.value} 轮：mid=${m}，nums[mid]=${v} > ${target.value} → 偏大`,
      )
    }
    return
  }

  // 2. 比较拍之后：命中则结束，否则进入收缩拍并真正改 left/right
  if (phase.value === 'compare') {
    if (cmp.value === 'eq') {
      phase.value = 'found'
      playing.value = false
      clearTimer()
      return
    }
    phase.value = 'shrink'
    if (cmp.value === 'lt') {
      discard.value = 'left-half'
      left.value = mid.value + 1
      pushLog(
        `丢掉下标 0..${mid.value}，left ← ${left.value}，区间变成 [${left.value}, ${right.value}]`,
      )
    } else {
      discard.value = 'right-half'
      right.value = mid.value - 1
      pushLog(
        `丢掉下标 ${mid.value}..${n.value - 1}，right ← ${right.value}，区间变成 [${left.value}, ${right.value}]`,
      )
    }
  }
}

function play() {
  if (finished.value) reset()
  if (playing.value) return
  playing.value = true
  stepOnce()
  timer = window.setInterval(() => {
    if (!playing.value || finished.value) {
      clearTimer()
      playing.value = false
      return
    }
    stepOnce()
  }, 1400)
}

function pause() {
  playing.value = false
  clearTimer()
}

function onPresetChange(event) {
  target.value = Number(event.target.value)
  reset()
}

watch(
  () => props.target,
  (v) => {
    target.value = v
    reset()
  },
)

onBeforeUnmount(() => clearTimer())
reset()
</script>

<template>
  <div class="bsd">
    <div class="bsd__goal">
      <div class="bsd__goal-main">
        <span class="bsd__goal-k">要找的数</span>
        <span class="bsd__goal-v">{{ target }}</span>
      </div>
      <label class="bsd__preset">
        切换示例
        <select :value="target" @change="onPresetChange">
          <option
            v-for="item in presets"
            :key="item.target"
            :value="item.target"
          >
            {{ item.label }}
          </option>
        </select>
      </label>
    </div>

    <div class="bsd__phase">
      <strong>{{ titleText }}</strong>
      <p>{{ detailText }}</p>
      <p v-if="phase === 'compare' || phase === 'shrink'" class="bsd__formula">
        mid 计算公式：
        <code>left + (right - left) / 2</code>
        →
        <code>{{ midExpr }}</code>
      </p>
    </div>

    <div class="bsd__compare" v-if="phase === 'compare' || phase === 'shrink' || phase === 'found'">
      <div class="bsd__chip">
        <span class="bsd__chip-k">nums[mid]</span>
        <span class="bsd__chip-v">{{ midVal }}</span>
      </div>
      <div class="bsd__op" :class="'is-' + (cmp || 'eq')">
        <template v-if="cmp === 'eq'">=</template>
        <template v-else-if="cmp === 'lt'">&lt;</template>
        <template v-else-if="cmp === 'gt'">&gt;</template>
        <template v-else>?</template>
      </div>
      <div class="bsd__chip bsd__chip--target">
        <span class="bsd__chip-k">target</span>
        <span class="bsd__chip-v">{{ target }}</span>
      </div>
      <div class="bsd__hint" v-if="cmp === 'lt'">→ 去右边找</div>
      <div class="bsd__hint" v-else-if="cmp === 'gt'">→ 去左边找</div>
      <div class="bsd__hint bsd__hint--ok" v-else-if="cmp === 'eq'">→ 找到了</div>
    </div>

    <div class="bsd__range">
      当前候选区间
      <code>[left, right] = [{{ left }}, {{ right }}]</code>
      <template v-if="left <= right">
        （一共 {{ right - left + 1 }} 个数）
      </template>
      <template v-else>（已空）</template>
    </div>

    <div class="bsd__array" role="list">
      <div
        v-for="(value, index) in values"
        :key="index"
        class="bsd__cell"
        :class="'is-' + cellState(index)"
        role="listitem"
      >
        <div class="bsd__markers">{{ markerText(index) || '\u00a0' }}</div>
        <div class="bsd__value">{{ value }}</div>
        <div class="bsd__index">下标 {{ index }}</div>
      </div>
    </div>

    <div class="bsd__actions">
      <button
        type="button"
        class="bsd__btn bsd__btn--primary"
        :disabled="playing"
        @click="play"
      >
        自动播放
      </button>
      <button type="button" class="bsd__btn" :disabled="!playing" @click="pause">
        暂停
      </button>
      <button
        type="button"
        class="bsd__btn bsd__btn--accent"
        :disabled="playing || finished"
        @click="stepOnce"
      >
        下一步（推荐）
      </button>
      <button type="button" class="bsd__btn" @click="reset">重置</button>
    </div>

    <div class="bsd__legend">
      <span><i class="bsd__dot is-left" /> left 左边界</span>
      <span><i class="bsd__dot is-mid" /> mid 中点</span>
      <span><i class="bsd__dot is-right" /> right 右边界</span>
      <span><i class="bsd__dot is-in" /> 还在查的区间</span>
      <span><i class="bsd__dot is-discard" /> 本步要丢掉</span>
      <span><i class="bsd__dot is-out" /> 已经排除</span>
      <span><i class="bsd__dot is-found" /> 命中</span>
    </div>

    <div class="bsd__log">
      <div class="bsd__log-title">步骤记录（最新在上）</div>
      <ol>
        <li v-for="(line, i) in logs" :key="i">{{ line }}</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.bsd {
  margin: 1.25rem 0 1.75rem;
  padding: 1.1rem 1.15rem 1.2rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  background: var(--vp-c-bg-alt);
}

.bsd__goal {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}

.bsd__goal-main {
  display: inline-flex;
  align-items: baseline;
  gap: 0.55rem;
}

.bsd__goal-k {
  font-size: 0.92rem;
  color: #6a5644;
}

.bsd__goal-v {
  font-size: 1.65rem;
  font-weight: 750;
  color: var(--vp-c-accent);
  line-height: 1;
}

.bsd__preset {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  color: #5c4a3a;
}

.bsd__preset select {
  border: 1px solid #e0cbb5;
  border-radius: 6px;
  padding: 0.28rem 0.5rem;
  background: #fff;
}

.bsd__phase {
  margin-bottom: 0.85rem;
  padding: 0.75rem 0.85rem;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #f0e2d3;
}

.bsd__phase strong {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 1.02rem;
  color: #2f241c;
}

.bsd__phase p {
  margin: 0;
  color: #5c4a3a;
  line-height: 1.55;
  font-size: 0.94rem;
}

.bsd__formula {
  margin-top: 0.45rem !important;
  font-size: 0.88rem !important;
}

.bsd__formula code {
  font-size: 0.86rem;
}

.bsd__compare {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem 0.7rem;
  margin-bottom: 0.85rem;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  background: #fff7ee;
  border: 1px dashed #e8c49a;
}

.bsd__chip {
  display: flex;
  flex-direction: column;
  min-width: 4.5rem;
  padding: 0.35rem 0.55rem;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e7d3bc;
}

.bsd__chip--target {
  border-color: var(--vp-c-accent);
}

.bsd__chip-k {
  font-size: 0.72rem;
  color: #8a7460;
}

.bsd__chip-v {
  font-size: 1.25rem;
  font-weight: 750;
  color: #2f241c;
  font-variant-numeric: tabular-nums;
}

.bsd__op {
  min-width: 2rem;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 800;
  color: #6b7280;
}

.bsd__op.is-eq {
  color: #16a34a;
}

.bsd__op.is-lt,
.bsd__op.is-gt {
  color: #c2410c;
}

.bsd__hint {
  font-size: 0.92rem;
  font-weight: 650;
  color: #9a3412;
}

.bsd__hint--ok {
  color: #15803d;
}

.bsd__range {
  margin-bottom: 0.7rem;
  font-size: 0.9rem;
  color: #5c4a3a;
}

.bsd__range code {
  margin: 0 0.2rem;
  font-size: 0.88rem;
}

.bsd__array {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-bottom: 0.95rem;
}

.bsd__cell {
  flex: 0 0 auto;
  width: 4.4rem;
  padding: 0.35rem 0.3rem 0.45rem;
  border: 2px solid #e5d3c0;
  border-radius: 10px;
  background: #fff;
  text-align: center;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
}

.bsd__markers {
  min-height: 1.05rem;
  margin-bottom: 0.15rem;
  font-size: 0.68rem;
  font-weight: 700;
  color: #9a8572;
  letter-spacing: 0.01em;
}

.bsd__value {
  font-size: 1.2rem;
  font-weight: 750;
  color: #2f241c;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.bsd__index {
  margin-top: 0.2rem;
  font-size: 0.72rem;
  color: #9a8572;
}

.bsd__cell.is-in {
  background: #fff7ee;
  border-color: #f0c89a;
}

.bsd__cell.is-left {
  background: #eff6ff;
  border-color: #3b82f6;
}

.bsd__cell.is-left .bsd__markers {
  color: #1d4ed8;
}

.bsd__cell.is-right {
  background: #f5f3ff;
  border-color: #8b5cf6;
}

.bsd__cell.is-right .bsd__markers {
  color: #6d28d9;
}

.bsd__cell.is-both {
  background: #eef2ff;
  border-color: #6366f1;
}

.bsd__cell.is-mid {
  background: var(--vp-c-accent-soft);
  border-color: var(--vp-c-accent);
  transform: translateY(-3px);
  box-shadow: 0 6px 14px color-mix(in srgb, var(--vp-c-accent) 22%, transparent);
}

.bsd__cell.is-mid .bsd__markers {
  color: var(--vp-c-accent);
}

.bsd__cell.is-discard {
  background: #fee2e2;
  border-color: #f87171;
  opacity: 0.85;
}

.bsd__cell.is-discard .bsd__markers {
  color: #b91c1c;
}

.bsd__cell.is-out {
  opacity: 0.32;
  filter: grayscale(0.35);
}

.bsd__cell.is-found {
  background: #ecfdf3;
  border-color: #16a34a;
  box-shadow: 0 6px 14px rgb(22 163 74 / 18%);
}

.bsd__cell.is-found .bsd__markers {
  color: #15803d;
}

.bsd__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.85rem;
}

.bsd__btn {
  border: 1px solid #e0cbb5;
  border-radius: 6px;
  padding: 0.38rem 0.75rem;
  background: #fff;
  color: #4a3b2d;
  font-size: 0.88rem;
  cursor: pointer;
}

.bsd__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bsd__btn--primary {
  border-color: var(--vp-c-accent);
  background: var(--vp-c-accent);
  color: #fff;
}

.bsd__btn--accent {
  border-color: #c2410c;
  background: #fff7ed;
  color: #9a3412;
  font-weight: 650;
}

.bsd__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.85rem;
  margin-bottom: 0.85rem;
  font-size: 0.78rem;
  color: #7a6756;
}

.bsd__legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
}

.bsd__dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 2px;
  border: 1px solid #ccc;
  background: #eee;
}

.bsd__dot.is-left {
  background: #eff6ff;
  border-color: #3b82f6;
}

.bsd__dot.is-mid {
  background: var(--vp-c-accent-soft);
  border-color: var(--vp-c-accent);
}

.bsd__dot.is-right {
  background: #f5f3ff;
  border-color: #8b5cf6;
}

.bsd__dot.is-in {
  background: #fff7ee;
  border-color: #f0c89a;
}

.bsd__dot.is-discard {
  background: #fee2e2;
  border-color: #f87171;
}

.bsd__dot.is-out {
  background: #eee;
  border-color: #ccc;
  opacity: 0.7;
}

.bsd__dot.is-found {
  background: #ecfdf3;
  border-color: #16a34a;
}

.bsd__log {
  padding: 0.7rem 0.8rem;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #f0e2d3;
}

.bsd__log-title {
  margin-bottom: 0.35rem;
  font-size: 0.84rem;
  font-weight: 650;
  color: #5c4a3a;
}

.bsd__log ol {
  margin: 0;
  padding-left: 1.15rem;
  color: #5c4a3a;
  font-size: 0.86rem;
  line-height: 1.55;
}

.bsd__log li + li {
  margin-top: 0.15rem;
}

@media (max-width: 640px) {
  .bsd__cell {
    width: 3.8rem;
  }

  .bsd__goal-v {
    font-size: 1.4rem;
  }
}
</style>
