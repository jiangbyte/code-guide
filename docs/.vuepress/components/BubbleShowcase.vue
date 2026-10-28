<script setup lang="ts">
import { computed, ref } from 'vue'
import mascotCheer from '../../bubble/assets/mascot-cheer.png'
import mascotCode from '../../bubble/assets/mascot-code.png'
import mascotCrash from '../../bubble/assets/mascot-crash.png'
import mascotIdle from '../../bubble/assets/mascot-idle.png'
import mascotPose from '../../bubble/assets/mascot-pose.png'
import mascotRead from '../../bubble/assets/mascot-read.png'
import mascotSit from '../../bubble/assets/mascot-sit.png'
import mascotThink from '../../bubble/assets/mascot-think.png'
import mascotWave from '../../bubble/assets/mascot-wave.png'
import mascotYawn from '../../bubble/assets/mascot-yawn.png'

const characters = [
  {
    id: 'pose',
    name: '泡泡 · 元气',
    desc: '举手比耶，站点 Logo 同款。',
    src: mascotPose,
  },
  {
    id: 'idle',
    name: '泡泡 · 乖乖',
    desc: '站得端正的日常造型。',
    src: mascotIdle,
  },
  {
    id: 'wave',
    name: '泡泡 · 打招呼',
    desc: '挥手问好，路过先卖个萌。',
    src: mascotWave,
  },
  {
    id: 'think',
    name: '泡泡 · 想一想',
    desc: '歪头思考，笔记还差哪一句。',
    src: mascotThink,
  },
  {
    id: 'yawn',
    name: '泡泡 · 摸鱼中',
    desc: '打个小呵欠，摸鱼也不耽误可爱。',
    src: mascotYawn,
  },
  {
    id: 'cheer',
    name: '泡泡 · 搞定啦',
    desc: '双臂举起，构建成功就这样嗨。',
    src: mascotCheer,
  },
  {
    id: 'sit',
    name: '泡泡 · 坐好',
    desc: '乖乖坐着，等人来翻文档。',
    src: mascotSit,
  },
  {
    id: 'read',
    name: '泡泡 · 记笔记',
    desc: '捧着小本本，边看边记。',
    src: mascotRead,
  },
  {
    id: 'code',
    name: '泡泡 · 敲代码',
    desc: '大圆眼镜 + 小电脑，进入专注态。',
    src: mascotCode,
  },
  {
    id: 'crash',
    name: '泡泡 · 宕机了',
    desc: '脑子烧干，服务暂时不可用。',
    src: mascotCrash,
  },
] as const

const active = ref(0)
const taps = ref(0)
const tip = ref('戳她切换造型')

const current = computed(() => characters[active.value])

/**
 * 点击大图按顺序切换造型；连点满 5 次换一句互动提示。
 */
function onTap() {
  // 1. 顺序切换全部造型
  active.value = (active.value + 1) % characters.length
  taps.value += 1
  // 2. 连点满 5 次换一句提示
  if (taps.value >= 5 && taps.value % 5 === 0) {
    tip.value = '摸鱼猫泡泡 · 被你戳醒了'
  } else {
    tip.value = `当前：${characters[active.value].name}`
  }
}

function select(index: number) {
  active.value = index
  tip.value = `当前：${characters[index].name}`
}
</script>

<template>
  <div class="jb-bubble">
    <button
      type="button"
      class="jb-bubble__stage"
      :aria-label="`切换造型，当前 ${current.name}`"
      @click="onTap"
    >
      <img
        class="jb-bubble__hero"
        :src="current.src"
        :alt="current.name"
        width="320"
        height="320"
        draggable="false"
      />
      <span class="jb-bubble__hint">{{ tip }}</span>
    </button>

    <ul class="jb-bubble__list" role="list">
      <li v-for="(item, index) in characters" :key="item.id">
        <button
          type="button"
          class="jb-bubble__card"
          :class="{ 'is-active': index === active }"
          @click="select(index)"
        >
          <img
            class="jb-bubble__thumb"
            :src="item.src"
            :alt="item.name"
            width="96"
            height="96"
            draggable="false"
          />
          <span class="jb-bubble__meta">
            <strong>{{ item.name }}</strong>
            <span>{{ item.desc }}</span>
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>
