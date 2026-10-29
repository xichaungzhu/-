# 真人语感文案 · dsh 插件

一个独立 bundle：装进 dsh profile 后，侧栏多一个「文案工坊」页面，同时给 agent 注册 `human-voice-copy` 写作技能。两者都能单独开关。

## 装

### 方式一：本地目录（开发用）

```
plugin_manager install_bundle target=<这个目录的绝对路径>
```

### 方式二：GitHub 私有库（分享给别人）

推送方在本目录跑一次：

```powershell
.\push.ps1
```

脚本会：检查 `gh` 登录 → 建私有库 → 回填 `package.json` 里的仓库地址 → 推送 `main` 和 tag，最后打印安装命令。

接收方（本机已登过 GitHub，或配了 SSH key）：

```
plugin_manager install_bundle target=git+ssh://git@github.com/<账号>/dsh-human-voice-copy.git
```

也可以直接加进 profile（不经 bundle 接口）：

```powershell
dsh plugin --profile desktop add github:<账号>/dsh-human-voice-copy
```

私有库必须让 pnpm 能拉到代码：**优先用 SSH 地址**；临时可以用带 token 的 HTTPS（`https://<token>@github.com/...`），但别把它写进分享文档。

装完 **重启一次 dsh**：新包第一次声明 `dsh.client`，模块图要重读包清单才会把页面挂上去。

### 方式三：一个 tarball（不建仓库，直接发文件）

```powershell
npm.cmd pack
# 得到 dsh-human-voice-copy-0.3.0.tgz，发给对方
plugin_manager install_bundle target=file:C:\path\dsh-human-voice-copy-0.3.0.tgz
```

### 排障

装完看不到页面时，先确认包真的进了模块图：

```powershell
curl.exe -s -N --max-time 5 http://127.0.0.1:<端口>/plugins/events
# 首帧 graph 里应出现 {"id":"dsh-human-voice-copy", ...}
```

认库但拉不到代码：`git ls-remote <仓库地址>` 先在本机跑通，再谈安装。

卸载：

```
plugin_manager remove_bundle target=dsh-human-voice-copy
```

## 关

三档，按需要选：

| 关什么 | 怎么关 | 效果 |
|---|---|---|
| 只关技能 | 页面右上「停用技能」 | agent 看不到这个 skill，页面仍可看/改，状态存 `assets/.state.json` |
| 关整个插件 | 插件管理里把 `真人语感文案` 关掉 | 页面和技能一起消失，随时可再开 |
| 彻底移除 | `remove_bundle` | 从 profile 卸载，目录留着可重装 |

## 页面能干什么

两个入口，同一套内容：侧栏的「文案工坊」图标（`sidebar.panellist` + `main` 面板），以及 **设置 → 文案工坊**（`settings.section`，跟 Purge 并排）。设置里的那一行导航由设置外壳按 id 画，图标是默认齿轮。

- **生成指令**：体裁用标签、基调用分段控件、说话人/时长用下拉，填主题、场景、受众，一键拼出可直接粘到对话里的一段话，带复制。生成结果按代码块固定在左下，不会顶掉表单。
- **在线改 SKILL.md**：右侧「SKILL.md / 参考资料」双标签工作区。编辑中实时显示字节数、行数、更新时间，脏状态有圆点提示；`Ctrl / ⌘ + S` 保存，`还原` 回到磁盘版本。frontmatter 缺 `name`/`description` 时顶部直接给警告并禁用保存（Host 也会拒）。
- **参考资料**：搜索过滤、逐条展开预览、单条复制；按 `Esc` 收起。
- **状态与反馈**：右上胶囊显示技能是否注册，开关即写 `assets/.state.json`；读取失败给重试卡片，加载中给骨架屏，复制/保存结果走底部 toast。

## 配色

全部取自宿主主题令牌，明暗两套自动切换，插件里没有一处字面色值。四个自定义变量收口在 `.hvc_root`：

| 变量 | 取值 | 明 / 暗 | 用在哪 |
|---|---|---|---|
| `--hvc-accent` | `state-business-primary` 84% + 前景色 | `#3966c5` / `#8eb7ff` | 主按钮、开关开态、选中标签/分段、焦点环、卡片标题图标 |
| `--hvc-accent-soft` | accent 14% 混合 | `#e3eaf7` / 蓝 14% 叠加 | 选中项底、输入框聚焦光晕 |
| `--hvc-fill` | `bg-module-platform` | `#f5f6f7` / `#353638` | 输入框、状态胶囊、空状态图标底 |
| `--hvc-track` | `interactive-bg-active` | `#2631481a` / `#ffffff24` | 分段与标签页轨道 |

描边三级：`border-l2` 分隔线 / `border-l3` 控件边 / `border-l4` 悬停。想回到纯中性（跟随宿主黑白主色），把 `--hvc-accent` 换成 `var(--dsw-alias-brand-primary)` 即可，其它不用动。

## 结构

```
index.js            Host 半：skill provider + 页面 API（GET api / POST save / POST toggle）
client.js           浏览器半：sidebar.panellist 图标 + main 面板
assets/SKILL.md     技能正文（唯一维护源，frontmatter 即元数据）
assets/references/  改写对照库、说话人卡
locale/*.json       插件列表里的标题与描述
icon.svg            侧栏与插件行图标
cordis.patch.yml    插入 Loader 行 human-voice-copy
```

Host API 只允许写 `assets/SKILL.md` 与 `assets/references/*.md`，其它路径一律 400，单次请求体上限 512 KB，写入走临时文件 + rename。

## 维护

改文风 = 改 `assets/SKILL.md`（前端保存或直接编辑文件都行）。技能描述取自它自己的 frontmatter，不用同步别处。
