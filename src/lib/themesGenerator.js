// themesGenerator.js
// Programmatically generate 500+ Luxury Wedding Themes

const Hues = {
  royal: { h: [20, 50], s: [40, 70], l: [20, 40] }, // Deep reds, golds
  vintage: { h: [30, 40], s: [20, 40], l: [80, 95] }, // Creamy, sepia
  modern: { h: [200, 240], s: [10, 30], l: [10, 25] }, // Dark blues, greys
  pastel: { h: [0, 360], s: [30, 60], l: [90, 98] }, // Soft colors
  vibrant: { h: [0, 360], s: [60, 90], l: [30, 60] }, // Bold colors
  nature: { h: [80, 160], s: [20, 50], l: [40, 70] }, // Greens, earth tones
};

const Ornaments = ['❋', '◆', '✿', '❀', '✦', '༄', '❧', '✾', '❁', '❂', '❃', '❈', '❦', '♚', '♛'];

const generateThemeVariations = (category, count) => {
  const variations = [];
  const hueRange = Hues[category];
  
  for (let i = 0; i < count; i++) {
    const h = hueRange.h[0] + (Math.random() * (hueRange.h[1] - hueRange.h[0]));
    const s = hueRange.s[0] + (Math.random() * (hueRange.s[1] - hueRange.s[0]));
    const l = hueRange.l[0] + (Math.random() * (hueRange.l[1] - hueRange.l[0]));
    
    const baseColor = `hsl(${h.toFixed(0)}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;
    const accH = (h + 30) % 360;
    const acc = `hsl(${accH.toFixed(0)}, 70%, 65%)`; // Accent
    
    // Background can be solid, gradient, or pattern
    let bg = '';
    const bgType = i % 4;
    if (bgType === 0) {
      // Linear gradient
      bg = `linear-gradient(160deg, hsl(${h}, ${s}%, ${l + 10}%), hsl(${h}, ${s}%, ${l}%), hsl(${h}, ${s}%, ${l - 10}%))`;
    } else if (bgType === 1) {
      // Radial gradient
      bg = `radial-gradient(circle at center, hsl(${h}, ${s}%, ${l + 5}%), hsl(${h}, ${s}%, ${l - 5}%))`;
    } else if (bgType === 2) {
      // Polka dots
      bg = `radial-gradient(hsla(${h}, ${s}%, ${l + 20}%, 0.1) 2px, transparent 2px), hsl(${h}, ${s}%, ${l}%)`;
    } else {
      // Stripes
      bg = `repeating-linear-gradient(45deg, hsl(${h}, ${s}%, ${l}%), hsl(${h}, ${s}%, ${l}%) 10px, hsl(${h}, ${s}%, ${l + 3}%) 10px, hsl(${h}, ${s}%, ${l + 3}%) 20px)`;
    }

    // Text colors
    const txt = l > 60 ? '#2D1540' : '#F0E6D3';
    const sub = l > 60 ? 'rgba(45, 21, 64, 0.7)' : 'rgba(240, 230, 211, 0.7)';
    
    variations.push({
      id: `${category}-${i}`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} ${i + 1}`,
      bg: bg,
      acc: acc,
      txt: txt,
      sub: sub,
      orn: Ornaments[Math.floor(Math.random() * Ornaments.length)],
      backgroundSize: bgType === 2 ? '20px 20px' : 'auto' // Important for patterns
    });
  }
  return variations;
};

export const GENERATED_THEMES = {
  royal: generateThemeVariations('royal', 100),
  vintage: generateThemeVariations('vintage', 100),
  modern: generateThemeVariations('modern', 100),
  pastel: generateThemeVariations('pastel', 100),
  nature: generateThemeVariations('nature', 100),
};

// Total: 500 themes

// Helper to find a theme from any category or standard list
export function findAnyTheme(id, standardThemes = []) {
  if (!id) return null
  if (typeof id !== 'string') return id
  
  // 1. Check standard
  const std = (standardThemes || []).find(t => t.id === id)
  if (std) return std

  // 2. Check generated
  const allGen = Object.values(GENERATED_THEMES).flat()
  return allGen.find(t => t.id === id) || null
}
