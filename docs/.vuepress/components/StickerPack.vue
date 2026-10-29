<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
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

export interface StickerItem {
  id: string
  name: string
  status: string
  src: string
}

const props = withDefaults(
  defineProps<{
    /** 面板无障碍名称 */
    label?: string
    /** 自定义条目；不传则用默认 Q 版表情包 */
    items?: StickerItem[]
  }>(),
  {
    label: '泡泡 Q 版表情包',
  },
)

const defaultStickers: StickerItem[] = [
  { id: 'pose', name: '元气', status: '举手比耶，站点 Logo 同款', src: mascotPose },
  { id: 'idle', name: '乖乖', status: '站得端正的日常造型', src: mascotIdle },
  { id: 'wave', name: '打招呼', status: '挥手问好，路过先卖个萌', src: mascotWave },
  { id: 'think', name: '想一想', status: '歪头思考，笔记还差哪一句', src: mascotThink },
  { id: 'yawn', name: '摸鱼中', status: '打个小呵欠，摸鱼也不耽误可爱', src: mascotYawn },
  { id: 'cheer', name: '搞定啦', status: '双臂举起，构建成功就这样嗨', src: mascotCheer },
  { id: 'sit', name: '坐好', status: '乖乖坐着，等人来翻文档', src: mascotSit },
  { id: 'read', name: '记笔记', status: '捧着小本本，边看边记', src: mascotRead },
  { id: 'code', name: '敲代码', status: '大圆眼镜 + 小电脑，进入专注态', src: mascotCode },
  { id: 'crash', name: '宕机了', status: '脑子烧干，服务暂时不可用', src: mascotCrash },
]

const stickers = computed(() =>
  props.items?.length ? props.items : defaultStickers,
)

const preview = ref<StickerItem | null>(null)

/** 点击格子直接打开全屏预览 */
function openPreview(item: StickerItem) {
  preview.value = item
}

function closePreview() {
  preview.value = null
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closePreview()
}

watch(preview, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="jb-stickers">
    <div class="jb-stickers__panel" role="list" :aria-label="label">
      <button
        v-for="item in stickers"
        :key="item.id"
        type="button"
        class="jb-stickers__cell"
        role="listitem"
        :title="`${item.name} · ${item.status}`"
        :aria-label="`预览 ${item.name}`"
        @click="openPreview(item)"
      >
        <img
          class="jb-stickers__thumb"
          :src="item.src"
          :alt="item.name"
          width="96"
          height="96"
          draggable="false"
          loading="lazy"
        />
        <span class="jb-stickers__name">{{ item.name }}</span>
        <span class="jb-stickers__status">{{ item.status }}</span>
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="preview"
        class="jb-stickers__lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="`预览 ${preview.name}`"
        @click.self="closePreview"
      >
        <div class="jb-stickers__lightbox-card">
          <img
            class="jb-stickers__lightbox-img"
            :src="preview.src"
            :alt="preview.name"
            width="360"
            height="360"
            draggable="false"
          />
          <div class="jb-stickers__lightbox-meta">
            <strong>{{ preview.name }}</strong>
            <span>{{ preview.status }}</span>
            <span class="jb-stickers__lightbox-tip">右键 / 长按图片可保存 · 点击空白处或 Esc 关闭</span>
          </div>
          <button
            type="button"
            class="jb-stickers__lightbox-close"
            aria-label="关闭预览"
            @click="closePreview"
          >
            ×
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
