import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: '⚾ 世界野球戰績站',
  description: 'NPB·MLB·CPBL·KBO 四國排行榜・旅外球員追蹤',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  )
}
