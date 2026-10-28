---
title: "Docker Nginx 通用反向代理网关"
date: 2026-10-28
description: "用官方 nginx 镜像做统一入口：只占 80/443，主站静态、子域按需反代，配置挂载、改完 reload，不绑 docker-compose。"
category: Ops
tag: [Ops, nginx, docker, gateway]
cover: "https://t.alcy.cc/fj?u=a1b2c3d4"
---

## 先说场景

一台云主机上会陆续挂多个站点：个人文档站、子域工具、偶尔带前后端的小项目。常见踩坑是：

- 每个项目自己映射 `80/443`，后起的容器起不来
- 有人用 Caddy、有人用 Nginx、有人用云厂商 LB，规则散落
- 改反代要重建镜像，成本高

更稳的做法：**单独起一个通用 Nginx 容器当唯一公网入口**，业务容器只听内网端口；加站只加 `conf.d` 里的文件，然后 `reload`。

本文用官方镜像 + `docker run`（不强制 compose），配置与证书全部挂载宿主机目录，尽量通用。

## 目标形态

```text
Internet
   │
   ▼
:80 / :443  ──►  nginx-gateway（唯一入口）
                    │
                    ├── example.com          → 宿主机静态目录（或静态容器）
                    ├── docs.example.com     → 某静态 / 前端容器
                    └── app.example.com      → 前端容器 + /api → 后端容器
```

约定：

| 角色 | 做法 |
| --- | --- |
| 统一入口 | 一个 `nginx` 容器，独占宿主机 `80/443` |
| 主站 | 多为静态（文档站、官网），可直接 `root` 挂载目录 |
| 子域 `*.example.com` | 一域一个 conf；可纯静态，也可前端 + `/api` |
| 旧入口（Caddy / 另一套 gateway） | 停掉或改掉端口，避免冲突 |

## 目录约定

```bash
BASE=/opt/nginx-gateway   # 也可 ~/deploy/nginx，按习惯改
mkdir -p "$BASE"/{conf.d,certs/example.com,html}
```

| 路径 | 用途 |
| --- | --- |
| `conf.d/` | 站点配置，`*.conf` 会被加载；模板用 `.example` 后缀避免误载 |
| `certs/` | 证书实体文件（不要只软链到容器外路径，见证书篇） |
| `html/` | 主站静态文件、ACME 校验目录 |

## 启动容器

先确保没有其它进程/容器占用 80、443：

```bash
ss -lntp | grep -E ':80|:443' || true
docker ps --format '{{.Names}}\t{{.Ports}}' | grep -E '80|443' || true
```

```bash
docker pull nginx:1.27-alpine

docker rm -f nginx-gateway 2>/dev/null || true

docker run -d \
  --name nginx-gateway \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v "$BASE/conf.d:/etc/nginx/conf.d:ro" \
  -v "$BASE/certs:/etc/nginx/certs:ro" \
  -v "$BASE/html:/usr/share/nginx/html:ro" \
  nginx:1.27-alpine
```

官方镜像主配置已 `include /etc/nginx/conf.d/*.conf;`，一般不用改镜像内 `nginx.conf`。

改配置后：

```bash
docker exec nginx-gateway nginx -t && docker exec nginx-gateway nginx -s reload
```

## 主站：纯静态（不依赖业务容器）

主站若再 `proxy_pass` 到尚未创建的容器名，Nginx **启动阶段解析失败会直接退出**（`Restarting (1)`）。主站优先用本地目录：

```nginx
# conf.d/00-main.conf
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com _;

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
    server_name example.com www.example.com _;

    ssl_certificate     /etc/nginx/certs/example.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/example.com/privkey.pem;
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

占位页（可随后用构建产物覆盖）：

```bash
printf '%s\n' '<!doctype html><title>ok</title><h1>nginx-gateway</h1>' \
  > "$BASE/html/index.html"
```

临时没证书时，可先只保留 `listen 80` 的 `server`，或放自签证（浏览器会告警，仅便于联调）。正式证见同系列《HTTPS 证书》一文。

## 子域模板：可静态，可前后端

模板文件建议命名为 `_subdomain.conf.example`（**不要**以 `.conf` 结尾，否则会被加载且含占位符导致失败）：

```nginx
# 复制为 NAME.conf 后替换 NAME / FE_UPSTREAM；有后端再打开 /api/

server {
    listen 80;
    listen [::]:80;
    server_name NAME.example.com;

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
    server_name NAME.example.com;

    ssl_certificate     /etc/nginx/certs/example.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/example.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache   shared:SSL:10m;
    ssl_protocols       TLSv1.2 TLSv1.3;

    client_max_body_size 50m;

    # ---- 有后端时打开 ----
    # location /api/ {
    #     proxy_pass http://API_UPSTREAM:8000/;
    #     proxy_http_version 1.1;
    #     proxy_set_header Host              $host;
    #     proxy_set_header X-Real-IP         $remote_addr;
    #     proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto $scheme;
    #     proxy_set_header Upgrade           $http_upgrade;
    #     proxy_set_header Connection        $connection_upgrade;
    #     proxy_read_timeout 300s;
    # }

    location / {
        proxy_pass http://FE_UPSTREAM:80/;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        $connection_upgrade;
    }
}
```

加一个子域的标准动作：

```bash
NAME=docs
FE=my-docs-1          # docker ps 里的容器名，或同网络服务名
API=my-api-1          # 可选

cp "$BASE/conf.d/_subdomain.conf.example" "$BASE/conf.d/${NAME}.conf"
sed -i "s/NAME/${NAME}/g; s/FE_UPSTREAM/${FE}/g" "$BASE/conf.d/${NAME}.conf"
# 有 API 时：编辑 conf，取消 /api/ 注释，把 API_UPSTREAM 换成 ${API}

# 上游所在 Docker 网络（名称以 docker network ls 为准）
docker network connect <upstream_network> nginx-gateway 2>/dev/null || true

docker exec nginx-gateway nginx -t && docker exec nginx-gateway nginx -s reload
```

DNS：为 `NAME.example.com` 配 A（或 CNAME 到主域），指向本机公网 IP。

## 与业务容器的网络

Nginx 要用**容器名 / 服务名**反代，必须和上游在同一 Docker 网络：

```bash
docker network ls
docker network connect <network_name> nginx-gateway
docker network inspect <network_name> --format '{{range .Containers}}{{.Name}} {{end}}'
```

注意：

1. **先起上游，再写 `proxy_pass` 并 reload**；否则可能再次因解析失败起不来  
2. 业务容器**不要**再映射公网 80/443；API 可只绑 `127.0.0.1:端口` 或完全不映射  
3. 多套 compose 时，入口容器可 `connect` 多个网络

## 常见故障

| 现象 | 常见原因 |
| --- | --- |
| 容器 `Restarting (1)` | `nginx -t` 失败：缺证书、conf 语法错、`proxy_pass` 主机名解析不到 |
| 改 conf 不生效 | 没 `reload`，或改的是未挂载路径 |
| 502 Bad Gateway | 上游未启动、未同网、端口写错 |
| 只有 IP 能开、域名不行 | DNS 未生效，或 `server_name` 不匹配 |

排障：

```bash
docker logs nginx-gateway --tail 80
docker exec nginx-gateway nginx -t
docker exec nginx-gateway ls -la /etc/nginx/certs/example.com/
curl -sSI http://127.0.0.1/ -H 'Host: example.com' | head
```

## 小结

- 一个官方 Nginx 容器独占 80/443，配置与证书全挂载  
- 主站优先静态目录，避免被未就绪的上游拖死  
- 子域一文件一域名，静态或前后端都能套同一模板  
- 加站 = DNS + conf + `network connect` + `nginx -t && reload`

证书怎么申请、怎么挂进容器、怎么续期，见下一篇。静态站怎么构建发布、怎么做持续部署，见第三篇。
