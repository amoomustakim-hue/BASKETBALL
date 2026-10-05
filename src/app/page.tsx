import { Draft } from '@/components/Draft'
import { Elite } from '@/components/Elite'
import { Footer } from '@/components/Footer'
import { Lineup } from '@/components/Lineup'
import { YoureNext } from '@/components/Next'
import { Pathway } from '@/components/Pathway'
import { Shot } from '@/components/Shot'

export default function Home() {
  return (
    <main>
      <Lineup />
      <Shot />
      <Elite />
      <Draft />
      <Pathway />
      <YoureNext />
      <Footer />
    </main>
  )
}
