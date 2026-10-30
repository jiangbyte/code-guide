---
title: "VuePress 本机免密部署：SSH 密钥与 rsync"
date: 2026-10-30
description: "为本站配置 SSH Host 别名与部署私钥，配合 scripts/deploy.sh 一键构建并 rsync；记录密钥损坏与 agent 拒签的排障。"
category: Ops
tag: [Ops, nginx, vuepress, deploy, ssh, rsync]
cover: "https://t.alcy.cc/fj?u=e1f2a3b4"
---

## 占位符

| 写法 | 含义 |
| --- | --- |
| `【IP】` | 服务器公网 IP |
| `【SSH Host】` | 本机 `~/.ssh/config` 里的别名，如 `jiangbyte` |
| `【私钥】` | 本机私钥路径，如 `~/.ssh/id_ed25519.jiangbyte` |
| `【远端 html】` | 网关静态目录，如 `/opt/nginx-gateway/html` 或 `/root/deploy/nginx/html` |

通用背景与多种发版方式见 [静态站点部署与持续交付](./2026-10-28-静态站点部署与持续交付.md)。本文只记：**本机密钥免密 + 仓库内部署脚本**。

## 目标

每次发版不想输 root 密码，也不把 IP / 私钥写进公开仓库。做法是：

1. 本机单独一把部署密钥  
2. `~/.ssh/config` 用 Host 别名指向服务器  
3. 仓库里只保留 `pnpm docs:deploy`（内部 `rsync` 到别名）

## 1. 生成部署密钥

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519.jiangbyte -C "deploy-jiangbyte" -N ""
```

- `-N ""`：私钥无口令，方便脚本 BatchMode；本机要锁屏、私钥权限 `600`  
- 公钥：`~/.ssh/id_ed25519.jiangbyte.pub`  
- **私钥永远不要提交 Git**

## 2. 公钥装到服务器（只需一次密码）

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.jiangbyte.pub root@【IP】
```

没有 `ssh-copy-id` 时，手动把 `.pub` 内容追加到服务器 `/root/.ssh/authorized_keys`，并保证该目录权限合理（`.ssh` 为 `700`，`authorized_keys` 为 `600`）。

## 3. 本机 SSH 别名

编辑 `~/.ssh/config`（没有 `vim` 可用 `nano` / `cursor`）：

```sshconfig
Host jiangbyte
    HostName 【IP】
    User root
    IdentityFile ~/.ssh/id_ed25519.jiangbyte
    IdentitiesOnly yes
```

`IdentitiesOnly yes` 避免本机密钥太多时先试错别的钥匙，触发 `Too many authentication failures`。

验证：

```bash
ssh 【SSH Host】
# 应直接进入，不再要密码
```

## 4. 仓库部署脚本

本仓脚本：`scripts/deploy.sh`（仓库根目录），`package.json` 入口：

```bash
pnpm docs:deploy
```

等价于：构建 `docs/.vuepress/dist/`，再：

```bash
rsync -avz --delete \
  docs/.vuepress/dist/ \
  【SSH Host】:【远端 html】/
```

脚本默认：

| 变量 | 默认 |
| --- | --- |
| `DEPLOY_SSH_HOST` | `jiangbyte` |
| `DEPLOY_REMOTE_DIR` | `/opt/nginx-gateway/html` |
| `DEPLOY_DIST_DIR` | `docs/.vuepress/dist` |

覆盖示例：

```bash
DEPLOY_REMOTE_DIR=/root/deploy/nginx/html pnpm docs:deploy
```

公开仓库里可以保留该脚本：**不要**写死 IP、密码或私钥内容。别人没有你的 `~/.ssh/config` 与私钥，跑不通。

## 5. 踩坑：私钥文件被写坏

### 现象

- `pnpm docs:deploy` 报：无法免密连接 Host  
- `ssh -v 【SSH Host】` 出现：  
  - `Load key "...": error in libcrypto`  
  - 或 `sign_and_send_pubkey: ... agent refused operation`

### 原因

编辑 `~/.ssh/config` 时误操作，把路径字符串粘进了私钥文件，例如第一行变成：

```text
~/.ssh/config-----BEGIN OPENSSH PRIVATE KEY-----
```

密钥体虽在，OpenSSH / libcrypto 无法解析。

### 处理

```bash
# 看第一行是否被污染
head -1 ~/.ssh/id_ed25519.jiangbyte

# 备份后去掉错误前缀，保证以 -----BEGIN 开头
cp -a ~/.ssh/id_ed25519.jiangbyte ~/.ssh/id_ed25519.jiangbyte.bak
# 用编辑器删掉 BEGIN 前面的垃圾字符，或重新 ssh-keygen + ssh-copy-id

chmod 600 ~/.ssh/id_ed25519.jiangbyte
ssh-keygen -y -f ~/.ssh/id_ed25519.jiangbyte   # 应能打印出与 .pub 一致的公钥
ssh 【SSH Host】 true
```

若 `ssh-agent` 里还挂着坏密钥，可：

```bash
ssh-add -d ~/.ssh/id_ed25519.jiangbyte 2>/dev/null || true
ssh-add ~/.ssh/id_ed25519.jiangbyte
```

## 6. 安全注意

- 私钥、服务器密码、`sshpass`：**禁止**进仓库  
- 脚本里的 Host 别名可以公开；真实 IP 放本机 config  
- `rsync --delete` 会删远端目标目录中多余文件，密钥泄露等于可被清空静态站——管好私钥权限与备份  

## 相关

- [静态站点部署与持续交付](./2026-10-28-静态站点部署与持续交付.md)  
- [Docker Nginx 通用反向代理网关](./2026-10-28-Docker%20Nginx%20通用反向代理网关.md)  
- [VuePress 静态站样式丢失排查与修复](./2026-10-29-VuePress静态站样式丢失排查与修复.md)  
