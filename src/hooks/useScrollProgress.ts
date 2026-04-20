import { useEffect, useState } from 'react';

export function useScrollProgress() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [currentSection, setCurrentSection] = useState('hero');
  return { scrollY, scrollSpeed, currentSection };
}
