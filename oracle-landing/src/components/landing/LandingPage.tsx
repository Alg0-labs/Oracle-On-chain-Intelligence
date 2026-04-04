import { Cursor }                  from './Cursor'
import { GridBackground }           from './GridBackground'
import { Navbar }                   from './Navbar'
import { Hero }                     from './Hero'
import { Marquee }                  from './Marquee'
import { Features }                 from './Features'
import { HowItWorks }               from './HowItWorks'
import { SendEth }                  from './SendEth'
import { StatsBand, RiskSection }   from './Stats'
import { CTA }                      from './CTA'
import { Footer }                   from './Footer'

export function LandingPage() {
  return (
    <>
      <Cursor />
      <GridBackground />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Features />
        <HowItWorks />
        <SendEth />
        <StatsBand />
        <RiskSection />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
