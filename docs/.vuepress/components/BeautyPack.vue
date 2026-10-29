<script setup lang="ts">
import StickerPack from './StickerPack.vue'
import beautyPerch from '../../bubble/assets/beauty-modern-perch.png'
import beautyTwirl from '../../bubble/assets/beauty-ruqun-twirl.jpg'
import beautyGlance from '../../bubble/assets/beauty-xianxia-glance.jpg'
import beautySword from '../../bubble/assets/beauty-xianxia-sword.jpg'

const items = [
  {
    id: 'glance',
    name: '回眸',
    status: '仙侠纱襦裙 · 侧身回望',
    src: beautyGlance,
  },
  {
    id: 'twirl',
    name: '旋舞',
    status: '古风纱裙 · 裙摆旋开',
    src: beautyTwirl,
  },
  {
    id: 'sword',
    name: '仗剑',
    status: '仙侠襦裙 · 持剑招手',
    src: beautySword,
  },
  {
    id: 'perch',
    name: '落座',
    status: '默认装 · 侧坐俏皮眨眼',
    src: beautyPerch,
  },
]
</script>

<template>
  <StickerPack label="泡泡美型立绘" :items="items" />
</template>
