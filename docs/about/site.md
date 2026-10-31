---
title: 关于本站
description: 关于摸鱼猫泡泡：定位、内容结构、技术选型与许可。
icon: information
---

# 关于本站

**摸鱼猫泡泡**是我自己搭的站点，仓库在 [code-guide](https://github.com/jiangbyte/code-guide)，线上是 [jiangbyte.cn](https://jiangbyte.cn)。用来放技术笔记、项目介绍和一点关于信息，方便以后自己翻，也给路过的人参考。

### 定位

我更想要一份能长期翻的笔记和作品说明，而不是资讯站或动态博客：

- 笔记按系列归档，尽量写清背景、做法和结论
- 项目一文一介绍，写定位、能力和技术栈
- 内容用 Markdown，和站点工程放在同一仓库，改主题、改检索都方便

### 内容结构

- **笔记**（`/posts/`）：按系列看，目前有 Tools、Practice、Embedded、Ops 等
- **源码阅读**（`/source-reading/`）：按语言整理，目前有 Java（JDK 源码解析）
- **数据库**（`/database/`）：目前有 MySQL、Redis
- **考研**（`/kaoyan/`）：计原、计网、数据结构、操作系统，高数、英语，以及考研记录
- **软考**（`/soft-exam/`）：目前有高级架构设计师（系统架构设计师）
- **职场与面试**（`/career/`）：职场工作记录、面试经验
- **项目**（`/projects/`）：开源项目 / 个人项目分组，每篇对应一个作品，侧栏按组列文章
- **时间线**（`/timeline/`）：文章时间线（全站按日期倒序）、站点时间线（纵向事件轴）
- **泡泡**（`/bubble/`）：拟人形象与三视图
- **关于**（`/about/`）：关于自己、关于本站

顶栏可搜页面标题与大纲小节；笔记和项目页有目录、标签和阅读信息，方便定位。

### 技术选型

- 静态站点：[VuePress](https://vuepress.vuejs.org/)（Vite 打包）
- 主题：[VuePress Theme Hope](https://theme-hope.vuejs.press/)
- 内容能力：Markdown 扩展（提示容器、代码块、数学公式等）、Mermaid、全文检索等
- 工程：`pnpm`；本地 `pnpm docs:dev`，构建 `pnpm docs:build`

源码和配置在 GitHub；导航、侧栏和主题相关改动在 `docs/.vuepress/`。

### 更新方式

跟着工作和学习往里补：排查结论、工具用法、项目说明写进对应系列或项目文；样式和组件有需要再小步改。合入前我会本地预览并跑一遍构建。

### 许可

双许可，用内容或源码时请分开看：

- **文档内容**（`docs/` 下 Markdown、配图等）：[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) — 可引用、可改编，须署名并附来源，禁止商用
- **站点源码**（VuePress 配置、组件、工程文件等）：[MIT](https://github.com/jiangbyte/code-guide/blob/main/LICENSE)

### 反馈

有问题、勘误或想交流，走 [关于自己](/about/me.html) 里的联系方式，或直接在 [GitHub](https://github.com/jiangbyte/code-guide) 提 Issue。
