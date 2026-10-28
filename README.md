<div align="center">

# code-guide

**摸鱼猫泡泡**

VuePress + Theme Hope · 记录 Java、工具与工程实践

[![VuePress](https://img.shields.io/badge/VuePress-next-3eaf7c?logo=vue.js&logoColor=white)](https://vuepress.vuejs.org/)
[![Theme Hope](https://img.shields.io/badge/Theme-Hope-46bd87)](https://theme-hope.vuejs.press/)
[![Site](https://img.shields.io/badge/Site-jiangbyte.cn-0A66C2)](https://jiangbyte.cn)
[![License: MIT](https://img.shields.io/badge/Code-MIT-yellow.svg)](./LICENSE)

</div>

摸鱼猫泡泡源码，在线阅读：[jiangbyte.cn](https://jiangbyte.cn)

---

## 快速开始

```bash
pnpm install
pnpm docs:dev      # 本地预览
pnpm docs:build    # 构建静态站点
```

DocSearch（可选）：复制 `.env.example` 为 `.env` / `.env.local`，填入 `DOCSEARCH_APP_ID`、`DOCSEARCH_API_KEY`、`DOCSEARCH_INDEX_NAME`。三项齐全时用 Algolia DocSearch，否则回退本地 slimsearch。CI 也可直接注入同名环境变量。

## 许可证

双许可：

- **文档内容**（`docs/` 下 Markdown 与配图等）— 可引用、可改编，须署名并附来源，禁止商用  
  [![CC BY-NC 4.0](https://licensebuttons.net/l/by-nc/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc/4.0/)
  · [全文](./LICENSE-CC-BY-NC-4.0)
- **站点源码**（VuePress 配置、组件、工程文件等）— [MIT](./LICENSE)
