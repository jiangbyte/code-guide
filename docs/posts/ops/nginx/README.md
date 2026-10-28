---
title: nginx
description: Ops / nginx 笔记：通用 Docker 网关、HTTPS 证书、静态站部署与持续交付。
index: false
dir:
  text: nginx
  collapsible: true
  expanded: true
---

Docker Nginx 统一入口、Let’s Encrypt 证书与静态站点发布相关笔记。建议阅读顺序：网关 → 证书 → 部署 / CI。

文中占位：`【域名】`、`【IP】`、`【邮箱】` 等；每篇文末有「一键脚本」，改顶部几行即可执行。用户统一 `root`，目录统一 `/root/deploy/nginx`。
