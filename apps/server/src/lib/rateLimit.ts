/**
 * 访客免费额度护栏：仅在请求回退到服务端共享 Key 时生效，按 IP 计每日次数。
 * 进程内内存计数 —— 单实例部署（Render / HF Space）足够；重启清零，对 demo 可接受。
 * 用户自带 Key 的请求不会走到这里，永不限流。
 */
const hits = new Map<string, { day: number; count: number }>()

/** UTC 日期戳（YYYYMMDD 整数），跨天即重置 */
function todayStamp(): number {
  const now = new Date()
  return now.getUTCFullYear() * 10000 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate()
}

/**
 * 占用一个名额；超额返回 false。`limit <= 0` 表示不限流（保持旧的共享 Key 行为）。
 */
export function takeDemoSlot(ip: string, limit: number): boolean {
  if (limit <= 0)
    return true

  const day = todayStamp()
  const current = hits.get(ip)

  if (!current || current.day !== day) {
    // 新的一天或新 IP：顺手清掉昨天的残留，避免 Map 无限增长
    if (hits.size > 5000) {
      for (const [key, value] of hits) {
        if (value.day !== day)
          hits.delete(key)
      }
    }
    hits.set(ip, { day, count: 1 })
    return true
  }

  if (current.count >= limit)
    return false

  current.count += 1
  return true
}
