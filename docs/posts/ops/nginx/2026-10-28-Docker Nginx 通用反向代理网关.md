---
title: "Docker Nginx 通用反向代理网关"
date: 2026-10-28
description: "用官方 nginx 镜像做统一入口：只占 80/443，主站静态、子域按需反代；文中用【域名】【IP】占位，文末一键脚本可直接改两行执行。"
category: Ops
tag: [Ops, nginx, docker, gateway]
cover: "https://t.alcy.cc/fj?u=a1b2c3d4"
---

## 占位符

| 写法 | 含义 | 示例 |
| --- | --- | --- |
| `【域名】` | 主站域名 | `docs.example.com` |
| `【IP】` | 服务器公网 IP | `203.0.113.10` |
| `【子域】` | 子域前缀（不含主域） | `docs` → `docs.【域名】` |
| `【前端容器】` | 上游前端 / 静态容器名 | `my-docs-1` |
| `【后端容器】` | 上游 API 容器名 | `my-api-1` |
| `【网络名】` | Docker 网络名 | `docker network ls` 查看 |

下文配置里一律写占位符；真正上机用文末「一键脚本」，只改顶部变量。

## 先说场景

一台云主机上会陆续挂多个站点。常见踩坑：每个项目自己占 `80/443`、入口工具不统一、改反代要重建镜像。

做法：**单独起一个 Nginx 容器当唯一公网入口**，业务只听内网；加站只加 `conf.d`，然后 `reload`。官方镜像 + `docker run`，配置与证书挂宿主机。

## 目标形态

```text
Internet
   │
   ▼
:80 / :443  ──►  nginx-gateway（唯一入口）  【IP】
                    │
                    ├── 【域名】 / www.【域名】     → /root/deploy/nginx/html
                    ├── 【子域】.【域名】           → 【前端容器】（可再 /api → 【后端容器】）
```

| 角色 | 做法 |
| --- | --- |
| 统一入口 | 一个 `nginx` 容器，独占 `80/443` |
| 主站 | 静态目录，不依赖其它容器是否已启动 |
| 子域 | 一域一个 conf；可纯静态或前端 + `/api` |
| 旧入口 | 先停掉，避免抢端口 |

## 目录

```text
/root/deploy/nginx/
├── conf.d/          # *.conf 会被加载；模板用 .example 后缀
├── certs/【域名】/   # fullchain.pem / privkey.pem（实体文件）
└── html/            # 主站静态 + ACME 校验
```

## 主站配置长什么样（对照用）

下面仅作阅读对照；**不要手抄改占位符**，用文末脚本生成。

```nginx
# conf.d/00-main.conf（生成后其中【域名】已是真实域名）
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name 【域名】 www.【域名】 _;

    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name 【域名】 www.【域名】 _;

    ssl_certificate     /etc/nginx/certs/【域名】/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/【域名】/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache   shared:SSL:10m;
    ssl_protocols       TLSv1.2 TLSv1.3;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

要点：主站用本地 `root`，不要 `proxy_pass` 到还不存在的容器名，否则会 `Restarting (1)`。

## 子域模板（对照用）

```nginx
# 【子域】.【域名】 → 【前端容器】；有后端再打开 /api/
server {
    listen 80;
    listen [::]:80;
    server_name 【子域】.【域名】;
    location /.well-known/acme-challenge/ { root /usr/share/nginx/html; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name 【子域】.【域名】;

    ssl_certificate     /etc/nginx/certs/【域名】/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/【域名】/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    client_max_body_size 50m;

    # location /api/ {
    #     proxy_pass http://【后端容器】:8000/;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    #     ...
    # }

    location / {
        proxy_pass http://【前端容器】:80/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

DNS：`【子域】.【域名】` A 记录 → `【IP】`（或 CNAME → `【域名】`）。上游容器先启动，再 `docker network connect 【网络名】 nginx-gateway`，再 reload。

## 常见故障

| 现象 | 原因 |
| --- | --- |
| `Restarting (1)` | 缺证书、conf 错、`proxy_pass` 主机名解析不到 |
| 502 | 上游未起 / 未同网 / 端口错 |
| 只有 IP 能开 | DNS 未指到 `【IP】`，或 `server_name` 不对 |

```bash
docker logs nginx-gateway --tail 80
docker exec nginx-gateway nginx -t
curl -sSI http://127.0.0.1/ -H 'Host: 【域名】' | head
```

## 一键完成（服务器 root 执行）

只改开头三行，整段粘贴：

```bash
#!/usr/bin/env bash
set -euo pipefail

# ========== 只改这里 ==========
DOMAIN='【域名】'    # 例如 docs.example.com
# IP 仅作提示；DNS 请在解析商把 【域名】 A 到 【IP】
IP='【IP】'          # 例如 203.0.113.10
# ==============================

BASE=/root/deploy/nginx
mkdir -p "$BASE"/{conf.d,certs/"$DOMAIN",html}

printf '%s\n' "<!doctype html><title>ok</title><h1>nginx-gateway</h1><p>${DOMAIN}</p>" \
  > "$BASE/html/index.html"

# 临时自签（有正式证后按证书篇覆盖同路径）
if [[ ! -f "$BASE/certs/$DOMAIN/fullchain.pem" ]]; then
  openssl req -x509 -nodes -newkey rsa:2048 -days 30 \
    -keyout "$BASE/certs/$DOMAIN/privkey.pem" \
    -out "$BASE/certs/$DOMAIN/fullchain.pem" \
    -subj "/CN=${DOMAIN}" >/dev/null 2>&1
fi

cat > "$BASE/conf.d/00-main.conf" <<EOF
map \$http_upgrade \$connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN} _;

    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name ${DOMAIN} www.${DOMAIN} _;

    ssl_certificate     /etc/nginx/certs/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/${DOMAIN}/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache   shared:SSL:10m;
    ssl_protocols       TLSv1.2 TLSv1.3;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

cat > "$BASE/conf.d/_subdomain.conf.example" <<EOF
# 用法见下方「加子域一键」；勿改名为 *.conf 除非已替换占位
server {
    listen 80;
    listen [::]:80;
    server_name SUB.${DOMAIN};
    location /.well-known/acme-challenge/ { root /usr/share/nginx/html; }
    location / { return 301 https://\$host\$request_uri; }
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name SUB.${DOMAIN};
    ssl_certificate     /etc/nginx/certs/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/${DOMAIN}/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    client_max_body_size 50m;
    # location /api/ {
    #     proxy_pass http://API_UPSTREAM:8000/;
    #     proxy_set_header Host \$host;
    #     proxy_set_header X-Forwarded-Proto \$scheme;
    # }
    location / {
        proxy_pass http://FE_UPSTREAM:80/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ss -lntp | grep -E ':80 |:443 ' || true
docker stop old-gateway nginx-gateway 2>/dev/null || true
docker rm -f nginx-gateway 2>/dev/null || true
docker pull nginx:1.27-alpine

docker run -d \
  --name nginx-gateway \
  --restart unless-stopped \
  -p 80:80 -p 443:443 \
  -v "$BASE/conf.d:/etc/nginx/conf.d:ro" \
  -v "$BASE/certs:/etc/nginx/certs:ro" \
  -v "$BASE/html:/usr/share/nginx/html:ro" \
  nginx:1.27-alpine

sleep 1
docker exec nginx-gateway nginx -t
docker exec nginx-gateway nginx -s reload

echo
echo "完成。DOMAIN=${DOMAIN}  请确认 DNS: ${DOMAIN} → ${IP}"
echo "目录: ${BASE}"
docker ps --filter name=nginx-gateway --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

### 加子域一键

上游容器已启动后再执行：

```bash
#!/usr/bin/env bash
set -euo pipefail

DOMAIN='【域名】'
SUB='【子域】'           # 如 docs
FE='【前端容器】'        # docker ps 名称
NET='【网络名】'         # 可选，没有就留空 ''
BASE=/root/deploy/nginx

cp "$BASE/conf.d/_subdomain.conf.example" "$BASE/conf.d/${SUB}.conf"
sed -i "s/SUB/${SUB}/g; s/FE_UPSTREAM/${FE}/g" "$BASE/conf.d/${SUB}.conf"

if [[ -n "$NET" ]]; then
  docker network connect "$NET" nginx-gateway 2>/dev/null || true
fi

docker exec nginx-gateway nginx -t && docker exec nginx-gateway nginx -s reload
echo "已启用 https://${SUB}.${DOMAIN}/ → ${FE}"
```

证书申请与挂载见下一篇；静态站发布见第三篇。
