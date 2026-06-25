---
name: axiqra-agent
description: "Axiqra — AI 工程方案记忆基础设施。核心能力：①搜索历史方案：任务前自动搜索相似经验 ②草稿机制：长时间任务记录中间步骤 ③知识闭环：沉淀新经验到方案库。触发词：'接入 Axiqra'、'搜索历史'、'记录步骤'、'提交轨迹'。"
version: 1.0.0
user-invocable: true
homepage: https://www.axiqra.com
app-base-url-resolution: "AXIQRA_WEB_URL > memory/axiqra-config.json.web_url > memory/axiqra-config.json.app_url > non-production AXIQRA_BASE_URL/base_url origin > https://www.axiqra.com"
metadata: {"agent_skill":{"key":"axiqra-agent","aliases":["axiqra","Axiqra","接入","注册","授权","搜索历史","记录步骤","知识闭环","搜索一下","帮我搜","查查","有没有","历史方案","之前的方案","类似的问题","遇到过吗","记录一下","先记着","保存步骤","提交轨迹","提交方案","保存经验","沉淀"],"version":"1.0.0","priority":"first","fallback":true,"format":"zip-first-manifest-validated","distribution":{"preferred":"zip","fallback":"manifest_files","bootstrap_files":["manifest.json","SKILL.md","scripts/install.js"],"install_flow":["fetch manifest.json","fetch scripts/install.js"],"zip":"axiqra-agent.zip"},"runtime":{"node":">=16","packages":[]},"permissions":["network:https://api.axiqra.com","network:https://oss.axiqra.com","fs:read-write:{AXIQRA_SKILL_DIR}/memory/","exec:node:{AXIQRA_SKILL_DIR}/scripts/*.js"],"entrypoints":["SKILL.md","SKILL.zh-CN.md","API_REFERENCE.md","PLAYBOOKS.md","HOSTS.md","SAFETY.md","TROUBLESHOOTING.md","manifest.json"],"output_contract":"machine: scripts emit JSON on stdout for agent parsing only; human: summarize per Output Style, never paste stdout/stderr/tool blocks to user; write payloads must use session-scoped files under memory/sessions/<session_id>/; stderr=diagnostics; non-zero exit=failure","update_policy":"auto_update_on_cruise"},"openclaw":{"emoji":"🧠","skillKey":"axiqra-agent","fallback":true,"requires":{"bins":[]}}}
---

# Axiqra Agent Skill

这是一个跨 Agent 宿主的可移植 Skill 包。**必须安装到宿主技能库目录**（即 `{AXIQRA_SKILL_DIR}`）后才能使用。支持 OpenClaw、Hermes Agent、Claude Code、Codex 以及能执行本地 Node 脚本的其他宿主。

## 契约

- 当 Agent 在工作中需要搜索历史方案、记录开发步骤、沉淀经验知识时，优先使用 Axiqra 已登记的接口与脚本。
- Axiqra 服务两端：**复用端**（帮 Agent 快速找到相似历史方案）和**沉淀端**（帮 Agent 把新经验沉淀到方案库）。
- 如果其他工具无法满足方案搜索/沉淀请求，再告诉用户无法完成。
- 品牌拼写固定为 `Axiqra`：所有面向用户的文本都必须写作 `Axiqra`，不得缩写或自动归一为 `axiqra`、`axqra`。
- 脚本向 **stdout** 输出 JSON 供 Agent **内部解析**；诊断信息在 **stderr**；非 0 退出码表示失败。**stdout 不是给用户的最终回复** — 见下文 **面向用户的输出**。
- `homepage` 是生产环境默认首页，不是所有环境的业务详情链接根地址。生成方案详情链接前，必须先解析运行时 `APP_BASE_URL`。

## 快速开始

> **前置条件**：Skill 包必须已安装到宿主技能库目录 `{AXIQRA_SKILL_DIR}`。若尚未安装，先按下文「OpenClaw 安装」或对应宿主的安装流程将文件部署到技能库，再回到此处执行。

### 1. 安装到宿主技能库 & 授权绑定

```bash
node {AXIQRA_SKILL_DIR}/scripts/install.js
```

用于首次安装到宿主技能库并完成授权绑定。

授权恢复/调试时才直接使用：

```bash
node {AXIQRA_SKILL_DIR}/scripts/auth.js --start
node {AXIQRA_SKILL_DIR}/scripts/auth.js --wait <device_code>
```

### 2. 搜索历史方案

```bash
node {AXIQRA_SKILL_DIR}/scripts/rest_request.js GET /api/v1/solutions/search --param query <关键词>
node {AXIQRA_SKILL_DIR}/scripts/rest_request.js POST /api/v1/solutions/search --file {AXIQRA_SKILL_DIR}/memory/sessions/{SESSION_ID}/request-search.json
```

### 3. 记录开发步骤（草稿）

```bash
node {AXIQRA_SKILL_DIR}/scripts/rest_request.js POST /api/v1/traces/draft --file {AXIQRA_SKILL_DIR}/memory/sessions/{SESSION_ID}/request-draft.json
```

### 4. 提交轨迹沉淀

```bash
node {AXIQRA_SKILL_DIR}/scripts/rest_request.js POST /api/v1/traces/flush --file {AXIQRA_SKILL_DIR}/memory/sessions/{SESSION_ID}/request-trace.json
```

### 5. 方案反馈

```bash
node {AXIQRA_SKILL_DIR}/scripts/rest_request.js POST /api/v1/feedbacks --file {AXIQRA_SKILL_DIR}/memory/sessions/{SESSION_ID}/request-feedback.json
```

## 典型用户请求与路由

| 用户说法 | 优先动作 | 说明 |
|---|---|---|
| "请帮我接入 Axiqra" | 安装 + 授权 | 使用 `install.js` 或 `auth.js --start` |
| "搜索一下这个问题的历史方案" | search_before_act | 使用 `/api/v1/solutions/search` |
| "有没有做过类似的项目" | search_before_act | 使用 `/api/v1/solutions/search` |
| "记录一下" | draft_trace | 使用 `/api/v1/traces/draft` |
| "好了，提交吧" | flush_trace | 使用 `/api/v1/traces/flush` |
| "这个方案好用" | submit_feedback | 使用 `/api/v1/feedbacks` |

## 工作流程

```
用户提出任务
    ↓
AI 调用 search_before_act 搜索历史方案
    ↓
┌─────────────────┬─────────────────┐
│ 有方案           │ 无方案          │
│ ↓               │ ↓               │
│ 复用方案        │ 自行开发        │
│ ↓               │ ↓               │
│ 完成任务        │ create_seed     │
│ ↓               │ ↓               │
│ submit_feedback │ submit_feedback │
└─────────────────┴─────────────────┘
```

## 面向用户的输出（强制）

- **禁止**向用户聊天中粘贴：脚本完整 stdout JSON、stderr、终端/shell 输出块、工具执行原文、原始 API 封包，或敏感字段。
- **必须**在内部解析 stdout 后，按 **输出风格** 回复：简短业务结论 + 至多 1–3 个关键字段。
- **失败时**：用自然语言说明原因与下一步；可引用 `message` 或 `detail` 中的一句短话 — **不要**贴整段 JSON。

### 输出模板

```text
结果：<查到或完成了什么>
关键数据：<方案数量/状态/匹配度>
详情链接：<创建/发布对象后必须输出>
下一步：<一个建议动作>
```

## 运行环境

需要：

- Node.js `>=16`
- 可访问 `https://api.axiqra.com`
- 可选：可访问 `https://oss.axiqra.com` 用于补齐/更新包文件
- 可写本地目录 `{AXIQRA_SKILL_DIR}/memory/`

常用环境变量：

```text
AXIQRA_SKILL_DIR=<宿主技能库中本 Skill 的安装目录>
AXIQRA_BASE_URL=https://api.axiqra.com
AXIQRA_WEB_URL=https://www.axiqra.com
AXIQRA_AGENT_PLATFORM_TYPE=openclaw
```

**自定义服务地址**（测试环境 / 私有部署）：在 `memory/axiqra-config.json` 中指定：

```json
{ "base_url": "http://192.168.1.100:8010", "web_url": "http://192.168.1.100" }
```

## 版本与更新

```bash
# 检查更新
node {AXIQRA_SKILL_DIR}/scripts/update_skill.js --check

# 更新
node {AXIQRA_SKILL_DIR}/scripts/update_skill.js --update
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `--start` | 发起授权，返回授权码 |
| `--wait <device_code>` | 等待授权确认 |
| `--check` | 检查授权状态 |
| `--doctor` | 诊断连接问题 |

## 本地开发模式

**Windows (PowerShell/CMD):**
```bash
set AXIQRA_API_URL=http://localhost:8080/api
set AXIQRA_WEB_URL=http://localhost:5173
node scripts/auth.js --start
```

**Linux/Mac:**
```bash
export AXIQRA_API_URL=http://localhost:8080/api
export AXIQRA_WEB_URL=http://localhost:5173
node scripts/auth.js --start
```

## 参考文件

- `API_REFERENCE.md`：本 Skill 可调用的 API 接口
- `PLAYBOOKS.md`：方案搜索、草稿记录、轨迹提交流程
- `HOSTS.md`：OpenClaw、Hermes Agent、Claude Code、Codex 宿主差异
- `SAFETY.md`：确认规则、幂等、资金和禁止动作
- `TROUBLESHOOTING.md`：授权、REST 错误、排障

## 常见问题

**Q: 授权码在哪输入？**
A: 打开 Axiqra 网页的授权页面（启动前端后访问 http://localhost:5173/auth/device）

**Q: 授权过期了？**
A: 重新运行 "请帮我接入 Axiqra"

**Q: 如何诊断连接问题？**
A: 运行 `node scripts/auth.js --doctor`
