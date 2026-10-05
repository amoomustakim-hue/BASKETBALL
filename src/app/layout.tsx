import type { Metadata, Viewport } from 'next'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import '@fontsource/instrument-serif'
import '@fontsource/instrument-serif/400-italic.css'
import './globals.css'
import { Chrome } from '@/components/Chrome'

export const metadata: Metadata = {
  title: 'Banire Basketball Academy | Lagos',
  description: 'Banire Basketball Academy and the Elite 50 camp, Lagos. The players, the work, and how to apply.',
}

export const viewport: Viewport = { themeColor: '#0d0d0c', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  )
}
