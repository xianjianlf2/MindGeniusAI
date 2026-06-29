import { describe, expect, it } from 'vitest'
import { takeDemoSlot } from '../src/lib/rateLimit'

describe('takeDemoSlot', () => {
  it('limit <= 0 表示不限流，恒放行', () => {
    for (let i = 0; i < 100; i++)
      expect(takeDemoSlot('ip-unlimited', 0)).toBe(true)
    expect(takeDemoSlot('ip-unlimited', -1)).toBe(true)
  })

  it('达到上限后拒绝，且按 IP 独立计数', () => {
    expect(takeDemoSlot('ip-a', 3)).toBe(true)
    expect(takeDemoSlot('ip-a', 3)).toBe(true)
    expect(takeDemoSlot('ip-a', 3)).toBe(true)
    expect(takeDemoSlot('ip-a', 3)).toBe(false) // 第 4 次超额

    // 另一个 IP 不受影响
    expect(takeDemoSlot('ip-b', 3)).toBe(true)
  })
})
