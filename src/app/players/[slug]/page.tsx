import { notFound } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { PlayerView } from '@/components/Player'
import { PLAYERS, find } from '@/lib/players'

export function generateStaticParams() {
  return PLAYERS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = find((await params).slug)
  return { title: p ? `${p.name} #${p.number} | Banire Basketball` : 'Banire Basketball' }
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = find((await params).slug)
  if (!p) notFound()
  return (
    <main>
      <PlayerView slug={p.slug} />
      <Footer />
    </main>
  )
}
