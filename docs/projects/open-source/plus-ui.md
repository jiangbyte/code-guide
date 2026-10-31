---
title: "plus-ui"
date: 2026-09-30
order: 1
description: "RuoYi-Vue-Plus 官方前端 plus-ui 的 Fork：扁平直角 UI 与交互微调，定期合并上游。"
category: Project
tag: [Vue, TypeScript, Element Plus, RuoYi, Fork]
cover: "https://t.alcy.cc/fj?u=b7e4a91c"
---

- 仓库：<https://github.com/jiangbyte/plus-ui>
- 上游：<https://github.com/CrazyLionCat/plus-ui>（`6.X-Vue`）
- 配套后端 Fork：<https://github.com/jiangbyte/RuoYi-Vue-Plus>

**plus-ui** 是 RuoYi-Vue-Plus 官方前端的 Fork。业务能力与技术栈跟官方走，本地主要改 **UI 与部分交互**；上游有更新会合并进来，合并时优先保住本仓样式定制。

## 相对上游的改动

- **视觉**：直角、去渐变、去阴影 / 悬浮抬起，整体更扁
- **布局**：外层留白收紧，桌面列表页更容易撑满可视区
- **表格**：全局超长文本省略；全高表格等细节修过
- **页面**：登录 / 注册 / 首页等与当前风格对齐
- **组件层**：Element Plus 弹窗、下拉、表单高度与边框统一过一轮

业务功能仍以官方为准，不在本 Fork 另开一套后台能力。

## 技术栈

- Vue 3 · TypeScript · Element Plus · Vite
- 包管理：`pnpm install` → `pnpm dev` / `pnpm build:prod`

## 截图

仓库内 `docs/screenshots/` 有登录、用户、角色、菜单等页截图。
