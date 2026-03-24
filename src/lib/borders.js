// Wedding Pattern Borders - Geometric & Floral SVG Patterns

export const BORDER_PATTERNS = {
  geometric: [
    {
      id: 'geo-1',
      name: 'Classic Frame',
      svg: `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="560" height="760" fill="none" stroke="#C9A84C" stroke-width="3"/>
        <rect x="30" y="30" width="540" height="740" fill="none" stroke="#C9A84C" stroke-width="1"/>
        <circle cx="50" cy="50" r="8" fill="#C9A84C"/>
        <circle cx="550" cy="50" r="8" fill="#C9A84C"/>
        <circle cx="50" cy="750" r="8" fill="#C9A84C"/>
        <circle cx="550" cy="750" r="8" fill="#C9A84C"/>
      </svg>`
    },
    {
      id: 'geo-2',
      name: 'Art Deco',
      svg: `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="deco" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20,0 L40,20 L20,40 L0,20 Z" fill="none" stroke="#C9A84C" stroke-width="1"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="600" height="40" fill="url(#deco)"/>
        <rect x="0" y="760" width="600" height="40" fill="url(#deco)"/>
        <rect x="0" y="0" width="40" height="800" fill="url(#deco)"/>
        <rect x="560" y="0" width="40" height="800" fill="url(#deco)"/>
        <rect x="15" y="15" width="570" height="770" fill="none" stroke="#C9A84C" stroke-width="2"/>
      </svg>`
    },
    {
      id: 'geo-3',
      name: 'Moroccan',
      svg: `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <path d="M30,30 Q50,10 70,30 T110,30" fill="none" stroke="#C9A84C" stroke-width="2"/>
        <path d="M530,30 Q550,10 570,30" fill="none" stroke="#C9A84C" stroke-width="2"/>
        <path d="M30,770 Q50,790 70,770 T110,770" fill="none" stroke="#C9A84C" stroke-width="2"/>
        <path d="M530,770 Q550,790 570,770" fill="none" stroke="#C9A84C" stroke-width="2"/>
        <rect x="25" y="25" width="550" height="750" fill="none" stroke="#C9A84C" stroke-width="2" stroke-dasharray="10,5"/>
        <path d="M300,20 L310,30 L300,40 L290,30 Z" fill="#C9A84C"/>
        <path d="M300,760 L310,770 L300,780 L290,770 Z" fill="#C9A84C"/>
      </svg>`
    },
    {
      id: 'geo-4',
      name: 'Hexagon Border',
      svg: `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <polygon id="hex" points="15,0 30,8.66 30,25.98 15,34.64 0,25.98 0,8.66" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
        </defs>
        <use href="#hex" x="20" y="20"/>
        <use href="#hex" x="50" y="20"/>
        <use href="#hex" x="80" y="20"/>
        <use href="#hex" x="540" y="20"/>
        <use href="#hex" x="20" y="745"/>
        <use href="#hex" x="50" y="745"/>
        <use href="#hex" x="540" y="745"/>
        <rect x="20" y="60" width="560" height="680" fill="none" stroke="#C9A84C" stroke-width="2"/>
      </svg>`
    },
    {
      id: 'geo-5',
      name: 'Corner Ornaments',
      svg: `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="540" height="740" fill="none" stroke="#C9A84C" stroke-width="2"/>
        <path d="M30,30 L80,30 L80,35 L35,35 L35,80 L30,80 Z" fill="#C9A84C"/>
        <path d="M570,30 L520,30 L520,35 L565,35 L565,80 L570,80 Z" fill="#C9A84C"/>
        <path d="M30,770 L80,770 L80,765 L35,765 L35,720 L30,720 Z" fill="#C9A84C"/>
        <path d="M570,770 L520,770 L520,765 L565,765 L565,720 L570,720 Z" fill="#C9A84C"/>
        <circle cx="300" cy="30" r="5" fill="#C9A84C"/>
        <circle cx="300" cy="770" r="5" fill="#C9A84C"/>
      </svg>`
    }
  ],
  floral: [
    {
      id: 'floral-1',
      name: 'Rose Corners',
      svg: `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="25" width="550" height="750" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
        <g transform="translate(40,40)">
          <circle cx="0" cy="0" r="15" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
          <circle cx="-8" cy="-8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="8" cy="-8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="-8" cy="8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="8" cy="8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <path d="M0,-5 Q2,-3 0,0 Q-2,-3 0,-5" fill="#C9A84C"/>
        </g>
        <g transform="translate(560,40) scale(-1,1)">
          <circle cx="0" cy="0" r="15" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
          <circle cx="-8" cy="-8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="8" cy="-8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="-8" cy="8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="8" cy="8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <path d="M0,-5 Q2,-3 0,0 Q-2,-3 0,-5" fill="#C9A84C"/>
        </g>
        <g transform="translate(40,760) scale(1,-1)">
          <circle cx="0" cy="0" r="15" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
          <circle cx="-8" cy="-8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="8" cy="-8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="-8" cy="8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="8" cy="8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <path d="M0,-5 Q2,-3 0,0 Q-2,-3 0,-5" fill="#C9A84C"/>
        </g>
        <g transform="translate(560,760) scale(-1,-1)">
          <circle cx="0" cy="0" r="15" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
          <circle cx="-8" cy="-8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="8" cy="-8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="-8" cy="8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="8" cy="8" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <path d="M0,-5 Q2,-3 0,0 Q-2,-3 0,-5" fill="#C9A84C"/>
        </g>
      </svg>`
    },
    {
      id: 'floral-2',
      name: 'Vine Border',
      svg: `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <path d="M30,30 Q50,50 70,30 T110,30 T150,30 T190,30 T230,30 T270,30 T310,30 T350,30 T390,30 T430,30 T470,30 T510,30 T550,30 T570,30" 
          fill="none" stroke="#C9A84C" stroke-width="2"/>
        <path d="M30,770 Q50,750 70,770 T110,770 T150,770 T190,770 T230,770 T270,770 T310,770 T350,770 T390,770 T430,770 T470,770 T510,770 T550,770 T570,770" 
          fill="none" stroke="#C9A84C" stroke-width="2"/>
        <circle cx="70" cy="30" r="4" fill="#C9A84C"/>
        <circle cx="150" cy="30" r="4" fill="#C9A84C"/>
        <circle cx="230" cy="30" r="4" fill="#C9A84C"/>
        <circle cx="310" cy="30" r="4" fill="#C9A84C"/>
        <circle cx="390" cy="30" r="4" fill="#C9A84C"/>
        <circle cx="470" cy="30" r="4" fill="#C9A84C"/>
        <circle cx="550" cy="30" r="4" fill="#C9A84C"/>
        <circle cx="70" cy="770" r="4" fill="#C9A84C"/>
        <circle cx="150" cy="770" r="4" fill="#C9A84C"/>
        <circle cx="230" cy="770" r="4" fill="#C9A84C"/>
        <circle cx="310" cy="770" r="4" fill="#C9A84C"/>
        <circle cx="390" cy="770" r="4" fill="#C9A84C"/>
        <circle cx="470" cy="770" r="4" fill="#C9A84C"/>
        <circle cx="550" cy="770" r="4" fill="#C9A84C"/>
        <path d="M30,50 L30,750" stroke="#C9A84C" stroke-width="1.5"/>
        <path d="M570,50 L570,750" stroke="#C9A84C" stroke-width="1.5"/>
      </svg>`
    },
    {
      id: 'floral-3',
      name: 'Lotus Frame',
      svg: `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="540" height="740" fill="none" stroke="#C9A84C" stroke-width="2"/>
        <g transform="translate(300,40)">
          <ellipse cx="0" cy="0" rx="20" ry="12" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
          <ellipse cx="-15" cy="0" rx="12" ry="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <ellipse cx="15" cy="0" rx="12" ry="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <ellipse cx="0" cy="-8" rx="10" ry="6" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="0" cy="0" r="3" fill="#C9A84C"/>
        </g>
        <g transform="translate(300,760) scale(1,-1)">
          <ellipse cx="0" cy="0" rx="20" ry="12" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
          <ellipse cx="-15" cy="0" rx="12" ry="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <ellipse cx="15" cy="0" rx="12" ry="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <ellipse cx="0" cy="-8" rx="10" ry="6" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="0" cy="0" r="3" fill="#C9A84C"/>
        </g>
      </svg>`
    },
    {
      id: 'floral-4',
      name: 'Peacock Feather',
      svg: `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="25" width="550" height="750" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
        <g transform="translate(50,50)">
          <ellipse cx="0" cy="0" rx="18" ry="25" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
          <ellipse cx="0" cy="0" rx="12" ry="18" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <ellipse cx="0" cy="0" rx="6" ry="10" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="0" cy="0" r="3" fill="#C9A84C"/>
          <path d="M0,25 Q-5,35 -8,45" stroke="#C9A84C" stroke-width="1.5" fill="none"/>
          <path d="M0,25 Q5,35 8,45" stroke="#C9A84C" stroke-width="1.5" fill="none"/>
        </g>
        <g transform="translate(550,50) scale(-1,1)">
          <ellipse cx="0" cy="0" rx="18" ry="25" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
          <ellipse cx="0" cy="0" rx="12" ry="18" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <ellipse cx="0" cy="0" rx="6" ry="10" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="0" cy="0" r="3" fill="#C9A84C"/>
          <path d="M0,25 Q-5,35 -8,45" stroke="#C9A84C" stroke-width="1.5" fill="none"/>
          <path d="M0,25 Q5,35 8,45" stroke="#C9A84C" stroke-width="1.5" fill="none"/>
        </g>
        <g transform="translate(50,750) scale(1,-1)">
          <ellipse cx="0" cy="0" rx="18" ry="25" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
          <ellipse cx="0" cy="0" rx="12" ry="18" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <ellipse cx="0" cy="0" rx="6" ry="10" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="0" cy="0" r="3" fill="#C9A84C"/>
          <path d="M0,25 Q-5,35 -8,45" stroke="#C9A84C" stroke-width="1.5" fill="none"/>
          <path d="M0,25 Q5,35 8,45" stroke="#C9A84C" stroke-width="1.5" fill="none"/>
        </g>
        <g transform="translate(550,750) scale(-1,-1)">
          <ellipse cx="0" cy="0" rx="18" ry="25" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
          <ellipse cx="0" cy="0" rx="12" ry="18" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <ellipse cx="0" cy="0" rx="6" ry="10" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="0" cy="0" r="3" fill="#C9A84C"/>
          <path d="M0,25 Q-5,35 -8,45" stroke="#C9A84C" stroke-width="1.5" fill="none"/>
          <path d="M0,25 Q5,35 8,45" stroke="#C9A84C" stroke-width="1.5" fill="none"/>
        </g>
      </svg>`
    },
    {
      id: 'floral-5',
      name: 'Cherry Blossom',
      svg: `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="540" height="740" fill="none" stroke="#C9A84C" stroke-width="1.5"/>
        <g id="blossom">
          <circle cx="0" cy="0" r="8" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="0" cy="-10" r="5" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="8" cy="-5" r="5" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="8" cy="5" r="5" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="0" cy="10" r="5" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="-8" cy="5" r="5" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="-8" cy="-5" r="5" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="0" cy="0" r="2" fill="#C9A84C"/>
        </g>
        <use href="#blossom" x="60" y="50"/>
        <use href="#blossom" x="540" y="50"/>
        <use href="#blossom" x="60" y="750"/>
        <use href="#blossom" x="540" y="750"/>
        <use href="#blossom" x="300" y="40"/>
        <use href="#blossom" x="300" y="760"/>
      </svg>`
    },
    {
      id: 'floral-6',
      name: 'Jasmine Garland',
      svg: `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <path d="M30,400 Q100,350 170,400 T310,400 T450,400 T570,400" fill="none" stroke="#C9A84C" stroke-width="2"/>
        <g id="jasmine">
          <circle cx="0" cy="0" r="6" fill="none" stroke="#C9A84C" stroke-width="1"/>
          <circle cx="0" cy="-8" r="4" fill="none" stroke="#C9A84C" stroke-width="0.8"/>
          <circle cx="6" cy="-4" r="4" fill="none" stroke="#C9A84C" stroke-width="0.8"/>
          <circle cx="6" cy="4" r="4" fill="none" stroke="#C9A84C" stroke-width="0.8"/>
          <circle cx="0" cy="8" r="4" fill="none" stroke="#C9A84C" stroke-width="0.8"/>
          <circle cx="-6" cy="4" r="4" fill="none" stroke="#C9A84C" stroke-width="0.8"/>
          <circle cx="-6" cy="-4" r="4" fill="none" stroke="#C9A84C" stroke-width="0.8"/>
        </g>
        <use href="#jasmine" x="100" y="350"/>
        <use href="#jasmine" x="170" y="400"/>
        <use href="#jasmine" x="240" y="350"/>
        <use href="#jasmine" x="310" y="400"/>
        <use href="#jasmine" x="380" y="350"/>
        <use href="#jasmine" x="450" y="400"/>
        <rect x="25" y="25" width="550" height="750" fill="none" stroke="#C9A84C" stroke-width="1.5" stroke-dasharray="5,5"/>
      </svg>`
    }
  ]
}
