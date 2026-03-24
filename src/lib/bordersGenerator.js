// Generate 500+ Wedding Pattern Borders Programmatically

const colors = ['#C9A84C', '#D4AF37', '#B8860B', '#DAA520', '#FFD700', '#8B7355', '#CD853F', '#DEB887'];

// Helper to generate variations
const generateBorderVariations = (basePattern, count, category) => {
  const variations = [];
  for (let i = 0; i < count; i++) {
    const color = colors[i % colors.length];
    const strokeWidth = 1 + (i % 3);
    const offset = i * 5;
    
    variations.push({
      id: `${category}-${i + 1}`,
      name: `${basePattern.name} ${i + 1}`,
      svg: basePattern.generator(color, strokeWidth, offset, i)
    });
  }
  return variations;
};

// Geometric Patterns Generators
const geometricGenerators = [
  {
    name: 'Classic Frame',
    generator: (color, width, offset) => `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
      <rect x="${20 + offset}" y="${20 + offset}" width="${560 - offset * 2}" height="${760 - offset * 2}" fill="none" stroke="${color}" stroke-width="${width}"/>
      <rect x="${30 + offset}" y="${30 + offset}" width="${540 - offset * 2}" height="${740 - offset * 2}" fill="none" stroke="${color}" stroke-width="${width * 0.5}"/>
      <circle cx="${50 + offset}" cy="${50 + offset}" r="${8 + offset / 5}" fill="${color}"/>
      <circle cx="${550 - offset}" cy="${50 + offset}" r="${8 + offset / 5}" fill="${color}"/>
      <circle cx="${50 + offset}" cy="${750 - offset}" r="${8 + offset / 5}" fill="${color}"/>
      <circle cx="${550 - offset}" cy="${750 - offset}" r="${8 + offset / 5}" fill="${color}"/>
    </svg>`
  },
  {
    name: 'Double Border',
    generator: (color, width, offset) => `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
      <rect x="${15 + offset}" y="${15 + offset}" width="${570 - offset * 2}" height="${770 - offset * 2}" fill="none" stroke="${color}" stroke-width="${width}"/>
      <rect x="${25 + offset}" y="${25 + offset}" width="${550 - offset * 2}" height="${750 - offset * 2}" fill="none" stroke="${color}" stroke-width="${width}"/>
      <line x1="${15 + offset}" y1="${15 + offset}" x2="${25 + offset}" y2="${25 + offset}" stroke="${color}" stroke-width="${width * 0.5}"/>
      <line x1="${585 - offset}" y1="${15 + offset}" x2="${575 - offset}" y2="${25 + offset}" stroke="${color}" stroke-width="${width * 0.5}"/>
      <line x1="${15 + offset}" y1="${785 - offset}" x2="${25 + offset}" y2="${775 - offset}" stroke="${color}" stroke-width="${width * 0.5}"/>
      <line x1="${585 - offset}" y1="${785 - offset}" x2="${575 - offset}" y2="${775 - offset}" stroke="${color}" stroke-width="${width * 0.5}"/>
    </svg>`
  },
  {
    name: 'Corner Ornament',
    generator: (color, width, offset, idx) => {
      const size = 30 + (idx % 20);
      return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="560" height="760" fill="none" stroke="${color}" stroke-width="${width}"/>
        <path d="M20,20 L${20 + size},20 L${20 + size},${20 + size / 3} L${20 + size / 3},${20 + size / 3} L${20 + size / 3},${20 + size} L20,${20 + size} Z" fill="${color}"/>
        <path d="M580,20 L${580 - size},20 L${580 - size},${20 + size / 3} L${580 - size / 3},${20 + size / 3} L${580 - size / 3},${20 + size} L580,${20 + size} Z" fill="${color}"/>
        <path d="M20,780 L${20 + size},780 L${20 + size},${780 - size / 3} L${20 + size / 3},${780 - size / 3} L${20 + size / 3},${780 - size} L20,${780 - size} Z" fill="${color}"/>
        <path d="M580,780 L${580 - size},780 L${580 - size},${780 - size / 3} L${580 - size / 3},${780 - size / 3} L${580 - size / 3},${780 - size} L580,${780 - size} Z" fill="${color}"/>
      </svg>`;
    }
  },
  {
    name: 'Diamond Pattern',
    generator: (color, width, offset, idx) => {
      const spacing = 30 + (idx % 10);
      return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="diamond-${idx}" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
            <path d="M${spacing / 2},0 L${spacing},${spacing / 2} L${spacing / 2},${spacing} L0,${spacing / 2} Z" fill="none" stroke="${color}" stroke-width="${width * 0.8}"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="600" height="30" fill="url(#diamond-${idx})"/>
        <rect x="0" y="770" width="600" height="30" fill="url(#diamond-${idx})"/>
        <rect x="0" y="0" width="30" height="800" fill="url(#diamond-${idx})"/>
        <rect x="570" y="0" width="30" height="800" fill="url(#diamond-${idx})"/>
      </svg>`;
    }
  },
  {
    name: 'Zigzag Border',
    generator: (color, width, offset, idx) => {
      const amplitude = 10 + (idx % 15);
      const frequency = 20 + (idx % 10);
      let topPath = 'M0,20';
      let bottomPath = 'M0,780';
      for (let x = 0; x <= 600; x += frequency) {
        topPath += ` L${x},${20 + (x % (frequency * 2) === 0 ? amplitude : -amplitude)}`;
        bottomPath += ` L${x},${780 + (x % (frequency * 2) === 0 ? amplitude : -amplitude)}`;
      }
      return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <path d="${topPath}" fill="none" stroke="${color}" stroke-width="${width}"/>
        <path d="${bottomPath}" fill="none" stroke="${color}" stroke-width="${width}"/>
        <rect x="20" y="20" width="560" height="760" fill="none" stroke="${color}" stroke-width="${width * 0.5}"/>
      </svg>`;
    }
  }
];

// ─── Realistic Flower Helper Functions ────────────────────────────────────────

// Single realistic rose — centered at origin, ~50px natural diameter
// Place with: <g transform="translate(x,y) scale(s) rotate(r)">roseSVG</g>
function roseSVG(dk, md, lt) {
  return `
    <ellipse cx="1" cy="7" rx="20" ry="9" fill="rgba(0,0,0,0.16)"/>
    <path d="M-4,20 C-10,28 -7,34 -1,28 C1,25 1,21 -4,20 Z" fill="#3D6A2E"/>
    <path d="M4,20 C10,28 7,34 1,28 C-1,25 -1,21 4,20 Z" fill="#4E7838"/>
    <path d="M0,20 C-2,24 -2,30 0,28 C2,30 2,24 0,20 Z" fill="#406832"/>
    <line x1="0" y1="22" x2="0" y2="30" stroke="#2A4E20" stroke-width="1.5"/>
    <path d="M0,7 C-13,4 -25,-5 -23,-19 C-21,-33 -7,-35 0,-25 C7,-35 21,-33 23,-19 C25,-5 13,4 0,7 Z" fill="${dk}" opacity="0.82"/>
    <path d="M-1,4 C-17,-1 -28,-13 -26,-27 C-24,-40 -10,-37 -4,-25" fill="${dk}" opacity="0.76"/>
    <path d="M1,4 C17,-1 28,-13 26,-27 C24,-40 10,-37 4,-25" fill="${dk}" opacity="0.76"/>
    <path d="M-7,11 C-18,22 -16,34 -5,29 C-1,27 0,17 -2,11 Z" fill="${md}" opacity="0.88"/>
    <path d="M7,11 C18,22 16,34 5,29 C1,27 0,17 2,11 Z" fill="${md}" opacity="0.85"/>
    <path d="M0,2 C-11,-3 -20,-14 -18,-25 C-16,-36 -4,-34 0,-24 Z" fill="${md}"/>
    <path d="M0,2 C11,-3 20,-14 18,-25 C16,-36 4,-34 0,-24 Z" fill="${lt}" opacity="0.93"/>
    <path d="M-4,8 C-12,16 -15,27 -7,29 C-1,31 0,18 -2,8 Z" fill="${md}" opacity="0.82"/>
    <path d="M4,8 C12,16 15,27 7,29 C1,31 0,18 2,8 Z" fill="${dk}" opacity="0.78"/>
    <path d="M-2,0 C-9,-6 -10,-16 -5,-20 C-1,-24 3,-19 2,-13 C1,-7 0,-2 -2,0 Z" fill="${lt}"/>
    <path d="M2,0 C9,-6 10,-16 5,-20 C1,-24 -3,-19 -2,-13 C-1,-7 0,-2 2,0 Z" fill="${md}" opacity="0.9"/>
    <path d="M0,-5 C-5,-10 -6,-16 -2,-18 C2,-20 6,-14 4,-9 C2,-5 0,-3 0,-5 Z" fill="${dk}" opacity="0.95"/>
    <ellipse cx="0" cy="-8" rx="3.5" ry="2.5" fill="${dk}"/>
    <ellipse cx="-0.5" cy="-9" rx="1.8" ry="1.2" fill="${md}" opacity="0.55"/>
  `
}

// Single leaf — centered at origin, ~45px long pointing upward
function leafSVG(lc, ll) {
  return `
    <path d="M0,0 C-10,-10 -14,-26 -8,-38 C-4,-44 4,-44 8,-38 C14,-26 10,-10 0,0 Z" fill="${lc}"/>
    <line x1="0" y1="0" x2="0" y2="-38" stroke="${ll}" stroke-width="0.9" opacity="0.5"/>
    <line x1="0" y1="-8" x2="-7" y2="-18" stroke="${ll}" stroke-width="0.6" opacity="0.4"/>
    <line x1="0" y1="-8" x2="7" y2="-18" stroke="${ll}" stroke-width="0.6" opacity="0.4"/>
    <line x1="0" y1="-18" x2="-6" y2="-28" stroke="${ll}" stroke-width="0.5" opacity="0.35"/>
    <line x1="0" y1="-18" x2="6" y2="-28" stroke="${ll}" stroke-width="0.5" opacity="0.35"/>
    <line x1="0" y1="-26" x2="-4" y2="-34" stroke="${ll}" stroke-width="0.4" opacity="0.3"/>
    <line x1="0" y1="-26" x2="4" y2="-34" stroke="${ll}" stroke-width="0.4" opacity="0.3"/>
  `
}

// Small rose bud — centered at origin
function budSVG(pc, sc) {
  return `
    <path d="M-5,12 C-8,18 -6,22 -1,20 C1,19 2,15 -5,12 Z" fill="#3D6A2E"/>
    <path d="M5,12 C8,18 6,22 1,20 C-1,19 -2,15 5,12 Z" fill="#4E7838"/>
    <line x1="0" y1="14" x2="0" y2="22" stroke="#2A4E20" stroke-width="1.2"/>
    <path d="M0,12 C-6,10 -10,2 -8,-6 C-6,-14 -2,-16 0,-10 C2,-16 6,-14 8,-6 C10,2 6,10 0,12 Z" fill="${pc}"/>
    <path d="M0,12 C-4,8 -6,0 -4,-6 C-2,-12 2,-12 4,-6 C6,0 4,8 0,12 Z" fill="${sc}" opacity="0.7"/>
    <ellipse cx="0" cy="-2" rx="3" ry="4" fill="${sc}"/>
  `
}

// Berry cluster — centered at origin
function berrySVG(bc) {
  return `
    <circle cx="0" cy="-8" r="4.5" fill="${bc}"/>
    <circle cx="-6" cy="-2" r="4" fill="${bc}" opacity="0.85"/>
    <circle cx="6" cy="-2" r="4" fill="${bc}" opacity="0.9"/>
    <circle cx="-3" cy="4" r="3.5" fill="${bc}" opacity="0.8"/>
    <circle cx="3" cy="4" r="3.5" fill="${bc}" opacity="0.88"/>
    <circle cx="0" cy="-8" r="1" fill="rgba(255,255,255,0.4)"/>
    <circle cx="-6" cy="-2" r="0.9" fill="rgba(255,255,255,0.3)"/>
    <circle cx="6" cy="-2" r="0.9" fill="rgba(255,255,255,0.35)"/>
    <line x1="-3" y1="-12" x2="0" y2="-24" stroke="#3D6A2E" stroke-width="1"/>
    <line x1="0" y1="-24" x2="4" y2="-30" stroke="#3D6A2E" stroke-width="0.8"/>
    <line x1="0" y1="-24" x2="-4" y2="-30" stroke="#3D6A2E" stroke-width="0.8"/>
  `
}

// Lily petal — single petal centered at origin pointing upward
function lilyPetalSVG(pc, pd) {
  return `
    <path d="M-7,0 C-11,-8 -10,-24 -5,-32 C-2,-38 2,-38 5,-32 C10,-24 11,-8 7,0 Z" fill="${pc}"/>
    <line x1="0" y1="0" x2="0" y2="-32" stroke="${pd}" stroke-width="0.8" opacity="0.5"/>
    <line x1="0" y1="-8" x2="-5" y2="-18" stroke="${pd}" stroke-width="0.5" opacity="0.35"/>
    <line x1="0" y1="-8" x2="5" y2="-18" stroke="${pd}" stroke-width="0.5" opacity="0.35"/>
    <circle cx="-4" cy="-14" r="1" fill="${pd}" opacity="0.4"/>
    <circle cx="3" cy="-20" r="0.8" fill="${pd}" opacity="0.4"/>
    <circle cx="-3" cy="-26" r="0.7" fill="${pd}" opacity="0.35"/>
  `
}

// Full lily flower (6 petals + stamens)
function lilySVG(pc, pd, cc) {
  const petals = [0,60,120,180,240,300].map(a =>
    `<g transform="rotate(${a})">${lilyPetalSVG(pc, pd)}</g>`
  ).join('')
  const stamens = [0,45,90,135,180,225,270,315].map(a => {
    const r = a * Math.PI / 180
    const sx = Math.cos(r) * 12, sy = Math.sin(r) * 12
    return `<line x1="0" y1="0" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}" stroke="${cc}" stroke-width="0.8" opacity="0.7"/>
            <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="1.8" fill="${cc}"/>`
  }).join('')
  return `${petals}<circle cx="0" cy="0" r="6" fill="${cc}" opacity="0.6"/>${stamens}`
}

// Corner bouquet — large rose + 2 smaller roses + leaves + buds + berries
function cornerBouquet(palette, flipX, flipY) {
  const [dk1, md1, lt1] = palette[0]  // main rose
  const [dk2, md2, lt2] = palette[1]  // secondary rose
  const [dk3, md3, lt3] = palette[2]  // accent rose
  const lc = '#4A7C3F', ll = '#7BA86A', bc = '#8B1A2B'

  const sx = flipX ? -1 : 1
  const sy = flipY ? -1 : 1

  return `<g transform="scale(${sx},${sy})">
    <!-- Background leaves -->
    <g transform="translate(52,52) rotate(-40) scale(0.9)">${leafSVG(lc,ll)}</g>
    <g transform="translate(80,35) rotate(-15) scale(0.75)">${leafSVG(lc,ll)}</g>
    <g transform="translate(35,80) rotate(-70) scale(0.7)">${leafSVG(lc,ll)}</g>
    <g transform="translate(95,65) rotate(15) scale(0.65)">${leafSVG(lc,ll)}</g>
    <g transform="translate(65,95) rotate(-50) scale(0.6)">${leafSVG('#5A8C4A','#8AB87A')}</g>
    <g transform="translate(115,48) rotate(30) scale(0.55)">${leafSVG(lc,ll)}</g>
    <!-- Berries -->
    <g transform="translate(110,75) scale(0.7)">${berrySVG(bc)}</g>
    <g transform="translate(75,108) scale(0.65)">${berrySVG('#A0102A')}</g>
    <!-- Small buds -->
    <g transform="translate(120,55) scale(0.75) rotate(20)">${budSVG(md2, lt2)}</g>
    <g transform="translate(55,118) scale(0.7) rotate(-15)">${budSVG(md3, lt3)}</g>
    <!-- Secondary roses (smaller) -->
    <g transform="translate(100,58) scale(0.72) rotate(15)">${roseSVG(dk2,md2,lt2)}</g>
    <g transform="translate(58,100) scale(0.68) rotate(-10)">${roseSVG(dk3,md3,lt3)}</g>
    <!-- Main large rose (front) -->
    <g transform="translate(62,62) scale(1.1)">${roseSVG(dk1,md1,lt1)}</g>
  </g>`
}

// Side accent — smaller rose + leaves
function sideAccent(dk, md, lt) {
  const lc = '#4A7C3F', ll = '#7BA86A'
  return `
    <g transform="rotate(-25) scale(0.65)">${leafSVG(lc,ll)}</g>
    <g transform="translate(20,8) rotate(20) scale(0.55)">${leafSVG(lc,ll)}</g>
    <g transform="translate(-18,10) rotate(-30) scale(0.5)">${leafSVG(lc,ll)}</g>
    <g transform="scale(0.72)">${roseSVG(dk,md,lt)}</g>
  `
}

// ─── Rose Palettes ─────────────────────────────────────────────────────────────
const ROSE_PALETTES = {
  crimson:  [['#8B0000','#CC1428','#EE4050'], ['#701020','#A81830','#CC3848'], ['#901828','#B82035','#D83C50']],
  blush:    [['#B84060','#E06880','#F4A8B8'], ['#A03050','#C85070','#EE90A8'], ['#C85878','#E888A0','#F8C0D0']],
  ivory:    [['#A07848','#C8A060','#EED898'], ['#907038','#B89050','#DDB870'], ['#B89060','#D8B080','#F0D8B0']],
  mixed:    [['#8B0000','#CC1428','#EE4050'], ['#B84060','#E06880','#F4A8B8'], ['#A07848','#C8A060','#EED898']],
  burgundy: [['#6B1020','#8B1828','#C03040'], ['#5A0818','#781420','#A02838'], ['#7A1220','#9A1C2E','#C83040']],
  pink:     [['#C05878','#E07898','#F8B0C8'], ['#A84868','#D06888','#ECA8C0'], ['#D06880','#F090A8','#FFC8D8']],
}

// ─── Lily Palettes ─────────────────────────────────────────────────────────────
const LILY_PALETTES = {
  white:  { pc:'#F8F0E8', pd:'#C8B098', cc:'#D4A830' },
  pink:   { pc:'#F0A8B8', pd:'#C07890', cc:'#D4A830' },
  peach:  { pc:'#F0C8A0', pd:'#C09070', cc:'#D4A830' },
  cream:  { pc:'#F8E8C8', pd:'#C8A870', cc:'#C8900A' },
  blush:  { pc:'#F8D0D8', pd:'#C898A8', cc:'#C8A830' },
}

// Flower-Specific Border Generators
const flowerGenerators = {
  roses: [
    {
      name: 'Rose Corner Bouquet',
      generator: (color, width, offset, idx) => {
        const palKey = ['crimson','blush','ivory','mixed','burgundy','pink'][idx % 6]
        const pal = ROSE_PALETTES[palKey]
        const lc = '#4A7C3F', ll = '#7BA86A'
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0,0)">${cornerBouquet(pal,false,false)}</g>
          <g transform="translate(600,0)">${cornerBouquet(pal,true,false)}</g>
          <g transform="translate(0,800)">${cornerBouquet(pal,false,true)}</g>
          <g transform="translate(600,800)">${cornerBouquet(pal,true,true)}</g>
          <!-- Thin elegant frame -->
          <rect x="${130+offset}" y="${130+offset}" width="${340-offset*2}" height="${540-offset*2}" fill="none" stroke="${pal[0][1]}" stroke-width="0.6" opacity="0.3"/>
        </svg>`
      }
    },
    {
      name: 'Rose Top & Bottom Swag',
      generator: (color, width, offset, idx) => {
        const palKey = ['crimson','blush','ivory','mixed','burgundy','pink'][(idx+1) % 6]
        const pal = ROSE_PALETTES[palKey]
        const [dk, md, lt] = pal[0]
        const [dk2, md2, lt2] = pal[1]
        const [dk3, md3, lt3] = pal[2]
        const lc = '#4A7C3F', ll = '#7BA86A'
        let topSwag = '', botSwag = ''
        // Top swag — center rose + smaller flanking roses + leaves
        const positions = [300, 200, 400, 140, 460]
        positions.forEach((x, i) => {
          const s = i === 0 ? 1.0 : i < 3 ? 0.75 : 0.6
          const [d,m,l] = pal[i % 3]
          topSwag += `<g transform="translate(${x},55) scale(${s})">${roseSVG(d,m,l)}</g>`
          botSwag += `<g transform="translate(${x},745) scale(${s})">${roseSVG(d,m,l)}</g>`
        })
        // Leaves between roses
        const leafPos = [170,240,340,430]
        leafPos.forEach((x, i) => {
          const rot = i % 2 === 0 ? -55 : -125
          topSwag += `<g transform="translate(${x},45) rotate(${rot}) scale(0.7)">${leafSVG(lc,ll)}</g>`
          botSwag += `<g transform="translate(${x},755) rotate(${rot+180}) scale(0.7)">${leafSVG(lc,ll)}</g>`
        })
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          ${topSwag}${botSwag}
          <!-- Side accents -->
          <g transform="translate(25,300)">${sideAccent(dk2,md2,lt2)}</g>
          <g transform="translate(575,300) scale(-1,1)">${sideAccent(dk3,md3,lt3)}</g>
          <g transform="translate(25,500)">${sideAccent(dk3,md3,lt3)}</g>
          <g transform="translate(575,500) scale(-1,1)">${sideAccent(dk2,md2,lt2)}</g>
          <rect x="100" y="100" width="400" height="600" fill="none" stroke="${md}" stroke-width="0.5" opacity="0.25"/>
        </svg>`
      }
    },
    {
      name: 'Crimson Corner Roses',
      generator: (color, width, offset, idx) => {
        const pal = ROSE_PALETTES.crimson
        const lc = '#4A7C3F', ll = '#7BA86A', bc = '#6B1020'
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0,0)">${cornerBouquet(pal,false,false)}</g>
          <g transform="translate(600,0)">${cornerBouquet(pal,true,false)}</g>
          <g transform="translate(0,800)">${cornerBouquet(pal,false,true)}</g>
          <g transform="translate(600,800)">${cornerBouquet(pal,true,true)}</g>
          <!-- Thin double frame -->
          <rect x="135" y="135" width="330" height="530" fill="none" stroke="#CC1428" stroke-width="0.8" opacity="0.25"/>
          <rect x="138" y="138" width="324" height="524" fill="none" stroke="#CC1428" stroke-width="0.4" opacity="0.15"/>
        </svg>`
      }
    },
    {
      name: 'Blush Pink Roses',
      generator: (color, width, offset, idx) => {
        const pal = ROSE_PALETTES.blush
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0,0)">${cornerBouquet(pal,false,false)}</g>
          <g transform="translate(600,0)">${cornerBouquet(pal,true,false)}</g>
          <g transform="translate(0,800)">${cornerBouquet(pal,false,true)}</g>
          <g transform="translate(600,800)">${cornerBouquet(pal,true,true)}</g>
          <rect x="130" y="130" width="340" height="540" fill="none" stroke="#E06880" stroke-width="0.7" opacity="0.3"/>
        </svg>`
      }
    },
    {
      name: 'Ivory Cream Roses',
      generator: (color, width, offset, idx) => {
        const pal = ROSE_PALETTES.ivory
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0,0)">${cornerBouquet(pal,false,false)}</g>
          <g transform="translate(600,0)">${cornerBouquet(pal,true,false)}</g>
          <g transform="translate(0,800)">${cornerBouquet(pal,false,true)}</g>
          <g transform="translate(600,800)">${cornerBouquet(pal,true,true)}</g>
          <rect x="130" y="130" width="340" height="540" fill="none" stroke="#C8A060" stroke-width="0.7" opacity="0.3"/>
        </svg>`
      }
    },
    {
      name: 'Burgundy Roses',
      generator: (color, width, offset, idx) => {
        const pal = ROSE_PALETTES.burgundy
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0,0)">${cornerBouquet(pal,false,false)}</g>
          <g transform="translate(600,0)">${cornerBouquet(pal,true,false)}</g>
          <g transform="translate(0,800)">${cornerBouquet(pal,false,true)}</g>
          <g transform="translate(600,800)">${cornerBouquet(pal,true,true)}</g>
          <rect x="130" y="130" width="340" height="540" fill="none" stroke="#8B1828" stroke-width="0.7" opacity="0.3"/>
        </svg>`
      }
    },
    {
      name: 'Mixed Garden Roses',
      generator: (color, width, offset, idx) => {
        const pal = ROSE_PALETTES.mixed
        const lc = '#4A7C3F', ll = '#7BA86A'
        let midRow = ''
        // Small roses along left and right sides
        const sideY = [220, 310, 400, 490, 580]
        sideY.forEach((y, i) => {
          const [d,m,l] = ROSE_PALETTES.mixed[i % 3]
          midRow += `<g transform="translate(30,${y}) scale(0.6)">${roseSVG(d,m,l)}</g>`
          midRow += `<g transform="translate(570,${y}) scale(0.6) scale(-1,1)">${roseSVG(d,m,l)}</g>`
          midRow += `<g transform="translate(30,${y}) rotate(-45) scale(0.5)">${leafSVG(lc,ll)}</g>`
          midRow += `<g transform="translate(570,${y}) rotate(45) scale(0.5)">${leafSVG(lc,ll)}</g>`
        })
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0,0)">${cornerBouquet(pal,false,false)}</g>
          <g transform="translate(600,0)">${cornerBouquet(pal,true,false)}</g>
          <g transform="translate(0,800)">${cornerBouquet(pal,false,true)}</g>
          <g transform="translate(600,800)">${cornerBouquet(pal,true,true)}</g>
          ${midRow}
        </svg>`
      }
    },
  ],
  lilies: [
    {
      name: 'Lily Corner',
      generator: (color, width, offset, idx) => {
        const palKeys = ['white','pink','peach','cream','blush']
        const pal = LILY_PALETTES[palKeys[idx % 5]]
        const lc = '#4A7C3F', ll = '#7BA86A'
        const lilyEl = lilySVG(pal.pc, pal.pd, pal.cc)
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <!-- Leaves at corners -->
          <g transform="translate(55,55) rotate(-45) scale(0.85)">${leafSVG(lc,ll)}</g>
          <g transform="translate(80,38) rotate(-20) scale(0.7)">${leafSVG(lc,ll)}</g>
          <g transform="translate(38,80) rotate(-70) scale(0.7)">${leafSVG(lc,ll)}</g>
          <g transform="translate(545,55) rotate(45) scale(0.85)">${leafSVG(lc,ll)}</g>
          <g transform="translate(520,38) rotate(20) scale(0.7)">${leafSVG(lc,ll)}</g>
          <g transform="translate(562,80) rotate(70) scale(0.7)">${leafSVG(lc,ll)}</g>
          <g transform="translate(55,745) rotate(45) scale(0.85)">${leafSVG(lc,ll)}</g>
          <g transform="translate(80,762) rotate(20) scale(0.7)">${leafSVG(lc,ll)}</g>
          <g transform="translate(38,720) rotate(70) scale(0.7)">${leafSVG(lc,ll)}</g>
          <g transform="translate(545,745) rotate(-45) scale(0.85)">${leafSVG(lc,ll)}</g>
          <g transform="translate(520,762) rotate(-20) scale(0.7)">${leafSVG(lc,ll)}</g>
          <g transform="translate(562,720) rotate(-70) scale(0.7)">${leafSVG(lc,ll)}</g>
          <!-- Lily flowers at corners -->
          <g transform="translate(62,62) scale(1.0)">${lilyEl}</g>
          <g transform="translate(538,62) scale(1.0)">${lilyEl}</g>
          <g transform="translate(62,738) scale(1.0)">${lilyEl}</g>
          <g transform="translate(538,738) scale(1.0)">${lilyEl}</g>
          <!-- Thin frame -->
          <rect x="130" y="130" width="340" height="540" fill="none" stroke="${pal.pd}" stroke-width="0.7" opacity="0.3"/>
        </svg>`
      }
    },
    {
      name: 'Lily Cascade',
      generator: (color, width, offset, idx) => {
        const palKeys = ['white','pink','peach','cream','blush']
        const pal = LILY_PALETTES[palKeys[(idx+2) % 5]]
        const lc = '#4A7C3F', ll = '#7BA86A'
        const lilyEl = lilySVG(pal.pc, pal.pd, pal.cc)
        let cascade = ''
        const leftY =  [120, 200, 290, 380, 460, 550, 640, 720]
        leftY.forEach((y, i) => {
          const s = 0.7 + (i % 3) * 0.08
          const rot = (i % 4 - 1.5) * 15
          cascade += `<g transform="translate(42,${y}) rotate(${rot}) scale(${s})">${lilyEl}</g>`
          cascade += `<g transform="translate(42,${y}) rotate(${rot+20}) scale(0.55)">${leafSVG(lc,ll)}</g>`
          cascade += `<g transform="translate(558,${y}) rotate(${-rot}) scale(${s})">${lilyEl}</g>`
          cascade += `<g transform="translate(558,${y}) rotate(${-rot-20}) scale(0.55)">${leafSVG(lc,ll)}</g>`
        })
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          ${cascade}
          <!-- Top & bottom accent -->
          <g transform="translate(300,42) scale(1.1)">${lilyEl}</g>
          <g transform="translate(300,758) scale(1.1)">${lilyEl}</g>
          <rect x="110" y="110" width="380" height="580" fill="none" stroke="${pal.pd}" stroke-width="0.6" opacity="0.25"/>
        </svg>`
      }
    },
    {
      name: 'Oriental Lily Frame',
      generator: (color, width, offset, idx) => {
        const palKeys = ['white','pink','peach','cream','blush']
        const pal = LILY_PALETTES[palKeys[(idx+1) % 5]]
        const lc = '#4A7C3F', ll = '#7BA86A', bc = '#8B1A2B'
        const lilyEl = lilySVG(pal.pc, pal.pd, pal.cc)
        const topBotX = [120, 200, 300, 400, 480]
        let frame = ''
        topBotX.forEach((x, i) => {
          const s = i === 2 ? 1.0 : 0.75
          frame += `<g transform="translate(${x},50) scale(${s})">${lilyEl}</g>`
          frame += `<g transform="translate(${x},750) scale(${s})">${lilyEl}</g>`
          if (i < 4) {
            frame += `<g transform="translate(${(x+topBotX[i+1])/2},42) rotate(-90) scale(0.55)">${leafSVG(lc,ll)}</g>`
            frame += `<g transform="translate(${(x+topBotX[i+1])/2},758) rotate(90) scale(0.55)">${leafSVG(lc,ll)}</g>`
          }
        })
        const sideY = [180, 280, 400, 520, 620]
        sideY.forEach((y, i) => {
          const s = 0.72
          frame += `<g transform="translate(40,${y}) rotate(-90) scale(${s})">${lilyEl}</g>`
          frame += `<g transform="translate(560,${y}) rotate(90) scale(${s})">${lilyEl}</g>`
        })
        // berries
        frame += `<g transform="translate(95,95) scale(0.7)">${berrySVG(bc)}</g>`
        frame += `<g transform="translate(505,95) scale(0.7)">${berrySVG(bc)}</g>`
        frame += `<g transform="translate(95,705) scale(0.7)">${berrySVG(bc)}</g>`
        frame += `<g transform="translate(505,705) scale(0.7)">${berrySVG(bc)}</g>`
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          ${frame}
          <rect x="108" y="108" width="384" height="584" fill="none" stroke="${pal.pd}" stroke-width="0.7" opacity="0.3"/>
        </svg>`
      }
    },
    {
      name: 'White Lily & Leaf',
      generator: (color, width, offset, idx) => {
        const pal = LILY_PALETTES.white
        const lc = '#3A6028', ll = '#6A9858', bc = '#8B1A2B'
        const lilyEl = lilySVG(pal.pc, pal.pd, pal.cc)
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <!-- Corner arrangements -->
          <g transform="translate(60,60) scale(1.0)">${lilyEl}</g>
          <g transform="translate(45,60) rotate(-55) scale(0.8)">${leafSVG(lc,ll)}</g>
          <g transform="translate(78,38) rotate(-20) scale(0.7)">${leafSVG(lc,ll)}</g>
          <g transform="translate(35,82) rotate(-75) scale(0.65)">${leafSVG(lc,ll)}</g>
          <g transform="translate(540,60) scale(1.0)">${lilyEl}</g>
          <g transform="translate(555,60) rotate(55) scale(0.8)">${leafSVG(lc,ll)}</g>
          <g transform="translate(522,38) rotate(20) scale(0.7)">${leafSVG(lc,ll)}</g>
          <g transform="translate(565,82) rotate(75) scale(0.65)">${leafSVG(lc,ll)}</g>
          <g transform="translate(60,740) scale(1.0)">${lilyEl}</g>
          <g transform="translate(45,740) rotate(55) scale(0.8)">${leafSVG(lc,ll)}</g>
          <g transform="translate(78,762) rotate(20) scale(0.7)">${leafSVG(lc,ll)}</g>
          <g transform="translate(35,718) rotate(75) scale(0.65)">${leafSVG(lc,ll)}</g>
          <g transform="translate(540,740) scale(1.0)">${lilyEl}</g>
          <g transform="translate(555,740) rotate(-55) scale(0.8)">${leafSVG(lc,ll)}</g>
          <g transform="translate(522,762) rotate(-20) scale(0.7)">${leafSVG(lc,ll)}</g>
          <g transform="translate(565,718) rotate(-75) scale(0.65)">${leafSVG(lc,ll)}</g>
          <!-- Center top & bottom -->
          <g transform="translate(300,52) scale(1.05)">${lilyEl}</g>
          <g transform="translate(270,42) rotate(-45) scale(0.65)">${leafSVG(lc,ll)}</g>
          <g transform="translate(330,42) rotate(45) scale(0.65)">${leafSVG(lc,ll)}</g>
          <g transform="translate(300,748) scale(1.05)">${lilyEl}</g>
          <g transform="translate(270,758) rotate(45) scale(0.65)">${leafSVG(lc,ll)}</g>
          <g transform="translate(330,758) rotate(-45) scale(0.65)">${leafSVG(lc,ll)}</g>
          <g transform="translate(90,92) scale(0.65)">${berrySVG(bc)}</g>
          <g transform="translate(510,92) scale(0.65)">${berrySVG(bc)}</g>
          <g transform="translate(90,708) scale(0.65)">${berrySVG(bc)}</g>
          <g transform="translate(510,708) scale(0.65)">${berrySVG(bc)}</g>
          <rect x="122" y="122" width="356" height="556" fill="none" stroke="${pal.pd}" stroke-width="0.6" opacity="0.28"/>
        </svg>`
      }
    },
  ],
  orchids: [
    {
      name: 'Orchid Cascade',
      generator: (color, width, offset, idx) => {
        const size = 15 + (idx % 10);
        const spacing = 60 + (idx % 20);
        let orchids = '';
        for (let y = 80; y < 720; y += spacing) {
          orchids += `<g transform="translate(30,${y})">
            <ellipse cx="0" cy="0" rx="${size * 0.6}" ry="${size * 0.4}" fill="none" stroke="${color}" stroke-width="${width}"/>
            <ellipse cx="${-size * 0.4}" cy="${size * 0.3}" rx="${size * 0.5}" ry="${size * 0.7}" fill="none" stroke="${color}" stroke-width="${width * 0.8}"/>
            <ellipse cx="${size * 0.4}" cy="${size * 0.3}" rx="${size * 0.5}" ry="${size * 0.7}" fill="none" stroke="${color}" stroke-width="${width * 0.8}"/>
            <path d="M0,${size * 0.5} Q${size * 0.2},${size * 0.8} 0,${size}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          </g>`;
          orchids += `<g transform="translate(570,${y}) scale(-1,1)">
            <ellipse cx="0" cy="0" rx="${size * 0.6}" ry="${size * 0.4}" fill="none" stroke="${color}" stroke-width="${width}"/>
            <ellipse cx="${-size * 0.4}" cy="${size * 0.3}" rx="${size * 0.5}" ry="${size * 0.7}" fill="none" stroke="${color}" stroke-width="${width * 0.8}"/>
            <ellipse cx="${size * 0.4}" cy="${size * 0.3}" rx="${size * 0.5}" ry="${size * 0.7}" fill="none" stroke="${color}" stroke-width="${width * 0.8}"/>
          </g>`;
        }
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="25" width="550" height="750" fill="none" stroke="${color}" stroke-width="${width}"/>
          ${orchids}
        </svg>`;
      }
    }
  ],
  peonies: [
    {
      name: 'Peony Bloom',
      generator: (color, width, offset, idx) => {
        const size = 22 + (idx % 15);
        const layers = 3 + (idx % 2);
        let peony = '';
        for (let layer = 0; layer < layers; layer++) {
          const layerSize = size * (1 - layer * 0.25);
          peony += `<circle cx="0" cy="0" r="${layerSize}" fill="none" stroke="${color}" stroke-width="${width * (1 - layer * 0.2)}" opacity="${1 - layer * 0.15}"/>`;
        }
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="25" width="550" height="750" fill="none" stroke="${color}" stroke-width="${width}"/>
          <g transform="translate(${50 + offset},${50 + offset})">${peony}<circle cx="0" cy="0" r="${size * 0.2}" fill="${color}"/></g>
          <g transform="translate(${550 - offset},${50 + offset})">${peony}<circle cx="0" cy="0" r="${size * 0.2}" fill="${color}"/></g>
          <g transform="translate(${50 + offset},${750 - offset})">${peony}<circle cx="0" cy="0" r="${size * 0.2}" fill="${color}"/></g>
          <g transform="translate(${550 - offset},${750 - offset})">${peony}<circle cx="0" cy="0" r="${size * 0.2}" fill="${color}"/></g>
        </svg>`;
      }
    }
  ],
  tulips: [
    {
      name: 'Tulip Border',
      generator: (color, width, offset, idx) => {
        const size = 18 + (idx % 12);
        const spacing = 55 + (idx % 25);
        let tulips = '';
        for (let x = 70; x < 530; x += spacing) {
          tulips += `<g transform="translate(${x},40)">
            <ellipse cx="0" cy="0" rx="${size * 0.5}" ry="${size}" fill="none" stroke="${color}" stroke-width="${width}"/>
            <ellipse cx="${-size * 0.3}" cy="${size * 0.2}" rx="${size * 0.4}" ry="${size * 0.8}" fill="none" stroke="${color}" stroke-width="${width * 0.8}"/>
            <ellipse cx="${size * 0.3}" cy="${size * 0.2}" rx="${size * 0.4}" ry="${size * 0.8}" fill="none" stroke="${color}" stroke-width="${width * 0.8}"/>
            <line x1="0" y1="${size}" x2="0" y2="${size * 1.8}" stroke="${color}" stroke-width="${width * 0.7}"/>
          </g>`;
          tulips += `<g transform="translate(${x},760) scale(1,-1)">
            <ellipse cx="0" cy="0" rx="${size * 0.5}" ry="${size}" fill="none" stroke="${color}" stroke-width="${width}"/>
            <ellipse cx="${-size * 0.3}" cy="${size * 0.2}" rx="${size * 0.4}" ry="${size * 0.8}" fill="none" stroke="${color}" stroke-width="${width * 0.8}"/>
            <ellipse cx="${size * 0.3}" cy="${size * 0.2}" rx="${size * 0.4}" ry="${size * 0.8}" fill="none" stroke="${color}" stroke-width="${width * 0.8}"/>
          </g>`;
        }
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="25" width="550" height="750" fill="none" stroke="${color}" stroke-width="${width}"/>
          ${tulips}
        </svg>`;
      }
    }
  ],
  sunflowers: [
    {
      name: 'Sunflower',
      generator: (color, width, offset, idx) => {
        const size = 20 + (idx % 15);
        const petals = 12 + (idx % 4);
        let sunflower = '';
        for (let i = 0; i < petals; i++) {
          const angle = (i * 360) / petals;
          const x = size * 0.8 * Math.cos((angle * Math.PI) / 180);
          const y = size * 0.8 * Math.sin((angle * Math.PI) / 180);
          sunflower += `<ellipse cx="${x}" cy="${y}" rx="${size * 0.3}" ry="${size * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.8}" transform="rotate(${angle} ${x} ${y})"/>`;
        }
        sunflower += `<circle cx="0" cy="0" r="${size * 0.4}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="25" width="550" height="750" fill="none" stroke="${color}" stroke-width="${width}"/>
          <g transform="translate(${50 + offset},${50 + offset})">${sunflower}</g>
          <g transform="translate(${550 - offset},${50 + offset})">${sunflower}</g>
          <g transform="translate(${50 + offset},${750 - offset})">${sunflower}</g>
          <g transform="translate(${550 - offset},${750 - offset})">${sunflower}</g>
        </svg>`;
      }
    }
  ],
  daisies: [
    {
      name: 'Daisy Chain',
      generator: (color, width, offset, idx) => {
        const size = 10 + (idx % 8);
        const spacing = 45 + (idx % 20);
        const petals = 8 + (idx % 4);
        let daisies = '';
        for (let x = 60; x < 540; x += spacing) {
          let daisy = '';
          for (let i = 0; i < petals; i++) {
            const angle = (i * 360) / petals;
            const px = size * 0.7 * Math.cos((angle * Math.PI) / 180);
            const py = size * 0.7 * Math.sin((angle * Math.PI) / 180);
            daisy += `<ellipse cx="${px}" cy="${py}" rx="${size * 0.25}" ry="${size * 0.4}" fill="none" stroke="${color}" stroke-width="${width * 0.7}" transform="rotate(${angle} ${px} ${py})"/>`;
          }
          daisy += `<circle cx="0" cy="0" r="${size * 0.2}" fill="${color}"/>`;
          daisies += `<g transform="translate(${x},35)">${daisy}</g>`;
          daisies += `<g transform="translate(${x},765)">${daisy}</g>`;
        }
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="560" height="760" fill="none" stroke="${color}" stroke-width="${width}"/>
          ${daisies}
        </svg>`;
      }
    }
  ],
  carnations: [
    {
      name: 'Carnation Ruffle',
      generator: (color, width, offset, idx) => {
        const size = 16 + (idx % 10);
        const ruffles = 6 + (idx % 3);
        let carnation = '';
        for (let i = 0; i < ruffles; i++) {
          const r = size * (0.4 + i * 0.15);
          carnation += `<circle cx="0" cy="0" r="${r}" fill="none" stroke="${color}" stroke-width="${width * 0.8}" stroke-dasharray="${r * 0.3},${r * 0.2}"/>`;
        }
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="25" width="550" height="750" fill="none" stroke="${color}" stroke-width="${width}"/>
          <g transform="translate(${50 + offset},${50 + offset})">${carnation}</g>
          <g transform="translate(${550 - offset},${50 + offset})">${carnation}</g>
          <g transform="translate(${50 + offset},${750 - offset})">${carnation}</g>
          <g transform="translate(${550 - offset},${750 - offset})">${carnation}</g>
        </svg>`;
      }
    }
  ],
  hydrangeas: [
    {
      name: 'Hydrangea Cluster',
      generator: (color, width, offset, idx) => {
        const size = 8 + (idx % 6);
        const clusterSize = 4 + (idx % 3);
        let cluster = '';
        for (let i = 0; i < clusterSize; i++) {
          for (let j = 0; j < clusterSize; j++) {
            const x = (i - clusterSize / 2) * size * 0.8;
            const y = (j - clusterSize / 2) * size * 0.8;
            cluster += `<g transform="translate(${x},${y})">
              <circle cx="0" cy="0" r="${size * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
              <circle cx="${size * 0.2}" cy="${-size * 0.2}" r="${size * 0.3}" fill="none" stroke="${color}" stroke-width="${width * 0.5}"/>
              <circle cx="${-size * 0.2}" cy="${size * 0.2}" r="${size * 0.3}" fill="none" stroke="${color}" stroke-width="${width * 0.5}"/>
            </g>`;
          }
        }
        return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="25" width="550" height="750" fill="none" stroke="${color}" stroke-width="${width}"/>
          <g transform="translate(${50 + offset},${50 + offset})">${cluster}</g>
          <g transform="translate(${550 - offset},${50 + offset})">${cluster}</g>
          <g transform="translate(${50 + offset},${750 - offset})">${cluster}</g>
          <g transform="translate(${550 - offset},${750 - offset})">${cluster}</g>
        </svg>`;
      }
    }
  ]
};

// Floral Patterns Generators (keeping original for backward compatibility)
const floralGenerators = [
  {
    name: 'Rose Corner',
    generator: (color, width, offset, idx) => {
      const size = 15 + (idx % 10);
      return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="25" width="550" height="750" fill="none" stroke="${color}" stroke-width="${width}"/>
        <g transform="translate(${40 + offset},${40 + offset})">
          <circle cx="0" cy="0" r="${size}" fill="none" stroke="${color}" stroke-width="${width}"/>
          <circle cx="${-size * 0.5}" cy="${-size * 0.5}" r="${size * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          <circle cx="${size * 0.5}" cy="${-size * 0.5}" r="${size * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          <circle cx="${-size * 0.5}" cy="${size * 0.5}" r="${size * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
        </g>
        <g transform="translate(${560 - offset},${40 + offset}) scale(-1,1)">
          <circle cx="0" cy="0" r="${size}" fill="none" stroke="${color}" stroke-width="${width}"/>
          <circle cx="${-size * 0.5}" cy="${-size * 0.5}" r="${size * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          <circle cx="${size * 0.5}" cy="${-size * 0.5}" r="${size * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
        </g>
        <g transform="translate(${40 + offset},${760 - offset}) scale(1,-1)">
          <circle cx="0" cy="0" r="${size}" fill="none" stroke="${color}" stroke-width="${width}"/>
          <circle cx="${-size * 0.5}" cy="${-size * 0.5}" r="${size * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
        </g>
        <g transform="translate(${560 - offset},${760 - offset}) scale(-1,-1)">
          <circle cx="0" cy="0" r="${size}" fill="none" stroke="${color}" stroke-width="${width}"/>
          <circle cx="${-size * 0.5}" cy="${-size * 0.5}" r="${size * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
        </g>
      </svg>`;
    }
  },
  {
    name: 'Vine Pattern',
    generator: (color, width, offset, idx) => {
      const waveHeight = 15 + (idx % 10);
      const waveLength = 40 + (idx % 20);
      let topPath = `M30,30`;
      let bottomPath = `M30,770`;
      for (let x = 30; x < 570; x += waveLength) {
        topPath += ` Q${x + waveLength / 2},${30 - waveHeight} ${x + waveLength},30`;
        bottomPath += ` Q${x + waveLength / 2},${770 + waveHeight} ${x + waveLength},770`;
      }
      return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <path d="${topPath}" fill="none" stroke="${color}" stroke-width="${width}"/>
        <path d="${bottomPath}" fill="none" stroke="${color}" stroke-width="${width}"/>
        <path d="M30,50 L30,750" stroke="${color}" stroke-width="${width * 0.7}"/>
        <path d="M570,50 L570,750" stroke="${color}" stroke-width="${width * 0.7}"/>
      </svg>`;
    }
  },
  {
    name: 'Lotus Flower',
    generator: (color, width, offset, idx) => {
      const petalSize = 15 + (idx % 8);
      return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="540" height="740" fill="none" stroke="${color}" stroke-width="${width}"/>
        <g transform="translate(300,${40 + offset})">
          <ellipse cx="0" cy="0" rx="${petalSize * 1.3}" ry="${petalSize * 0.8}" fill="none" stroke="${color}" stroke-width="${width}"/>
          <ellipse cx="${-petalSize}" cy="0" rx="${petalSize * 0.8}" ry="${petalSize * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          <ellipse cx="${petalSize}" cy="0" rx="${petalSize * 0.8}" ry="${petalSize * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          <circle cx="0" cy="0" r="${petalSize * 0.2}" fill="${color}"/>
        </g>
        <g transform="translate(300,${760 - offset}) scale(1,-1)">
          <ellipse cx="0" cy="0" rx="${petalSize * 1.3}" ry="${petalSize * 0.8}" fill="none" stroke="${color}" stroke-width="${width}"/>
          <ellipse cx="${-petalSize}" cy="0" rx="${petalSize * 0.8}" ry="${petalSize * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          <ellipse cx="${petalSize}" cy="0" rx="${petalSize * 0.8}" ry="${petalSize * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          <circle cx="0" cy="0" r="${petalSize * 0.2}" fill="${color}"/>
        </g>
      </svg>`;
    }
  },
  {
    name: 'Cherry Blossom',
    generator: (color, width, offset, idx) => {
      const petalRadius = 5 + (idx % 5);
      const spacing = 60 + (idx % 30);
      let blossoms = '';
      for (let x = 60; x < 540; x += spacing) {
        blossoms += `<g transform="translate(${x},40)">
          <circle cx="0" cy="0" r="${petalRadius * 1.5}" fill="none" stroke="${color}" stroke-width="${width * 0.8}"/>
          <circle cx="0" cy="${-petalRadius * 1.2}" r="${petalRadius}" fill="none" stroke="${color}" stroke-width="${width * 0.6}"/>
          <circle cx="${petalRadius * 1.2}" cy="0" r="${petalRadius}" fill="none" stroke="${color}" stroke-width="${width * 0.6}"/>
          <circle cx="0" cy="${petalRadius * 1.2}" r="${petalRadius}" fill="none" stroke="${color}" stroke-width="${width * 0.6}"/>
          <circle cx="${-petalRadius * 1.2}" cy="0" r="${petalRadius}" fill="none" stroke="${color}" stroke-width="${width * 0.6}"/>
          <circle cx="0" cy="0" r="${petalRadius * 0.3}" fill="${color}"/>
        </g>`;
        blossoms += `<g transform="translate(${x},760)">
          <circle cx="0" cy="0" r="${petalRadius * 1.5}" fill="none" stroke="${color}" stroke-width="${width * 0.8}"/>
          <circle cx="0" cy="${-petalRadius * 1.2}" r="${petalRadius}" fill="none" stroke="${color}" stroke-width="${width * 0.6}"/>
          <circle cx="${petalRadius * 1.2}" cy="0" r="${petalRadius}" fill="none" stroke="${color}" stroke-width="${width * 0.6}"/>
        </g>`;
      }
      return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="25" width="550" height="750" fill="none" stroke="${color}" stroke-width="${width}"/>
        ${blossoms}
      </svg>`;
    }
  },
  {
    name: 'Leaf Pattern',
    generator: (color, width, offset, idx) => {
      const leafSize = 12 + (idx % 8);
      const spacing = 40 + (idx % 20);
      let leaves = '';
      for (let y = 60; y < 740; y += spacing) {
        leaves += `<ellipse cx="25" cy="${y}" rx="${leafSize * 0.5}" ry="${leafSize}" fill="none" stroke="${color}" stroke-width="${width}" transform="rotate(45 25 ${y})"/>`;
        leaves += `<ellipse cx="575" cy="${y}" rx="${leafSize * 0.5}" ry="${leafSize}" fill="none" stroke="${color}" stroke-width="${width}" transform="rotate(-45 575 ${y})"/>`;
      }
      return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="560" height="760" fill="none" stroke="${color}" stroke-width="${width}"/>
        ${leaves}
      </svg>`;
    }
  }
];

// Indian/Mandala Patterns
const mandalaGenerators = [
  {
    name: 'Mandala Corner',
    generator: (color, width, offset, idx) => {
      const radius = 20 + (idx % 15);
      const petals = 8 + (idx % 4);
      let mandala = '';
      for (let i = 0; i < petals; i++) {
        const angle = (i * 360) / petals;
        mandala += `<ellipse cx="${radius * 0.7 * Math.cos((angle * Math.PI) / 180)}" cy="${radius * 0.7 * Math.sin((angle * Math.PI) / 180)}" rx="${radius * 0.3}" ry="${radius * 0.5}" fill="none" stroke="${color}" stroke-width="${width * 0.7}" transform="rotate(${angle} ${radius * 0.7 * Math.cos((angle * Math.PI) / 180)} ${radius * 0.7 * Math.sin((angle * Math.PI) / 180)})"/>`;
      }
      return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="25" width="550" height="750" fill="none" stroke="${color}" stroke-width="${width}"/>
        <g transform="translate(50,50)">
          <circle cx="0" cy="0" r="${radius}" fill="none" stroke="${color}" stroke-width="${width}"/>
          ${mandala}
          <circle cx="0" cy="0" r="${radius * 0.2}" fill="${color}"/>
        </g>
        <g transform="translate(550,50) scale(-1,1)">
          <circle cx="0" cy="0" r="${radius}" fill="none" stroke="${color}" stroke-width="${width}"/>
          ${mandala}
          <circle cx="0" cy="0" r="${radius * 0.2}" fill="${color}"/>
        </g>
        <g transform="translate(50,750) scale(1,-1)">
          <circle cx="0" cy="0" r="${radius}" fill="none" stroke="${color}" stroke-width="${width}"/>
          ${mandala}
          <circle cx="0" cy="0" r="${radius * 0.2}" fill="${color}"/>
        </g>
        <g transform="translate(550,750) scale(-1,-1)">
          <circle cx="0" cy="0" r="${radius}" fill="none" stroke="${color}" stroke-width="${width}"/>
          ${mandala}
          <circle cx="0" cy="0" r="${radius * 0.2}" fill="${color}"/>
        </g>
      </svg>`;
    }
  },
  {
    name: 'Paisley Border',
    generator: (color, width, offset, idx) => {
      const size = 15 + (idx % 10);
      const spacing = 50 + (idx % 20);
      let paisleys = '';
      for (let x = 60; x < 540; x += spacing) {
        paisleys += `<path d="M${x},30 Q${x + size},${30 - size} ${x + size * 1.5},30 Q${x + size},${30 + size * 0.5} ${x},30" fill="none" stroke="${color}" stroke-width="${width}"/>`;
        paisleys += `<path d="M${x},770 Q${x + size},${770 + size} ${x + size * 1.5},770 Q${x + size},${770 - size * 0.5} ${x},770" fill="none" stroke="${color}" stroke-width="${width}"/>`;
      }
      return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="560" height="760" fill="none" stroke="${color}" stroke-width="${width}"/>
        ${paisleys}
      </svg>`;
    }
  }
];

// Lace Patterns
const laceGenerators = [
  {
    name: 'Lace Doily',
    generator: (color, width, offset, idx) => {
      const radius = 18 + (idx % 12);
      const spokes = 12 + (idx % 6);
      let lace = '';
      for (let i = 0; i < spokes; i++) {
        const angle = (i * 360) / spokes;
        const x = radius * Math.cos((angle * Math.PI) / 180);
        const y = radius * Math.sin((angle * Math.PI) / 180);
        lace += `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="${color}" stroke-width="${width * 0.5}"/>`;
      }
      return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="25" width="550" height="750" fill="none" stroke="${color}" stroke-width="${width}" stroke-dasharray="5,3"/>
        <g transform="translate(50,50)">
          <circle cx="0" cy="0" r="${radius}" fill="none" stroke="${color}" stroke-width="${width}"/>
          <circle cx="0" cy="0" r="${radius * 0.6}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          ${lace}
        </g>
        <g transform="translate(550,50)">
          <circle cx="0" cy="0" r="${radius}" fill="none" stroke="${color}" stroke-width="${width}"/>
          <circle cx="0" cy="0" r="${radius * 0.6}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          ${lace}
        </g>
        <g transform="translate(50,750)">
          <circle cx="0" cy="0" r="${radius}" fill="none" stroke="${color}" stroke-width="${width}"/>
          <circle cx="0" cy="0" r="${radius * 0.6}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          ${lace}
        </g>
        <g transform="translate(550,750)">
          <circle cx="0" cy="0" r="${radius}" fill="none" stroke="${color}" stroke-width="${width}"/>
          <circle cx="0" cy="0" r="${radius * 0.6}" fill="none" stroke="${color}" stroke-width="${width * 0.7}"/>
          ${lace}
        </g>
      </svg>`;
    }
  }
];

// Celtic Knots
const celticGenerators = [
  {
    name: 'Celtic Knot',
    generator: (color, width, offset, idx) => {
      const size = 25 + (idx % 15);
      return `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="25" width="550" height="750" fill="none" stroke="${color}" stroke-width="${width}"/>
        <path d="M${40},${40} Q${40 + size},${40 - size / 2} ${40 + size * 2},${40} Q${40 + size},${40 + size / 2} ${40},${40}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>
        <path d="M${560},${40} Q${560 - size},${40 - size / 2} ${560 - size * 2},${40} Q${560 - size},${40 + size / 2} ${560},${40}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>
        <path d="M${40},${760} Q${40 + size},${760 + size / 2} ${40 + size * 2},${760} Q${40 + size},${760 - size / 2} ${40},${760}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>
        <path d="M${560},${760} Q${560 - size},${760 + size / 2} ${560 - size * 2},${760} Q${560 - size},${760 - size / 2} ${560},${760}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>
      </svg>`;
    }
  }
];

// Generate all borders
export const BORDER_PATTERNS = {
  geometric: [
    ...generateBorderVariations(geometricGenerators[0], 100, 'geo'),
    ...generateBorderVariations(geometricGenerators[1], 50, 'geo-double'),
    ...generateBorderVariations(geometricGenerators[2], 50, 'geo-corner'),
    ...generateBorderVariations(geometricGenerators[3], 50, 'geo-diamond'),
    ...generateBorderVariations(geometricGenerators[4], 50, 'geo-zigzag')
  ],
  floral: [
    ...generateBorderVariations(floralGenerators[0], 60, 'floral-rose'),
    ...generateBorderVariations(floralGenerators[1], 60, 'floral-vine'),
    ...generateBorderVariations(floralGenerators[2], 40, 'floral-lotus'),
    ...generateBorderVariations(floralGenerators[3], 40, 'floral-cherry'),
    ...generateBorderVariations(floralGenerators[4], 50, 'floral-leaf')
  ],
  roses: [
    ...generateBorderVariations(flowerGenerators.roses[0], 20, 'rose-corner'),
    ...generateBorderVariations(flowerGenerators.roses[1], 20, 'rose-swag'),
    ...generateBorderVariations(flowerGenerators.roses[2], 15, 'rose-crimson'),
    ...generateBorderVariations(flowerGenerators.roses[3], 15, 'rose-blush'),
    ...generateBorderVariations(flowerGenerators.roses[4], 15, 'rose-ivory'),
    ...generateBorderVariations(flowerGenerators.roses[5], 15, 'rose-burgundy'),
    ...generateBorderVariations(flowerGenerators.roses[6], 20, 'rose-mixed'),
  ],
  lilies: [
    ...generateBorderVariations(flowerGenerators.lilies[0], 25, 'lily-corner'),
    ...generateBorderVariations(flowerGenerators.lilies[1], 25, 'lily-cascade'),
    ...generateBorderVariations(flowerGenerators.lilies[2], 25, 'lily-oriental'),
    ...generateBorderVariations(flowerGenerators.lilies[3], 25, 'lily-white'),
  ],
  orchids: generateBorderVariations(flowerGenerators.orchids[0], 80, 'orchid'),
  peonies: generateBorderVariations(flowerGenerators.peonies[0], 80, 'peony'),
  tulips: generateBorderVariations(flowerGenerators.tulips[0], 90, 'tulip'),
  sunflowers: generateBorderVariations(flowerGenerators.sunflowers[0], 70, 'sunflower'),
  daisies: generateBorderVariations(flowerGenerators.daisies[0], 80, 'daisy'),
  carnations: generateBorderVariations(flowerGenerators.carnations[0], 70, 'carnation'),
  hydrangeas: generateBorderVariations(flowerGenerators.hydrangeas[0], 70, 'hydrangea'),
  mandala: [
    ...generateBorderVariations(mandalaGenerators[0], 80, 'mandala'),
    ...generateBorderVariations(mandalaGenerators[1], 70, 'paisley')
  ],
  lace: generateBorderVariations(laceGenerators[0], 50, 'lace'),
  celtic: generateBorderVariations(celticGenerators[0], 50, 'celtic')
};

// Total: 300 geometric + 250 floral + 150 roses + 100 lilies + 80 orchids + 80 peonies + 90 tulips + 70 sunflowers + 80 daisies + 70 carnations + 70 hydrangeas + 150 mandala + 50 lace + 50 celtic = 1540+ borders!
