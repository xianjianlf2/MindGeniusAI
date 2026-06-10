# MindGenius AI 重构方案（Hermas）

> 决策时间：2026-06-10。已与维护者确认的四项关键决策：
> **Vercel AI SDK + Hono + 多 Provider 抽象 + 渐进式重构**

## 目标

1. 整体架构现代化，符合 TypeScript 全栈最佳实践
2. 引入 Agent 架构「Hermas」：从"单次 LLM 调用"升级为"规划 → 调工具 → 观察 → 修订"的自动化智能体
3. 渐进式推进，main 分支始终可运行；旧版 API 协议保持兼容

## 架构总览

```
MindGeniusAI/                      # pnpm monorepo
├── apps/
│   ├── web/                       # Vue 3 前端（原根目录前端代码）
│   └── server/                    # Hono 后端（重写，替代 Koa + LangChain 0.0.x）
│       └── src/
│           ├── routes/            # HTTP 路由层（兼容旧端点 + 新 /agent 端点）
│           ├── agent/             # Hermas Agent 核心
│           │   ├── hermas.ts      # orchestrator：tool-calling loop
│           │   └── tools/         # mindmap_generate / node_expand / rag_query / mindmap_edit
│           ├── llm/               # 多 Provider 抽象（OpenAI / Claude / DeepSeek）
│           ├── prompts/           # Prompt 模板集中管理（不再硬编码在路由里）
│           ├── services/          # RAG / 文档 / 压缩等业务逻辑
│           └── lib/               # SSE、logger、错误分类
└── packages/
    └── shared/                    # 前后端共享：SSE 协议、Agent 事件、API 类型
```

## 阶段划分

### 阶段 1：工程基座 ✅（本分支）
- pnpm workspace monorepo：`apps/web` + `apps/server` + `packages/shared`
- 共享 SSE/Agent 事件协议类型，消除前后端各写一套
- Vitest + GitHub Actions CI（lint → typecheck → test → build）
- Docker Compose 一键起前后端；补全 `.env.example`
- 修复已知 bug：`MainLayout.vue` CSS 表达式错误、API 层重复的 `useChatStoreConfig`

### 阶段 2：后端重写 + Hermas Agent ✅（本分支）
- Koa → Hono（类型安全路由、原生流式）
- LangChain 0.0.129 → Vercel AI SDK v5（tool calling loop、streamText、embed）
- 多 Provider：`X-LLM-Provider` 请求头 / 环境变量切换 OpenAI / Anthropic / DeepSeek，
  继续支持客户端自带 Key（`Authorization`）与代理（`OpenAI-proxy` 头）
- RAG 去 LangChain 化：pdf-parse 抽取 → 递归分块 → AI SDK embedMany → 内存余弦检索
- Prompt 全部抽到 `prompts/`，中英文模板化
- Hermas Agent：`POST /agent` SSE 端点，事件流包含 `tool-call` / `tool-result` /
  `text` / `done`，前端可视化每一步
- 旧端点全部保留且协议不变：`/chat` `/chatMindMap` `/chatNode` `/uploadFile`
  `/document/*` `/compressContent`

### 阶段 3：前端配合改造（后续 PR）
- Agent 执行过程可视化（消息流中展示工具调用步骤）
- Agent 直接操作画布：结构化节点指令（add/update/delete）增量更新，替代全量重渲染
- 拆分 `TopicNode.vue`（268 行 → 编辑器 / 右键菜单 / AI 弹窗）

### 阶段 4：质量收尾（后续 PR）
- 核心路径测试覆盖率提升（markdown→树、agent 调度、SSE 协议）
- 错误分类细化（认证 / 限流 / 超时分别提示）

## Hermas Agent 设计

```
用户请求（自然语言，可带文件上下文）
        │
        ▼
┌──────────────────────────────┐
│ Hermas orchestrator          │  system prompt: 规划者 + 思维导图专家
│ while (!finished && steps<N) │
└──────┬───────────────────────┘
       │ tool calls（AI SDK 自动 loop）
   ┌───┴────┬─────────────┬──────────────┐
mindmap_generate  node_expand  rag_query  （后续：web_search / mindmap_edit）
 生成完整导图     分支头脑风暴   查询已上传PDF
```

- 每个 tool 的入参/出参都有 zod schema，模型输出强校验
- 所有中间步骤通过 SSE `AgentEvent` 推送，前端实时展示
- `maxSteps` 上限防失控；任何 tool 抛错都会作为 observation 回喂给模型自行恢复

## 兼容性承诺

- 旧 SSE envelope `{ status: 'pending'|'done'|'failed', data }` 不变
- 客户端自带 OpenAI Key / 代理头的工作方式不变
- 上传目录、静态文件服务路径不变
