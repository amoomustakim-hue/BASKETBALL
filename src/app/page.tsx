import { Draft } from '@/components/Draft'
import { Footer } from '@/components/Footer'
import { Lineup } from '@/components/Lineup'
import { Alumni, Apply, Coach, Elite } from '@/components/Sections'

export default function Home() {
  return (
    <main>
      <Lineup />
      <Coach />
      <Draft />
      <Elite />
      <Alumni />
      <Apply />
      <Footer />
    </main>
  )
}
