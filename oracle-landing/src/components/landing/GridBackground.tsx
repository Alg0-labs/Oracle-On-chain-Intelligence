export function GridBackground() {
  return (
    <>
      {/* Dot grid — indigo tint matching frontend */}
      <div
        style={{
          position:        'fixed',
          inset:           0,
          zIndex:          0,
          pointerEvents:   'none',
          backgroundImage: 'radial-gradient(rgba(99,102,241,0.18) 1px, transparent 1px)',
          backgroundSize:  '36px 36px',
          maskImage:       'radial-gradient(ellipse 75% 65% at 50% 30%, black 15%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 30%, black 15%, transparent 100%)',
        }}
      />
      {/* Ambient top glow */}
      <div
        style={{
          position:      'fixed',
          top:           0,
          left:          '50%',
          transform:     'translateX(-50%)',
          width:         900,
          height:        500,
          background:    'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />
    </>
  )
}
