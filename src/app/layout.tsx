import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'
import VisitorCounter from '@/components/VisitorCounter'

export const metadata: Metadata = {
  title: '世界野球戰績站',
  description: 'NPB·MLB·CPBL·KBO 四國排行榜・旅外球員追蹤',
  icons: '/icon.png',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="text-center py-6 border-t border-ocean-light/10 bg-ocean-deep/50">
          <div className="flex items-center justify-center gap-4 text-xs text-white/30">
            <span>⚾ 世界野球戰績站</span>
            <span>·</span>
            <span>© 2026 Studio Imori</span>
            <span>·</span>
            <VisitorCounter />
          </div>
          <p className="text-[10px] text-white/15 mt-2">
            NPB · MLB · CPBL · KBO 即時戰績 · 旅外球員追蹤
          </p>
        </footer>
      </body>
    </html>
  )
}
