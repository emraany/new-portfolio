import IntroSequence from '@/components/intro/intro-sequence';
import Hero from '@/components/sections/hero';
import About from '@/components/sections/about';
import Filmography from '@/components/sections/filmography';
import Experience from '@/components/sections/experience';
import Skills from '@/components/sections/skills';
import Archive from '@/components/sections/archive';
import ScreeningRoom from '@/components/sections/screening-room';
import { ReelBumper } from '@/components/ui/reel-bumper';
import EndCredits from '@/components/sections/end-credits';

export default function Home() {
  return (
    <IntroSequence>
      <main>
        <Hero />
        <About />
        <ReelBumper from={1} to={2} />
        <Filmography />
        <ReelBumper from={2} to={3} />
        <Experience />
        <Skills />
        <ReelBumper from={3} to={4} />
        <Archive />
        <ReelBumper from={4} to={5} />
        <ScreeningRoom />
        <ReelBumper from={5} to={6} />
        <EndCredits />
      </main>
    </IntroSequence>
  );
}
