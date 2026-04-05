import { Cursor }         from './Cursor'
import { GridBackground } from './GridBackground'
import { Navbar }         from './Navbar'
import { Hero }           from './Hero'
import { Features }       from './Features'
import { Networks }       from './Networks'
import { HowItWorks }     from './HowItWorks'
import { CTA }            from './CTA'
import { Footer }         from './Footer'

export function LandingPage() {
  return (
    <>
      <Cursor />
      <GridBackground />
      <Navbar />
      <main>
        <Hero />
        {/* <Marquee /> */}
        <Features />
        <Networks />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
