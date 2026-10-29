---
title: About Site
description: About Moyu Cat Bubble — purpose, structure, stack, and license.
icon: information
---

# About Site

**Moyu Cat Bubble** is my own site. The repo is [code-guide](https://github.com/jiangbyte/code-guide); production is [jiangbyte.cn](https://jiangbyte.cn). It holds technical notes, project write-ups, and a bit of about info — for myself later, and for anyone passing by.

### Purpose

I want a long-lived notebook and portfolio, not a news feed or chatter blog:

- Notes grouped by series, with background, approach, and conclusions
- One article per project: positioning, capabilities, and stack
- Markdown next to the site engineering so theme and search stay easy to change

### Structure

- **Notes** (`/posts/`): series such as Java, Tools, Practice, Embedded, Soft Exam, Ops (Chinese)
- **Projects** (`/projects/`): one page per open-source or personal work (Chinese)
- **Bubble** (`/bubble/`): site persona and poses (Chinese)
- **About** (`/about/` · `/en/about/`): about me and about this site (Chinese & English)

Full-text search is available; notes and project pages include TOC, tags, and reading meta.

### Stack

- Static site: [VuePress](https://vuepress.vuejs.org/) (Vite)
- Theme: [VuePress Theme Hope](https://theme-hope.vuejs.press/)
- Content: Markdown extensions (containers, code blocks, math), Mermaid, full-text search, and more
- Tooling: `pnpm`; local `pnpm docs:dev`, build `pnpm docs:build`

Source and config live on GitHub; nav, sidebar, and theme tweaks sit under `docs/.vuepress/`.

### Updates

I add write-ups as work and study go: debugging conclusions, tool usage, project notes into the matching series. Style and components change in small steps. I preview locally and run a build before merge.

### License

Dual license — treat content and code separately:

- **Documentation** (Markdown and images under `docs/`): [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) — share and adapt with attribution; non-commercial only
- **Site source** (VuePress config, components, build files, etc.): [MIT](https://github.com/jiangbyte/code-guide/blob/main/LICENSE)

### Feedback

Questions, corrections, or chat: use the contacts on [About Me](./me.md), or open an Issue on [GitHub](https://github.com/jiangbyte/code-guide).
