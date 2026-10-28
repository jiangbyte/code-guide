import { defineClientConfig } from 'vuepress/client'
import Bilibili from './components/Bilibili.vue'
import FloatingRail from './components/FloatingRail.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component('Bilibili', Bilibili)
  },
  rootComponents: [FloatingRail],
})
