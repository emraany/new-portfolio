Enter plan mode with reasoning on maximum. Read CLAUDE.md for the complete design spec. Read all files in .claude/agents/ to understand the available specialist sub-agents: design-system, animation, sections, and interactivity.

You are orchestrating the build of a film-themed CS portfolio for Emraan Yusuf. The entire site is framed as a physical film strip running through a projector, with perforations on the left and right edges that scroll with the page, a countdown and spool-up intro sequence, cinematic section transitions, and a Letterboxd-integrated film section. The tech stack is Next.js with TypeScript, Tailwind CSS, Framer Motion, TMDB API, Letterboxd RSS feeds, and Supabase for visitor recommendations.

Plan the complete build across 7 phases. For phases with parallelizable work, explicitly dispatch work to multiple sub-agents in parallel. For phases with dependencies, use sequential dispatch. Here is the phase breakdown:

---

PHASE 1: SCAFFOLD (sequential, single agent)

Initialize a Next.js project with TypeScript and Tailwind CSS. Run the necessary create-next-app and install commands. Install these dependencies: framer-motion, @supabase/supabase-js, and any XML parsing library for RSS (such as fast-xml-parser). Set up the complete folder structure exactly as defined in CLAUDE.md under the Folder Structure section. Create empty placeholder files for every component, section, hook, library helper, API route, and data file that the other phases will fill in. Each placeholder file should export an empty component or stub function so imports do not break during phased development. Create a .env.local.example listing the three required environment variables (NEXT_PUBLIC_TMDB_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY). Do not build any actual content, styles, or interactions in this phase. This is only the skeleton.

---

PHASE 2: FOUNDATION (parallel, 2 sub-agents)

These two agents touch completely different files. No overlap. Dispatch in parallel.

Sub-agent A: Invoke the design-system agent.
Build the complete CSS foundation. This includes: all CSS custom properties from the CLAUDE.md color palette with semantic variable names, font loading for Playfair Display (700, 900), Inter (400, 500, 600), and JetBrains Mono (400, 500) using next/font/google, the animated film grain SVG noise overlay, and the left/right film perforation strips that scroll with page content. Also set up global base styles (background, text color, smooth scroll, selection color, box-sizing reset). The perforation scroll behavior is the most critical element here: as the user scrolls down, perforations must move upward at the same rate. Test this carefully.

Sub-agent B: Build the Python poster-processor script.
Create /scripts/poster-processor.py. It reads screenshots from /screenshots/[project-name]/ and outputs cinematic 2:3 portrait posters to /public/posters/[project-name].jpg. The processing pipeline: crop to 2:3 portrait ratio (center crop), crush blacks (deepen shadows, increase contrast), color grade (slight desaturation, push warmth toward amber), add baked-in film grain noise texture, apply vignette (darken edges), overlay the project title in a serif font at the bottom with "A EMRAAN YUSUF FILM" in small caps beneath, and save as web-optimized JPEG. Use Pillow and NumPy. The script should accept a --project flag to process a single project or process all projects if no flag is given. Include a --title-map or read project names from folder names, converting hyphens to spaces and title-casing.

---

PHASE 3: INTRO SEQUENCE (sequential, depends on Phase 2)

Invoke the animation agent. Build the full intro sequence per the exact timing in CLAUDE.md.

This includes: the SMPTE five-count countdown leader with circular sweep hand and focus reticle overlay, optional audio beeps (muted by default with a toggle, respecting browser autoplay policy), the white flash and sustained tone, the spool-up where the entire page content streams past rapidly with blurred subliminal flash-previews (5-10 flashes at about 120ms each), the deceleration, and the mechanical lock-in onto the hero section with a subtle bounce and brightness flicker.

Also build: localStorage tracking for first-visit vs return-visit (full sequence on first visit, quick 1-second iris open on return), the [ SKIP INTRO ] button that immediately jumps to the locked hero state, and the audio mute toggle.

This phase depends on Phase 2 because the intro needs the design system (colors, fonts) and the perforations (which appear during the spool-up) to already exist.

Also in this phase, build the reusable animation primitives that later phases will need: the darkroom develop hover effect (as a reusable component or CSS class), the Now Showing interstitial component (with hardCut, slowDissolve, and fadeToBlack variants), the iris open/close components, and the focus pull effect. These are all defined in the animation agent spec.

---

PHASE 4: CONTENT SECTIONS (parallel, 3 sub-agents)

All three sub-agents here are instances of the sections agent, each scoped to different files so they cannot overlap. Dispatch in parallel.

Sub-agent A owns these files ONLY:
- /src/components/sections/hero.tsx
- /src/components/sections/about.tsx
- /src/data/projects.ts (create the full project metadata file here so Sub-agent B can use it)

Build the Hero section with: "a film by" small caps, EMRAAN YUSUF in massive Playfair serif, subtitle line, two marquee badges (NOW HIRING in red accent, DALLAS TX), horizontal film strip with tech icons, focus reticle scroll indicator. Structure the hero so the intro animation components can wrap it.

Build the About section (The Logline) with: one-sentence logline large and centered, three film-label stats row (GENRE, RUNTIME, RATED), bio prose, and a [ VIEW PRESS KIT ] button that opens a dossier drawer sliding from the right with the resume content and a download button.

Create /src/data/projects.ts with all six projects and their complete metadata (title, slug, year, genre, logline, synopsis, starring, rating, production notes, URLs, award info).

Sub-agent B owns these files ONLY:
- /src/components/sections/now-playing.tsx
- /src/components/sections/filmography.tsx
- /src/components/sections/screening-panel.tsx
- /src/components/sections/intermission.tsx

Build the Now Playing section as a full-width spotlight for Conflict Coordinate with widescreen screenshot, film grain overlay, cinematic crop that expands on scroll-in, all metadata labels, and two ticket buttons.

Build the Filmography section as a 2-column poster grid (single column mobile). Each card loads its poster from /public/posters/[slug].jpg. Hover: darkroom develop effect (import from animation agent) + amber play button fade-in + logline overlay. Click: open the Screening Panel.

Build the Screening Panel as a right-side slide-in drawer with dark surface background, film grain, film strip border on left edge, focus reticle close button, full project metadata, award badge if applicable, and two ticket buttons. Read project data from /src/data/projects.ts.

Build the Intermission section per CLAUDE.md spec (red background, countdown, skip button).

Sub-agent C owns these files ONLY:
- /src/components/sections/experience.tsx
- /src/components/sections/skills.tsx
- /src/components/sections/archive.tsx

Build Experience (Production History) with focus reticle timeline nodes, three entries (ML Research Lead, ML Researcher, B.S. CS), expandable on click.

Build Skills (The Crew) in cast-list format with all categories from CLAUDE.md. Subtle upward roll animation on scroll-in.

Build Archive (Campus Involvement) in monospaced dot-leader format.

All three sub-agents should import animation components (darkroom develop, Now Showing, ticket buttons, focus reticle) from the animation and interactivity agent directories. Do not duplicate any animation or UI component logic.

---

PHASE 5: SCREENING ROOM + CREDITS (parallel, 2 sub-agents)

No file overlap. Dispatch in parallel.

Sub-agent A: Invoke the sections agent for the Screening Room.

Build the data integration layer first:
- /src/lib/tmdb.ts: helper functions for searching films by title, fetching film details by ID, and constructing poster image URLs. Use NEXT_PUBLIC_TMDB_API_KEY from environment.
- /src/lib/rss.ts: server-side function to fetch and parse the Letterboxd RSS feed at https://letterboxd.com/diinii32/rss/. Extract film title, star rating (from letterboxd:memberRating), and watch date from each entry. Use fast-xml-parser or similar.
- /src/lib/supabase.ts: initialize Supabase client using NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. Export typed functions: getAllRecommendations() and addRecommendation(data).
- /src/app/api/recommendations/route.ts: GET returns all recommendations from Supabase ordered by created_at desc. POST validates input (tmdb_id number required, title string required, poster_path string required, note string optional) and inserts into Supabase. Return appropriate status codes and error messages.

Then build the four Screening Room subsections:
- /src/data/top25.ts: create the top 25 film data with titles, TMDB IDs (placeholder numbers the user will fill in), star ratings, and influence notes where applicable.
- MY TOP 25: poster grid 5-wide from TMDB poster URLs. Click reveals an influence note card beneath the poster.
- RECENTLY WATCHED: horizontal scroll strip populated from RSS feed data. Each entry shows poster (fetched via TMDB search by title), amber star rating, and date.
- COMING SOON: user's watchlist from RSS, displayed as smaller posters with "COMING SOON TO A SCREENING ROOM NEAR YOU" header.
- WHAT SHOULD I WATCH?: search bar with TMDB autocomplete. User selects film, optionally types a note, submits. POST to /api/recommendations. Below: scrolling strip of all past recommendations from Supabase showing poster, title, note, timestamp.

Sub-agent B: Invoke the animation agent for the credits roll.

Build the credits roll auto-scroll component at /src/components/credits-roll/. Full viewport pure black, pure white text, no film grain. Auto-scrolls upward at about 60px per second. User can scroll manually or click [ SKIP TO END ]. Content structure per CLAUDE.md Section 10 Part B. When FIN reaches center, stop scroll, trigger iris close, fade to black. After 3 seconds show [ ROLL CREDITS AGAIN ] button. The perforations should still be visible during credits but blend into the black background.

---

PHASE 6: PERSISTENT UI (parallel, 3 sub-agents)

All three are instances of the interactivity agent, scoped to different files. No overlap. Dispatch in parallel.

Sub-agent A owns ONLY:
- /src/components/persistent/projector-cursor.tsx
- /src/hooks/useScrollProgress.ts

Build the useScrollProgress hook first (other sub-agents in this phase need it too, but since they will import it, build it here and the others will use it after this agent completes or they can build against its expected interface). The hook tracks scrollY, scrollSpeed, and currentSection (via IntersectionObserver on section elements).

Build the projector cursor: desktop only, soft 240px warm glow, 88% global brightness with 100% inside cursor radius, 50ms trailing lag, amber focus reticle at center, disabled on mobile with increased grain as compensation.

Sub-agent B owns ONLY:
- /src/components/persistent/frame-counter.tsx
- /src/components/persistent/ticket-nav.tsx

Build the frame counter: fixed top-right, JetBrains Mono 12px amber, REEL XX | XXXX format, increments per scroll, reel changes at section boundaries, blinking separator.

Build the ticket-stub nav: floating bottom-center, semi-transparent dark pill, ticket stub shaped items with perforation tear edges, active state glow, hover shake, click triggers Now Showing transition then smooth-scroll, mobile hamburger collapse.

Sub-agent C owns ONLY:
- /src/components/persistent/ambient-type.tsx
- /src/components/ui/focus-reticle.tsx
- /src/components/ui/ticket-button.tsx

Build the ambient background typography: one large faded word per section, Playfair 280px at 8% opacity, off-center, slight scroll parallax.

Build the focus reticle SVG component: reusable, props for size/color/spinning, crosshair-in-circle design.

Build the cinema ticket button: reusable, props for label/onClick/icon/variant/href, perforation tear edge, amber border, hover fill animation.

---

PHASE 7: INTEGRATION AND POLISH (sequential, single agent)

With all components built, wire everything together.

1. In /src/app/page.tsx: import and compose all section components in the correct order (Hero, About, Now Playing, Filmography, Intermission, Experience, Skills, Archive, Screening Room, Contact/Credits).

2. In /src/app/layout.tsx: mount all persistent elements (film perforations, film grain overlay, projector cursor, frame counter, ticket nav). Wrap the page in the intro sequence component so it plays on first load.

3. Wire up the Contact form submission to trigger the credits roll component.

4. Wire up the ticket nav click handlers to trigger Now Showing transitions before scrolling.

5. Ensure IntersectionObserver-based section detection works correctly for: frame counter reel changes, ticket nav active states, ambient typography parallax.

6. Full mobile responsiveness pass:
   - Perforations: 24px width
   - Projector cursor: disabled
   - Film grain: increased opacity
   - Filmography grid: single column
   - Screening Room poster grids: horizontal scroll
   - Ticket nav: hamburger collapse
   - Ambient type: scaled down
   - Credits roll: works on touch scroll
   - All text sizes: responsive scaling

7. Performance optimization:
   - Lazy-load all poster images and screenshots
   - Code-split the intro sequence (heavy, only needed once)
   - Code-split the credits roll (only triggered at the end)
   - Debounce scroll handlers
   - Use will-change on animated elements
   - Optimize film grain animation (requestAnimationFrame, not CSS animation if performance is poor)

8. Accessibility:
   - Ensure all interactive elements are keyboard-navigable
   - Add aria-labels to the ticket nav, screening panel, and recommendation form
   - Respect prefers-reduced-motion: disable the projector cursor, film grain animation, spool-up, and parallax effects. Keep the site fully functional without animations.

9. Final smoke test: verify the full experience from intro countdown through credits roll works end to end.

---

CRITICAL RULES FOR THE ORCHESTRATOR:

- Read CLAUDE.md before any work begins and ensure every sub-agent reads it too.
- When dispatching parallel sub-agents, verify that file ownership does not overlap between them.
- After each phase, produce a summary of what was built and what files were created before moving to the next phase.
- If any sub-agent produces output that contradicts CLAUDE.md (wrong colors, wrong fonts, wrong interaction patterns), halt and flag it immediately.
- Do not begin any phase before the previous phase is complete and verified.
- Every component must use the CSS variables from the design system. No hardcoded color values.
- Every image hover must use the darkroom develop effect. No exceptions.
- Every primary button must use the cinema ticket button component. No generic buttons.
- The focus reticle motif must be used for all bullets, nodes, close buttons, and markers.

Present the complete plan. I will review it and say execute when ready.
