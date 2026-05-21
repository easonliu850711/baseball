import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '⚾ Studio Imori 球場巡禮 — 14 場制霸',
  description: 'NPB 14 場球場巡禮全進度追蹤・已購 7 張・預算管理・制霸儀表板',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
