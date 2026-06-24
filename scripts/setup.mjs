#!/usr/bin/env node
/**
 * 交互式首次配置向导 —— `pnpm setup`
 *
 * 目标：让完全不懂命令行的人也能在 1 分钟内跑起来。
 * 问几个问题 → 生成 apps/server/.env，无需手动 cp + 编辑。
 */
import { createInterface } from 'node:readline/promises'
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { argv, exit, stdin, stdout } from 'node:process'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ENV_PATH = resolve(ROOT, 'apps/server/.env')

const C = {
  reset: '\x1B[0m',
  dim: '\x1B[2m',
  bold: '\x1B[1m',
  cyan: '\x1B[36m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
}

const PROVIDERS = {
  1: {
    id: 'openai',
    name: 'OpenAI (GPT)',
    keyVar: 'OPENAI_API_KEY',
    modelVar: 'OPENAI_MODEL',
    defaultModel: 'gpt-4o-mini',
    keyHint: '以 sk- 开头，在 https://platform.openai.com/api-keys 获取',
  },
  2: {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    keyVar: 'ANTHROPIC_API_KEY',
    modelVar: 'ANTHROPIC_MODEL',
    defaultModel: 'claude-sonnet-4-6',
    keyHint: '以 sk-ant- 开头，在 https://console.anthropic.com/ 获取',
  },
  3: {
    id: 'deepseek',
    name: 'DeepSeek（国内可直连，便宜）',
    keyVar: 'DEEPSEEK_API_KEY',
    modelVar: 'DEEPSEEK_MODEL',
    defaultModel: 'deepseek-chat',
    keyHint: '以 sk- 开头，在 https://platform.deepseek.com/api_keys 获取',
  },
}

export function buildEnv({ provider, apiKey, model, port }) {
  return [
    '# 由 `pnpm setup` 生成。完整可选项见 apps/server/.env.example',
    `PORT=${port}`,
    `LLM_PROVIDER=${provider.id}`,
    'LOG_LEVEL=info',
    '',
    `${provider.keyVar}=${apiKey}`,
    `${provider.modelVar}=${model}`,
    '',
    'EMBEDDING_MODEL=text-embedding-3-small',
    '',
  ].join('\n')
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout })
  const ask = (q, fallback = '') => rl.question(q).then(a => a.trim() || fallback)

  console.log(`\n${C.bold}${C.cyan}MindGenius AI · 配置向导${C.reset}`)
  console.log(`${C.dim}回答几个问题即可生成 apps/server/.env，可随时改。直接回车用默认值。${C.reset}\n`)

  if (existsSync(ENV_PATH)) {
    const overwrite = await ask(`${C.yellow}检测到已存在 apps/server/.env，覆盖？(y/N) ${C.reset}`, 'n')
    if (overwrite.toLowerCase() !== 'y') {
      console.log(`${C.dim}已取消，保留现有配置。${C.reset}`)
      rl.close()
      return
    }
  }

  console.log('选择默认模型供应商：')
  for (const [k, p] of Object.entries(PROVIDERS))
    console.log(`  ${C.bold}${k}${C.reset}. ${p.name}`)
  let choice = await ask('\n输入序号 (默认 1): ', '1')
  if (!PROVIDERS[choice])
    choice = '1'
  const provider = PROVIDERS[choice]

  console.log(`\n${C.dim}${provider.keyHint}${C.reset}`)
  const apiKey = await ask(`粘贴你的 ${provider.name} API Key: `)

  const model = await ask(`模型名 (默认 ${provider.defaultModel}): `, provider.defaultModel)
  const port = await ask('服务端口 (默认 3000): ', '3000')

  writeFileSync(ENV_PATH, buildEnv({ provider, apiKey, model, port }))
  rl.close()

  console.log(`\n${C.green}✓ 已写入 apps/server/.env${C.reset}`)
  if (!apiKey)
    console.log(`${C.yellow}⚠ 你还没填 API Key —— 也可以稍后在网页右上角「设置」里填（仅存在浏览器本地）。${C.reset}`)
  if (provider.id !== 'openai')
    console.log(`${C.dim}提示：RAG 文档检索需要 OpenAI embedding，如需该功能请额外配置 OPENAI_API_KEY。${C.reset}`)
  console.log(`\n下一步：${C.bold}pnpm dev${C.reset} —— 然后打开 ${C.cyan}http://localhost:5173${C.reset}\n`)
}

const invokedDirectly = argv[1] && resolve(argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  main().catch((error) => {
    console.error(error)
    exit(1)
  })
}
