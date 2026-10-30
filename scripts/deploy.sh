#!/usr/bin/env bash
# 构建并 rsync 到远端静态目录。
# 前提：本机 ~/.ssh/config 已配置 Host（默认 jiangbyte）且可用密钥免密登录。
# 密钥 / IP / 用户名不要写进本脚本或提交到仓库。
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# 可通过环境变量覆盖，例如：
#   DEPLOY_SSH_HOST=myserver DEPLOY_REMOTE_DIR=/var/www/html pnpm docs:deploy
SSH_HOST="${DEPLOY_SSH_HOST:-jiangbyte}"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-/opt/nginx-gateway/html}"
DIST_DIR="${DEPLOY_DIST_DIR:-docs/.vuepress/dist}"

if [[ ! -d node_modules ]]; then
  echo "==> pnpm install"
  pnpm install
fi

echo "==> pnpm docs:build"
pnpm docs:build

if [[ ! -d "$DIST_DIR" ]]; then
  echo "error: 构建产物不存在: $DIST_DIR" >&2
  exit 1
fi

# 探测 SSH 别名是否可用（失败时给出配置提示，避免直接卡在密码交互）
if ! ssh -o BatchMode=yes -o ConnectTimeout=8 "$SSH_HOST" "true" 2>/dev/null; then
  cat >&2 <<EOF
error: 无法免密连接到 SSH Host「${SSH_HOST}」。

请在本机配置 ~/.ssh/config，例如：

  Host jiangbyte
      HostName 【服务器 IP】
      User root
      IdentityFile ~/.ssh/【你的私钥】
      IdentitiesOnly yes

并用 ssh-copy-id 把公钥装到服务器后重试。
EOF
  exit 1
fi

echo "==> rsync → ${SSH_HOST}:${REMOTE_DIR}/"
rsync -avz --delete \
  "${DIST_DIR}/" \
  "${SSH_HOST}:${REMOTE_DIR}/"

echo "==> 部署完成"
