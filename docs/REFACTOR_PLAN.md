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

### 阶段 3：前端配合改造（进行中）
- Agent 执行过程可视化（消息流中展示工具调用步骤）✅
- Agent 直接操作画布：`mindmap_edit` 工具产出结构化指令（add/update/delete），
  按节点 id 增量打补丁，替代全量重渲染，保留用户手动编辑 ✅
  - 请求携带 `mindMap` 轮廓（id+label）→ system prompt 注入 → 模型按 id 定位
  - `AgentEvent: mindmap-patch` 经 SSE 推前端 → `controller.applyPatch` 就地应用
  - 纯函数 `utils/patch.ts`（`applyOps`/`toOutline`）有单测覆盖
- 拆分 `TopicNode`（编辑器 / 右键菜单 / AI 弹窗）—— 待办

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
mindmap_generate  node_expand  rag_query  mindmap_edit  （后续：web_search）
 生成完整导图     分支头脑风暴   查询已上传PDF  增量编辑画布
```

- 每个 tool 的入参/出参都有 zod schema，模型输出强校验
- 所有中间步骤通过 SSE `AgentEvent` 推送，前端实时展示
- `maxSteps` 上限防失控；任何 tool 抛错都会作为 observation 回喂给模型自行恢复
- **双向协作**：用户在画布上的手动改动（改名/增删/拖拽）复用同一套 `MindMapOp`，
  按来源缓冲并去重（`coalesceEdits`），下次请求作为 `AgentRequest.recentEdits` 带上；
  system prompt 把它还原成可读改动描述，Hermas 据此当协作者顺势回应、勿擅自回退

## 阶段 5：稳健化重构（best-practice，增量·行为不变·每步可验证）

> 原则：**不做大爆炸式 rewrite**。当前系统能跑，重构的目的是降债、不是换实现。
> 每一步都保持行为不变 + 有测试/冒烟兜底 + 独立提交，可随时回滚。

**R0 · 安全网（前置门槛）**
- 在 `refactor/foundation` 分支上，把本轮全部改动作为「已验证基线」提交（build/test/lint 全绿）。
- 补渲染/解析层特征测试：markdown→树、布局尺寸非 0、增量编辑后结构一致。

**R1 · 统一思维导图单一数据源（最高价值）**
- 现状三处持有「地图」：`controller.data`（手动编辑）/ `nodeStore.nodes`（生成）/ `nodeStore.markdown`。
  发散导致反复 bug（手动编辑不回写、新会话残留轮廓、patch 不同步）。
- 目标：`nodeStore` 唯一持有树；controller 退化为**纯渲染器**订阅它；
  所有变更（生成/patch/手动增删改）统一走 store action。消除一整类同步 bug。

**R2 · 解耦 agent 事件与 React 接线**
- 现状 `onDone/onPatch/onSetMap` 回调层层穿 `send()→handleAgentEvent→App`，易乱。
- 目标：抽一个「agent runtime」消费 `AgentEvent` 并派发到 store，React 只订阅结果。

**R3 · 渲染/布局可测化 + measureText 健壮化**
- 把纯逻辑（树构建、hierarchy 定位）从 X6 cell 创建里拆出来，单测覆盖（本轮 bug 高发区，零测试）。
- measureText：字体加载时机、回退路径做稳。

**R4 · 体积优化**：当前 web bundle ~833KB，按需懒加载 X6（画布首屏才载）。

**R5 · 后端小清理**：抽出导图生成策略（单次/两段式/streamObject）为可插拔。

> 执行顺序：R0 →（R1 ∥ R3 可并行）→ R2 → R4 → R5。R1 完成即消除大部分历史 bug 根因。

## 兼容性承诺

- 旧 SSE envelope `{ status: 'pending'|'done'|'failed', data }` 不变
- 客户端自带 OpenAI Key / 代理头的工作方式不变
- 上传目录、静态文件服务路径不变
