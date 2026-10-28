---
title: "Debian13-GNOME安装Fcitx5-Rime简体拼音"
date: 2026-10-01
description: "记录时间：2026-10-26"
category: Ops
tag: [Ops, debian-dev-box]
cover: "https://t.alcy.cc/fj?u=9bc24353"
---
# Debian 13 GNOME 安装 Fcitx5 + Rime（简体拼音）并登录自启

记录时间：2026-10-26

环境：Debian 13 (trixie) · GNOME · X11（`gnome-xorg`）  
目标：Fcitx5 + Rime，默认方案 `luna_pinyin_simp`（月拼音·简体），登录自动启动。

原先系统是 IBus + `ibus-libpinyin`。不卸载 IBus（GNOME 有依赖），改用 `im-config` 切到 Fcitx5。

---

## 1. 安装软件包

```bash
sudo apt update
sudo apt install -y \
  fcitx5 \
  fcitx5-rime \
  fcitx5-config-qt \
  fcitx5-frontend-all \
  rime-data-luna-pinyin \
  rime-prelude \
  rime-essay
```

本次实际装上的关键版本：

| 包 | 版本 |
| --- | --- |
| fcitx5 | 5.1.12-2 |
| fcitx5-rime | 5.1.10-2 |
| rime-data-luna-pinyin | 0.0~git20250412.781ba52-1 |

`fcitx5-frontend-all` 会带上 GTK3/4、Qt5/6 前端。`rime-data-luna-pinyin` 提供 `luna_pinyin_simp` 方案文件（`/usr/share/rime-data/luna_pinyin_simp.schema.yaml`）。

---

## 2. 设为默认输入法（登录自启）

```bash
im-config -n fcitx5
```

会生成 `~/.xinputrc`：

```bash
# im-config(8) generated on Mon, 26 Oct 2026 23:12:17 +0800
run_im fcitx5
```

登录时由系统已有的 `/etc/xdg/autostart/im-launch.desktop` 执行 `im-launch`，进而：

- 启动 `fcitx5 -d`
- 设置环境变量：`GTK_IM_MODULE=fcitx`、`QT_IM_MODULE=fcitx`、`XMODIFIERS=@im=fcitx` 等

不必再手写 `~/.config/autostart` 或 systemd user 服务。

---

## 3. 启用 Rime 输入法

用户配置：`~/.config/fcitx5/profile`

注意：Rime 插件是 `OnDemand`。只手写 profile 再启动时，Fcitx5 可能认不出 `rime` 并把条目丢掉。稳妥做法是启动 Fcitx5 后，用 dbus 写入输入法组并 Save。

```bash
export DISPLAY=:0
fcitx5 -d

gdbus call --session --dest org.fcitx.Fcitx5 --object-path /controller \
  --method org.fcitx.Fcitx.Controller1.SetInputMethodGroupInfo \
  "Default" "us" "[('keyboard-us',''),('rime','')]"

gdbus call --session --dest org.fcitx.Fcitx5 --object-path /controller \
  --method org.fcitx.Fcitx.Controller1.Save
```

也可用图形工具：`fcitx5-configtool`，添加「中州韵」。

最终 profile 内容：

```ini
[Groups/0]
Name=Default
Default Layout=us
DefaultIM=rime

[Groups/0/Items/0]
Name=keyboard-us
Layout=

[Groups/0/Items/1]
Name=rime
Layout=

[GroupOrder]
0=Default
```

切换快捷键保持 Fcitx5 默认（常见为 Ctrl+Space）。

---

## 4. 默认简体拼音方案

用户目录：`~/.local/share/fcitx5/rime/`

写入 `default.custom.yaml`：

```yaml
patch:
  schema_list:
    - schema: luna_pinyin_simp
```

部署 / 重载：

```bash
fcitx5-remote -r
# 或切到 Rime 后按 F4 选「重新部署」
```

部署后可在 `~/.local/share/fcitx5/rime/build/default.yaml` 里看到 `schema_list` 只剩 `luna_pinyin_simp`。

---

## 5. 生效与验证

**必须注销再登录**（或重启）。只重启 `fcitx5` 不够，环境变量不会进已有 GUI 进程。

登录后检查：

```bash
echo $GTK_IM_MODULE $QT_IM_MODULE $XMODIFIERS
# 期望: fcitx fcitx @im=fcitx

ps -C fcitx5 -o pid,cmd
fcitx5-remote -n   # 切到中州韵后应为 rime
```

文本框里切到 Rime，拼音应出简体候选。

可选：GNOME「设置 → 键盘 → 输入源」里若还有 IBus 中文源，删掉以免抢快捷键；英文键盘可保留。

---

## 关键路径速查

| 用途 | 路径 |
| --- | --- |
| im-config 选择 | `~/.xinputrc` |
| Fcitx5 输入法组 | `~/.config/fcitx5/profile` |
| Rime 用户配置 | `~/.local/share/fcitx5/rime/` |
| Rime 简体补丁 | `~/.local/share/fcitx5/rime/default.custom.yaml` |
| 系统方案数据 | `/usr/share/rime-data/` |
| 登录拉起 IM | `/etc/xdg/autostart/im-launch.desktop` |

---

## 踩坑

1. **手写 profile 被冲掉**：Rime 是按需加载。第一次应先起 `fcitx5`，再用 `fcitx5-configtool` 或 dbus `SetInputMethodGroupInfo` + `Save` 加入 `rime`，之后重启才会 `Loaded addon rime` 并保留 profile。
2. **与 IBus 并存**：当前会话里部分应用仍可能走 IBus 前端；注销登录并让 `im-config` 接管环境变量后，以 Fcitx5 为准。
3. **非交互 sudo**：终端无 TTY 时可用 `pkexec apt install ...` 走图形提权。
