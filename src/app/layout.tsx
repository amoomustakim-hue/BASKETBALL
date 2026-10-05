import type { Metadata, Viewport } from 'next'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import '@fontsource/anton'
import '@fontsource/permanent-marker'
import './globals.css'
import { Chrome } from '@/components/Chrome'

export const metadata: Metadata = {
  title: 'Banire Basketball | Lagos builds them. The world plays them.',
  description: 'Banire Basketball Academy and the Elite 50 camp. Meet the roster, watch the film, and apply.',
}

export const viewport: Viewport = { themeColor: '#ffc20e', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  )
}
