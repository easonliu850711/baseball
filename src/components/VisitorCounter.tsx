'use client'

import { useState, useEffect } from 'react'

export default function VisitorCounter() {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const key = 'baseball-site-visits'

    // 讀取目前計數（整個站總拜訪）
    let total = parseInt(localStorage.getItem(key) || '0', 10)

    // 這次也算一次（同一 session 不重複計）
    const sessionKey = 'baseball-site-session'
    if (!sessionStorage.getItem(sessionKey)) {
      total += 1
      localStorage.setItem(key, String(total))
      sessionStorage.setItem(sessionKey, '1')
    }

    setCount(total)
  }, [])

  if (!mounted) return null

  return (
    <div className="text-xs text-white/20 tracking-wider">
      訪客足跡 · {count} 回
    </div>
  )
}
