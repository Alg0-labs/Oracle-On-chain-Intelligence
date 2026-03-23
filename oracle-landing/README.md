# ØRACLE — Landing Page (Vite + React + TypeScript)

## Quick Start

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo on vercel.com
3. Settings:
   - Root Directory: `.` (this folder)
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy

## Structure

```
src/
├── main.tsx                        Entry point
├── App.tsx                         Root component
├── styles/globals.css              CSS variables + keyframes
├── hooks/useScrollReveal.ts        IntersectionObserver hook
└── components/landing/
    ├── LandingPage.tsx             Composes all sections
    ├── Cursor.tsx                  Custom cursor with ring follow
    ├── GridBackground.tsx          Fixed dot grid overlay
    ├── Navbar.tsx                  Fixed nav, scroll-aware
    ├── Hero.tsx + Hero.module.css  Headline + SVG illustration
    ├── Marquee.tsx                 Infinite scrolling ticker
    ├── Features.tsx                3x2 feature grid
    ├── HowItWorks.tsx              Steps + live chat demo
    ├── SendEth.tsx                 Send flow + TX modal preview
    ├── Stats.tsx                   Stats band + risk section
    ├── CTA.tsx                     Full-width CTA
    └── Footer.tsx                  4-col footer + socials
```
