<div align="center">

# code-guide

**摸鱼猫泡泡 · 技术文档站**

VuePress + Theme Hope · 记录 Java、Git 与工程实践

[![VuePress](https://img.shields.io/badge/VuePress-next-3eaf7c?logo=vue.js&logoColor=white)](https://vuepress.vuejs.org/)
[![Theme Hope](https://img.shields.io/badge/Theme-Hope-46bd87)](https://theme-hope.vuejs.press/)
[![Site](https://img.shields.io/badge/Site-jiangbyte.cn-0A66C2)](https://jiangbyte.cn)

</div>

Charlie 的个人技术文档站源码，在线阅读：[jiangbyte.cn](https://jiangbyte.cn)

---

## 快速开始

```bash
pnpm install
pnpm docs:dev      # 本地预览
pnpm docs:build    # 构建静态站点
```

## 目录结构

```text
code-guide/
├── docs/                 # 文档源码
│   ├── .vuepress/        # VuePress / Theme Hope 配置与组件
│   ├── posts/            # 笔记（java / git / demo …）
│   ├── about/            # 关于
│   └── index.md          # 首页
├── package.json
└── pnpm-lock.yaml
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm docs:dev` | 开发服务器 |
| `pnpm docs:build` | 生产构建（输出到 `docs/.vuepress/dist`） |
| `pnpm docs:clean-dev` | 清缓存后启动开发服务器 |
