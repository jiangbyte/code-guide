<script setup>
import { computed } from 'vue'

const props = defineProps({
  bvid: { type: String, default: '' },
  src: { type: String, default: '' },
  page: { type: [String, Number], default: 1 },
})

const embedSrc = computed(() => {
  if (props.src) return props.src
  if (!props.bvid) return ''
  const page = props.page || 1
  return `https://player.bilibili.com/player.html?bvid=${props.bvid}&page=${page}&high_quality=1&danmaku=0`
})
</script>

<template>
  <div v-if="embedSrc" class="jb-video">
    <iframe
      class="jb-video__frame"
      :src="embedSrc"
      loading="lazy"
      allowfullscreen
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    />
  </div>
</template>
