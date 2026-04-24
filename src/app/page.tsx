import IntroSequence from '@/components/intro/intro-sequence';
import Hero from '@/components/sections/hero';
import About from '@/components/sections/about';
import NowPlaying from '@/components/sections/now-playing';
import Filmography from '@/components/sections/filmography';
import Intermission from '@/components/sections/intermission';
import Experience from '@/components/sections/experience';
import Skills from '@/components/sections/skills';
import Archive from '@/components/sections/archive';
import ScreeningRoom from '@/components/sections/screening-room';
import Contact from '@/components/sections/contact';

export default function Home() {
  return (
    <IntroSequence>
      <main>
        <Hero />
        <About />
        <NowPlaying />
        <Filmography />
        <Intermission />
        <Experience />
        <Skills />
        <Archive />
        <ScreeningRoom />
        <Contact />
      </main>
    </IntroSequence>
  );
}
