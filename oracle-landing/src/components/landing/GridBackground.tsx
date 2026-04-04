export function GridBackground() {
  return (
    <div
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          0,
        pointerEvents:   'none',
        backgroundImage: `
          linear-gradient(rgba(124,109,250,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,109,250,0.035) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage:       'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }}
    />
  )
}
