import { Draft } from '@/components/Draft'
import { Elite } from '@/components/Elite'
import { Tape, Window } from '@/components/Energy'
import { Footer } from '@/components/Footer'
import { Lineup } from '@/components/Lineup'
import { YoureNext } from '@/components/Next'
import { Pathway } from '@/components/Pathway'

export default function Home() {
  return (
    <main>
      <Lineup />
      <Tape />
      <Window />
      <Elite />
      <Draft />
      <Pathway />
      <YoureNext />
      <Footer />
    </main>
  )
}
