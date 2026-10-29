---
title: About Me
description: About Charlie — AI full-stack engineer who also writes notes.
icon: account
---

# About Me

Hi, I'm **Charlie**.

I live in Kaili, Qiandongnan, Guizhou. After graduating with a bachelor's degree in Computer Science and Technology, I started working as an AI full-stack engineer. In my spare time I maintain Moyu Cat Bubble, collecting tools I use, debugging notes, and project takeaways.

### Focus

AI full-stack work: wiring LLM capabilities into products (chat assistants, RAG knowledge bases, Tools / Agent orchestration), and owning UI, APIs, data, and deployment end to end. On the tooling side I use Cursor, Codex, Workbuddy, and similar; models I reach for often include Claude, DeepSeek, and Qwen — always with human review before merge.

### Experience

**2026.03 – Present · AI Full-Stack**

Joined to ship full-stack features across large-file media pipelines, ERP, distributed booking/fulfillment, and an internal RAG knowledge base:

- **Large-file upload**: adaptive chunking, concurrent upload, and resumable transfer for long sync uploads; session state in cache, objects written straight to object storage, with end-to-end integrity checks.
- **Async media processing**: probe / remux / transcode as queue jobs consumed by dedicated workers; multi-node competing consumers with lease-based mutex so the same file is not processed twice.
- **Unified storage & delivery**: a storage interface layer that hides local vs cloud object storage; backend switches by config; permission model and doc drive; container and bare-metal deploy, horizontal scale at the app layer.
- **ERP**: requirements, prototypes/UI, and front/back implementation for master data, document flow, inventory/settlement, and reports; query filters, validation, integration, and launch follow-through.
- **Distributed booking & fulfillment**: onboarding → order → dispatch → fulfillment; hot list queries tuned with plans and composite indexes; idempotent payment callbacks; AI-assisted consulting / Q&A; PRD/prototype ownership through integration.
- **Internal RAG knowledge base**: Spring AI multi-kb management and file ingest (object storage for originals, metadata DB, parse/chunk, vector store); chat with session memory, per-kb retrieval, and streaming; Tools wrappers for in-product queries, human review before merge.

**2025.07 – 2025.11 · Platform Engineering (Internship)**

Iterated and hardened provincial / prefecture-level platforms spanning monitoring/alerting and public services:

- **Serial numbers & consistency**: cache atomic counters for unique, continuous IDs under concurrency.
- **Risk scoring**: documented and implemented the algorithm framework; parallelized device-data scoring; protocol adapters and secondary transform before persist.
- **Data quality**: traced dirty data from bad business codes, fixed and re-integrated so bad payloads stop upstream.
- **Complex queries & indexes**: dynamic predicates for nested OR, time ranges, and fuzzy match; covering indexes guided by execution plans.
- **Regional policy & dedupe**: scope by jurisdiction; cache-backed dedupe with batch stats.
- **Mini-program integration**: UI-aligned interactions and APIs through joint test and acceptance.

**2024.08 – 2025.09 · Coding Practice Platform (Lead)**

Campus multi-language practice system (Java / Go / Python, …) with AI tutoring and plagiarism detection; owned overall delivery and core modules:

- **Short links for reports**: MurmurHash3 + Base62 short codes with Redis for collision handling and lookup.
- **Similarity service**: pairwise similarity as a Go microservice; Redis queue + multi-goroutine consumers to raise throughput without burdening the main app.
- **Idempotent submit API**: Redis + Spring AOP guard so one business key applies once.
- **Multi-language lexers**: strategy + factory for parsers; ThreadLocal isolation and ConcurrentHashMap reuse under concurrency.
- **Smart tutoring**: Spring AI + RAG over problem/rule docs; custom Tools for lookup and code analysis; structured learning feedback per session.

### Stack

- **Languages**: Java, Python, Go
- **Backend**: Spring Boot / Cloud, MyBatis-Plus, FastAPI; JUC, JVM basics
- **Data**: MySQL, Redis; object storage, message queues
- **Frontend**: TypeScript, Vue 3, Vite, Pinia
- **Engineering**: Docker / Compose, Git, Jenkins; requirements → design → build → release
- **AI**:
  - Tools: Cursor, Codex, Workbuddy
  - Models: Claude, DeepSeek, Qwen, and others
  - Engineering: Spring AI, RAG, Tools / Agent; human review before merge

### Timeline

- Sep 2022 – Jun 2026: B.S. Computer Science and Technology, Kaili University
- Aug 2024 – Sep 2025: Led the campus coding practice platform
- Jul 2025 – Nov 2025: Provincial / prefecture platform internship
- Mar 2026 – Present: AI full-stack; spare-time work on Moyu Cat Bubble, GitHub, and Juejin

### Contact

- WeChat: `jiang_byte` (note “摸鱼猫泡泡”)
- Email: [jiangbytebiz@163.com](mailto:jiangbytebiz@163.com)
- GitHub: [jiangbyte](https://github.com/jiangbyte)
- Juejin: [juejin.cn](https://juejin.cn/user/1968540037686224)
