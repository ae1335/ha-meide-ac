# 空调（AC）实体与美的美居对照指南

本文档以美的美居 App 中挂机空调的官方能力描述
（设备 `prodId: A3QF`，型号 KFR-26G/N8KS1-1，UI 配置
`https://smarthome-drcn.dbankcdn.com/device/guide/A3QF/A3QF.json`）为基准，
逐项对照本集成的实体实现，并说明 `meiju-a3qf` 分支的增强点。

## 一、功能对照表

| #   | 美居功能                         | 美居字段                      | 协议层属性（midea-lan）              | 本集成实体                               | 状态                  |
| --- | -------------------------------- | ----------------------------- | ------------------------------------ | ---------------------------------------- | --------------------- |
| 1   | 开关                             | `switch.on`                   | `power`                              | climate 实体 + 电源开关                  | ✅ 完整               |
| 2   | 模式（自动/制冷/抽湿/制热/送风） | `mode.mode` 1-5               | `mode`                               | climate `hvac_modes`                     | ✅ 完整               |
| 3   | 设定温度 16-30℃，0.5 步进        | `temperature.target`          | `target_temperature`（step 0.5）     | climate 温度                             | ✅ 完整               |
| 4   | 室内温度                         | `temperature.current`         | `indoor_temperature`                 | 室内温度 sensor                          | ✅ 已默认启用         |
| 5   | ECO 开关（酷省电）               | `ECOswitch.on`                | `eco_mode`                           | 酷省电（ECO）switch + climate eco 预设   | ✅ 已默认启用         |
| 6   | 电辅热                           | `switchPTC.on`                | `aux_heating`                        | 电辅热 switch                            | ✅ 已默认启用         |
| 7   | 防直吹                           | `directBlowPreventionSwitch`  | `indirect_wind`（0x0042）            | 防直吹 switch                            | ✅ 已默认启用         |
| 8   | 智控温                           | `smartTempSwitch`             | `comfort_mode`                       | 智控温 switch + climate comfort 预设     | ✅ 已默认启用         |
| 9   | 上下风 7 档                      | `fan.verticalDirection` 0-6   | `swing_vertical` + `wind_ud_angle`   | **上下风 select（7 档，见下）**          | ✅ 本分支补全         |
| 10  | 左右风 7 档                      | `fan.horizontalDirection` 0-6 | `swing_horizontal` + `wind_lr_angle` | **左右风 select（7 档，见下）**          | ✅ 本分支补全         |
| 11  | 无级风速 1-100%                  | `fan.speed`                   | `fan_speed`                          | 设定风速 number（1-100）+ climate 风速档 | ✅ 已默认启用         |
| 12  | 自动风                           | `automaticAirswitch`          | `fan_speed=102`（auto）              | climate 风速"自动"档                     | ✅ 语义等价（见注 1） |
| 13  | 故障检测                         | `fault.code/status/message`   | `error_code`（0x003F）               | 故障码 sensor                            | ✅ 已默认启用         |
| 14  | 网络信息 / OTA 升级              | `netInfo` / `update`          | —（云端专属）                        | —                                        | ❌ 不适用（见注 2）   |

注 1：美居的"自动风"本质是风速自动档（设备根据温差自动调节风量），
对应本协议 `fan_speed=102`（auto）。在 climate 实体的风速选项中选择
"自动"即可，无需独立开关。

注 2：网络信号强度与 OTA 升级走美的云端通道，局域网协议不提供，
本集成不实现。

## 二、摆风 7 档还原（本分支增强）

美居 App 中上下风有 7 个选项。原版集成只能通过 climate 的摆风模式 +
6 档角度 select 分开控制。本分支把两者合并进角度 select，与美居一致：

**上下风（wind_ud_angle）**

| 美居选项 | 本分支选项 | 协议动作              |
| -------- | ---------- | --------------------- |
| 停止摆风 | 停止摆风   | `wind_ud_angle=0`     |
| 上下摆风 | 上下摆风   | `swing_vertical=True` |
| 最上     | 最上       | `wind_ud_angle=1`     |
| 偏上     | 偏上       | `wind_ud_angle=25`    |
| 居中     | 居中       | `wind_ud_angle=50`    |
| 偏下     | 偏下       | `wind_ud_angle=75`    |
| 最下     | 最下       | `wind_ud_angle=100`   |

**左右风（wind_lr_angle）** 同理：停止摆风 / 左右摆风 / 最左 / 偏左 /
居中 / 偏右 / 最右。

实现方式：角度 select 新增合成选项 `swing`（配置键
`swing_attribute`）。选中"摆风"时置位 `swing_vertical/horizontal`；
选择任一固定角度时先清除摆风，再下发角度，与美居交互一致。

## 三、默认启用的实体（美居主界面功能）

`meiju-a3qf` 分支将以下 AC 实体改为默认创建（`default: True`），
对应美居主界面的全部控件。老用户升级后如不需要，可在
"设置 → 设备与服务 → 实体" 中禁用；也可在集成配置的
"Extra switches and sensors" 里按需增删：

- 室内温度（sensor）
- 设定风速 1-100%（number）
- 上下风 / 左右风（select，7 档）
- 酷省电（ECO）/ 电辅热 / 防直吹 / 智控温（switch）
- 故障码（sensor）

其余实体（新风、无风感、自然风、智能眼、屏显、除菌自清洁、
能耗计量、压缩机诊断等）保持按需启用，见 `doc/AC.md`。

## 五、全量中文（2026.9.4-meiju.1）

本分支已将全部 37 种设备类型的实体名翻译为简体中文：

- 758 个实体中 742 个携带 `translation_key`，其中 741 个具备 zh-Hans
  名称；唯一例外是 climate 主实体，按 HA `has_entity_name` 规范
  直接显示设备名。
- 扫地机器人（B8）的全部枚举状态（工作状态、清扫模式、风量/水量/
  音量档位、移动方向、故障类型与描述）已中文化。
- 设备页型号显示本地化设备类型名（如"空调 22251759 (32773)"）。
- 修正上游误译：洗衣机水温传感器原标签"目标温度"，实为"温度"。
- 已知保留：微蒸烤一体机（BF）工作模式的 60+ 组合模式枚举仍为
  原始 key（上游英文版亦未翻译，组合词义靠推测易误导）。

## 六、安装（HACS 自定义仓库）

1. HACS → 右上角菜单 → 自定义存储库
2. 仓库地址 `https://github.com/ae1335/ha-meide-ac`，类别"集成"
3. 安装后重启 Home Assistant

> 本仓库 `hacs.json` 使用 `zip_release: true`，HACS 会下载 Release 附件
> `midea_ac_lan.zip`。发布记录见
> [Releases](https://github.com/ae1335/ha-meide-ac/releases)。

## 七、维护者备忘（发版与上游同步）

**发布新版本**

1. 修改 `custom_components/midea_ac_lan/manifest.json` 的 `version`
   （必须是无 `v` 前缀的 semver，如 `2026.9.5-meiju.1`）
2. 提交并推送，然后打同名 tag（`v2026.9.5-meiju.1`）并推送 tag
3. 在 GitHub 上基于该 tag 创建 Release —— 仓库 Actions 会自动构建
   `midea_ac_lan.zip` 并附加到 Release，无需手动构建

> 已修复的上游限制：上游 `release.yml` 上传附件使用 `secrets.GH_TOKEN`
> （上游组织的 PAT），fork 上不存在该 secret 会导致发布失败。本仓库
> 已改为工作流自带的 `GITHUB_TOKEN`（工作流已声明
> `permissions: contents: write`），fork 无需配置任何 secret 即可发布。

**同步上游更新**

```bash
git fetch upstream
git rebase upstream/main meiju-a3qf
git push meiju meiju-a3qf --force-with-lease
```

`upstream` 指向 `https://github.com/wuwentao/midea_ac_lan`（保留为同步源）。

**回归检查工具**（仓库外，工作目录）

- `check_translation_chain.py` —— 模拟 HA 翻译回退链，量化中文覆盖率
- `audit_i18n.py` —— 跨语言 key 一致性 + state 翻译与协议枚举比对
- `verify_swing_select.py` —— 摆风 7 档逻辑回归
- `scan_zh_leftovers.py` —— 扫描 zh-Hans 全文件的英文残留

## 八、限制说明

- `swing_attribute` 的开关走旧协议 StateSet 全量帧；BB 子协议设备
  （少量新风机一体机型）不支持该路径，此时摆风选项将不生效，
  请使用 climate 实体的摆风模式。
- 本分支基于上游 2026.9.2（midea-lan 2026.9.2），后续可按需
  rebase 上游新版本。
