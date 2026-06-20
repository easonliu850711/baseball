import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/NavBar'
import VisitorCounter from '@/components/VisitorCounter'

export const metadata: Metadata = {
  title: '伊森の国際野球航路 | Studio Imori Baseball',
  description: '追蹤台灣旅外球員，整合 NPB、MLB、CPBL、KBO 戰績與最新動態。',
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
        <footer className="border-t border-ocean-light/10 bg-ocean-deep/45 px-4 py-7 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/35">
            <span className="font-semibold text-shell-white/55">⚾ 伊森の国際野球航路</span>
            <span>·</span>
            <span>Studio Imori Baseball</span>
            <span>·</span>
            <span>© 2026</span>
            <span>·</span>
            <VisitorCounter />
          </div>
          <p className="mt-2 text-[10px] tracking-[0.12em] text-white/20">
            NPB · MLB · CPBL · KBO 戰績與台灣旅外球員動態
          </p>
        </footer>
      </body>
    </html>
  )
}
