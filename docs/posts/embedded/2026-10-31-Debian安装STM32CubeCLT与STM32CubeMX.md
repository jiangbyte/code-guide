---
title: "Debian 安装 STM32CubeCLT 与 STM32CubeMX"
date: 2026-10-31
description: "在 Debian 13 上从 ST 官方 Linux 包安装 CubeCLT 1.22 与 CubeMX 6.11：解压、接受许可、静默安装、配 PATH，并用 ST-LINK 验证。"
category: 嵌入式
tag: [嵌入式, STM32, CubeCLT, CubeMX]
---

## 目标

在本机 **Debian 13 (trixie) x86_64** 上装好一套可配置、可编译、可烧录的 STM32 环境：

| 组件 | 版本 | 作用 |
|------|------|------|
| STM32CubeCLT | 1.22.0 | GCC 工具链、CMake/Ninja、STM32CubeProgrammer、ST-Link server / udev |
| STM32CubeMX | 6.11.0 | 引脚 / 时钟 / 外设配置与初始化代码生成（自带 Temurin JRE 17） |

本文按实际装机过程整理。安装目录统一放在 `/opt/st/`。相关概念可先看 [STM32概述](./2026-10-31-STM32概述.md)。

> 确认安装即表示接受 ST **SLA0048**（CubeCLT）以及 CubeMX 安装向导中的许可条款。不要在文档或脚本里明文写 sudo 密码。

## 安装前检查

```bash
cat /etc/os-release   # VERSION_CODENAME=trixie
uname -m              # x86_64
groups                # 需有 sudo
echo "$DISPLAY"       # 图形会话一般是 :0；CubeMX 静默装可不依赖 GUI
lsusb | grep -i 0483  # 有板子时可先确认 ST-LINK 是否已插上
```

本次机器上 USB 已识别：

```text
ID 0483:3748 STMicroelectronics ST-LINK/V2
```

磁盘：CLT + MX 解压与安装大约需要 **2GB+**，`/` 分区留足空间即可。

## 准备安装包

从 [ST 官网](https://www.st.com/) 下载 Linux 包（需登录），放到 `~/Downloads`：

```text
stm32cubeclt_1.22-Lin-Deb-x86_64.sh.zip
stm32cubemx-lin-v6-11-0.zip
```

解压到临时目录：

```bash
rm -rf /tmp/stm32-install
mkdir -p /tmp/stm32-install/{clt,mx}

unzip -o ~/Downloads/stm32cubeclt_1.22-Lin-Deb-x86_64.sh.zip \
  -d /tmp/stm32-install/clt

unzip -o ~/Downloads/stm32cubemx-lin-v6-11-0.zip \
  -d /tmp/stm32-install/mx

chmod +x /tmp/stm32-install/clt/*.sh \
         /tmp/stm32-install/mx/SetupSTM32CubeMX-6.11.0
```

CubeCLT 的 `.sh` 是 Makeself 自解压包，内含三个 deb：

- `st-stlink-udev-rules-*.deb`
- `st-stlink-server-*.deb`
- `stm32cubeclt-*.deb` → 最终落在 `/opt/st/stm32cubeclt_1.22.0/`

CubeMX 包内是 `SetupSTM32CubeMX-6.11.0` 安装器 + 捆绑 `jre/`，**不再依赖系统 JDK**。

## 安装 STM32CubeCLT

需要 root。安装器会弹许可协议；自动化时用环境变量跳过交互提示（协议内容仍须事先阅读并接受）：

```bash
cd /tmp/stm32-install/clt

sudo LICENSE_ALREADY_ACCEPTED=1 \
  bash ./stm32cubeclt_1.22.0_*_Lin-Deb-x86_64.sh --nox11 --noprogress
```

成功时末尾会出现：

```text
STM32CubeCLT installed successfully
```

包管理器侧可见：

```bash
dpkg -l | grep -iE 'stm32cubeclt|stlink'
# stm32cubeclt-1.22.0
# st-stlink-server
# st-stlink-udev-rules
```

刷新 udev（必要时拔插一次 ST-LINK）：

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

### 安装失败时的手动回退

也可先 `--noexec --keep` 解出 deb，再手动装：

```bash
cd /tmp/stm32-install/clt
./stm32cubeclt_*.sh --noexec --keep --target ./extract --nox11 --noprogress
cd extract
sudo LICENSE_ALREADY_ACCEPTED=1 apt-get install -y \
  ./st-stlink-udev-rules-*.deb \
  ./st-stlink-server-*.deb \
  ./stm32cubeclt-*.deb
```

### CLT 目录要点

```text
/opt/st/stm32cubeclt_1.22.0/
├── GNU-tools-for-STM32/bin/   # arm-none-eabi-gcc 等
├── CMake/bin/
├── Ninja/bin/
├── Make/bin/
├── STM32CubeProgrammer/bin/   # STM32_Programmer_CLI
├── STLink-gdb-server/
└── st-arm-clang/
```

官方会写入 `/etc/profile.d/cubeclt-bin-path_1.22.0.sh`，把上述 `bin` 加进 `PATH`。  
**注意**：1.22 这包 **不含 OpenOCD**；烧录 / 调试走 CubeProgrammer 或 STLink-gdb-server 即可。

## 安装 STM32CubeMX

### 静默安装 XML

IzPack 的目标路径必须写在子节点 `<installpath>` 里，否则会报 `ipath is null`、Automated installation FAILED。

```bash
cat > /tmp/stm32-install/auto-install.xml <<'EOF'
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<AutomatedInstallation langpack="eng">
  <com.st.microxplorer.install.MXHTMLHelloPanel id="readme"/>
  <com.st.microxplorer.install.MXLicensePanel id="licence.panel"/>
  <com.st.microxplorer.install.MXTargetPanel id="target.panel">
    <installpath>/opt/st/stm32cubemx</installpath>
  </com.st.microxplorer.install.MXTargetPanel>
  <com.st.microxplorer.install.MXShortcutPanel id="shortcut.panel"/>
  <com.st.microxplorer.install.MXInstallPanel id="install.panel"/>
  <com.st.microxplorer.install.MXFinishPanel id="finish.panel"/>
</AutomatedInstallation>
EOF
```

### 执行安装

```bash
cd /tmp/stm32-install/mx
sudo ./SetupSTM32CubeMX-6.11.0 /tmp/stm32-install/auto-install.xml
```

成功输出类似：

```text
[ Starting automated installation ]
Installation started
...
[ Unpacking finished ]
Installation finished
[ Automated installation done ]
```

产物：`/opt/st/stm32cubemx/STM32CubeMX`。

静默失败时可改图形向导（需 `DISPLAY`）：

```bash
sudo ./SetupSTM32CubeMX-6.11.0
```

按向导接受许可，安装路径选 `/opt/st/stm32cubemx`。

## 配置 PATH（交互式 shell）

`/etc/profile.d/` 只对 **login shell** 可靠；日常终端多半读 `~/.bashrc`，补上一段：

```bash
# STM32CubeCLT / STM32CubeMX
export STM32CUBECLT=/opt/st/stm32cubeclt_1.22.0
if [ -f /etc/profile.d/cubeclt-bin-path_1.22.0.sh ]; then
  # shellcheck source=/dev/null
  . /etc/profile.d/cubeclt-bin-path_1.22.0.sh
fi
export PATH="/opt/st/stm32cubemx:$PATH"
```

生效：

```bash
source ~/.bashrc
# 或新开一个终端
```

可选桌面入口：

```bash
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/STM32CubeMX.desktop <<'EOF'
[Desktop Entry]
Name=STM32CubeMX
Comment=STM32Cube initialization code generator
Exec=/opt/st/stm32cubemx/STM32CubeMX
Icon=applications-engineering
Terminal=false
Type=Application
Categories=Development;Electronics;
EOF
```

## 验证

```bash
arm-none-eabi-gcc --version
# GNU Tools for STM32 14.3.rel1 ... 14.3.1

STM32_Programmer_CLI --version
# STM32CubeProgrammer v2.23.0

ls /opt/st/stm32cubemx/STM32CubeMX
```

有 ST-LINK 时探测探针与目标：

```bash
STM32_Programmer_CLI -l
STM32_Programmer_CLI -c port=SWD
```

本次实测：

```text
ST-LINK SN  : 37FF71064E573436AD911A43
ST-LINK FW  : V2J45S7
Voltage     : 3.30V
Device name : STM32F101/F102/F103 Medium-density
Device CPU  : Cortex-M3
```

说明 udev、ST-Link server 与 Programmer 链路正常。

## 清理

安装完成后可删临时目录与已解压的安装器；原始 zip 可按需保留作备份。

```bash
rm -rf /tmp/stm32-install
```

## 后续与边界

- **未装 STM32CubeIDE**：本次只装 CLT + MX；IDE 需另下。
- **未预装 `STM32Cube_FW_*`**：首次在 CubeMX 里选芯片 / 板子时再下对应固件包。
- CubeMX 6.11 偏旧，可与 CLT 1.22 共用；之后可在 CubeMX 内自更新或换新版安装包。
- 若个别二进制缺 `libncurses5` / `libtinfo5`，再按报错补 Debian 兼容包。

## 速查命令

```bash
# 工具链 / 烧录
arm-none-eabi-gcc --version
STM32_Programmer_CLI -c port=SWD

# 打开 CubeMX
STM32CubeMX
# 或
/opt/st/stm32cubemx/STM32CubeMX

# 卸载（按需）
sudo dpkg -r stm32cubeclt-1.22.0 st-stlink-udev-rules st-stlink-server
# CubeMX：运行 /opt/st/stm32cubemx/Uninstaller 下的卸载程序
```
