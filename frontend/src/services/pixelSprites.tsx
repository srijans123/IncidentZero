import React from 'react';

// Expanded Architectural Pixel Palette (Modeled on BPHC campus photos)
export const P: Record<string, string> = {
  k: '#1B1530', // Deep ink outline
  w: '#FFFFFF', // Pure white
  r: '#FF4D3D', // Bright P1 red
  y: '#FFD84D', // Warm golden light / sun
  b: '#59C9F5', // Sky blue
  g: '#43D17A', // Grass / cypress green
  o: '#FF9F43', // Amber / warm window glow
  s: '#F2B38C', // Skin tone
  l: '#FF8AD0', // Pink
  p: '#7C5CFF', // Grape purple
  a: '#9690B0', // Granite boulder grey
  d: '#6E668A', // Dark granite shadow
  m: '#B84A32', // BPHC Terracotta / Red sandstone (Auditorium, Library pillars, F-Block base)
  n: '#8F331E', // Deep red sandstone shadow
  t: '#E6CFA8', // BPHC Warm beige sandstone (Library, F-Block, Valmiki facade)
  u: '#C9AD82', // Sandstone shadow
  c: '#FFF8DC', // Cream portal / Valmiki wall
  e: '#1D4E5F', // Deep teal reflective glass
  f: '#2D8A4E', // Deep foliage green
  h: '#3B6EE8', // Royal blue signage
};

// Integer-Scaled Pixel Art SVG String Renderer
export function sprSvgString(rows: string[], sc: number = 3): string {
  const w = rows[0].length;
  const h = rows.length;
  let r = '';
  rows.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      const ch = row[x];
      if (ch === '.') {
        x++;
        continue;
      }
      let e = x;
      while (e < w && row[e] === ch) e++;
      r += `<rect x="${x}" y="${y}" width="${e - x}" height="1.04" fill="${P[ch] || '#1B1530'}"/>`;
      x = e;
    }
  });
  return `<svg viewBox="0 0 ${w} ${h}" width="${w * sc}" height="${h * sc}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}

// React Component to render pixel matrix
export const PixelSprite: React.FC<{
  matrix: string[];
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ matrix, scale = 3, className = '', style = {} }) => {
  const w = matrix[0].length;
  const h = matrix.length;
  const rects: React.ReactNode[] = [];

  matrix.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      const ch = row[x];
      if (ch === '.') {
        x++;
        continue;
      }
      let e = x;
      while (e < w && row[e] === ch) e++;
      rects.push(
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={e - x}
          height={1.04}
          fill={P[ch] || '#1B1530'}
        />
      );
      x = e;
    }
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      className={`inline-block flex-shrink-0 align-middle ${className}`}
      style={style}
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
};

// 10x10 Pixel Icons
export const ICONS: Record<string, string[]> = {
  bug: ['..k....k..', '...k..k...', '..kkkkkk..', '.krrrrrrk.', 'krwkrwkrk.', 'krrrrrrrrk', '.kr.rr.rk.', 'k..k..k..k'],
  coin: ['..kkkkkk..', '.kyyyyyyk.', 'kyywwyyyyk', 'kyywkyyyyk', 'kyywkyyyyk', 'kyyyyyyyyk', '.kyyyyyyk.', '..kkkkkk..'],
  bolt: ['....kkkk..', '...kyyyk..', '..kyyyk...', '.kyyyyykk.', 'kkkkkyyyk.', '...kyyyk..', '..kyyk....', '.kkk......'],
  trophy: ['kkkkkkkkkk', 'kyyyyyyyyk', 'kyywwwwyyk', '.kyyyyyyk.', '..kkkkkk..', '...kyyk...', '..kkkkkk..', '.kkkkkkkk.'],
  sun: ['....kk....', '.k.kyyk.k.', '..kyyyyyk.', 'kkyyyyyyyk', '..kyyyyyk.', '.k.kyyk.k.', '....kk....'],
  bell: ['....kk....', '..kkkkkk..', '.kyyyyyyk.', '.kyyyyyyk.', 'kyyyyyyyyk', 'kkkkkkkkkk', '...kkkk...'],
  gamepad: ['.kkkkkkkk.', 'kddddddddk', 'kdwkddyrdk', 'kwwwddbrdk', 'kdwkdddddk', 'kkkkkkkkkk'],
  building: ['..kkkkkk..', '.kttttttk.', 'ktwktwktk.', 'ktwktwktk.', 'kttttttttk', 'kkkkmmkkkk'],
  shield: ['.kkkkkkkk.', 'kggggggggk', 'kgwwwwwwgk', 'kgwggggwgk', '.kgwwwwgk.', '..kggggk..', '...kkkk...'],
  wrench: ['..kkk.....', '.kwwwk....', 'kwwkkk....', '.kkkkk....', '...kkkk...', '....kkkk..', '.....kkkk.', '......kk..'],
  chain: ['.kkkk.....', 'kwwwwk....', 'kwkkkkkk..', '.kkkwwwwk.', '...kkkkkk.'],
  clock: ['..kkkkkk..', '.kwwwwwwk.', 'kwwkwwwkwk', 'kwwkkkwwwk', 'kwwwwwwwwk', '.kwwwwwwk.', '..kkkkkk..'],
  wifi: ['..kkkkkk..', '.kbbbbbbk.', 'kbkkkkkkbk', '..kbbbbk..', '...kkkk...', '....kk....'],
  megaphone: ['.....kkkk.', '...kkyyyk.', '.kkyyyyyk.', 'krrrrrrrk.', '.kkyyyyyk.', '..kk.kkkk.'],
  book: ['.kkkkkkkk.', 'kbbbbbbbbk', 'kbwwwwwwbk', 'kbwkkkkwbk', 'kbwwwwwwbk', 'kkkkkkkkkk'],
};

export const PixelIcon: React.FC<{
  name: keyof typeof ICONS | string;
  scale?: number;
  className?: string;
}> = ({ name, scale = 2, className = '' }) => {
  const matrix = ICONS[name] || ICONS.bug;
  return <PixelSprite matrix={matrix} scale={scale} className={className} />;
};

// SLA Hearts
export const HEART = [
  '.kk.kk.',
  'krrkrrk',
  'krrrrrk',
  '.krrrk.',
  '..krk..',
  '...k...',
];
export const HE = HEART.map((r) => r.replace(/r/g, 'w'));

export const SlaHearts: React.FC<{
  hp: number;
  maxHp?: number;
  scale?: number;
  className?: string;
}> = ({ hp, maxHp = 3, scale = 2, className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {Array.from({ length: maxHp }).map((_, idx) => (
        <PixelSprite
          key={idx}
          matrix={idx < hp ? HEART : HE}
          scale={scale}
        />
      ))}
    </span>
  );
};

// Bug frames
export const BUG_F1 = [
  '..k.....k..',
  '...k...k...',
  '..kkkkkkk..',
  '.krrrrrrrk.',
  'krrwkrwkrrk',
  'krrrrrrrrrk',
  '.kr.rrr.rk.',
  '.k.krrrk.k.',
  'k...k.k...k',
];
export const BUG_F2 = [
  '.k.......k.',
  '..k.....k..',
  '..kkkkkkk..',
  '.krrrrrrrk.',
  'krrwkrwkrrk',
  'krrrrrrrrrk',
  '.kr.rrr.rk.',
  'k..krrrk..k',
  '..k..k..k..',
];
export const BUG_HIT = [
  '.k.......k.',
  '..kkkkkkk..',
  'kwwwwwwwwwk',
  'kwkwwwwkwkk',
  'kwwwwwwwwwk',
  '.kkkkkkkkk.',
];

// Technician Walk & Squash Frames
export const TECH_IDLE = [
  '..kkkkk..',
  '.kyyyyyk.',
  'kkkkkkkkk',
  '.ksksksk.',
  '.ksssssk.',
  '..kkkkk..',
  '.kbbbbbk.',
  'sbbbbbbbs',
  'sbbbbbbbs',
  '.kbbbbbk.',
  '.kbk.kbk.',
  '.kkk.kkk.',
];
export const TECH_W1 = [
  '..kkkkk..',
  '.kyyyyyk.',
  'kkkkkkkkk',
  '.ksksksk.',
  '.ksssssk.',
  '..kkkkk..',
  'skbbbbbk.',
  '.kbbbbbbk',
  '.kbbbbbk.',
  '.kbk..kbk',
  'kkk....kk',
  '.........',
];
export const TECH_W2 = [
  '..kkkkk..',
  '.kyyyyyk.',
  'kkkkkkkkk',
  '.ksksksk.',
  '.ksssssk.',
  '..kkkkk..',
  '.kbbbbbks',
  'kbbbbbbk.',
  '.kbbbbbk.',
  'kbk..kbk.',
  'kk....kkk',
  '.........',
];
export const TECH_SQUASH = [
  '.....kkk.',
  '..kkkkwk.',
  '.kyyyyyk.',
  'kkkkkkkkk',
  '.ksksksk.',
  '..kkkkk..',
  '.kbbbbbks',
  'sbbbbbbbs',
  '.kbbbbbk.',
  'kbk...kbk',
  'kkk...kkk',
  '.........',
];

// Campus Landmark Pixel Generators
export function bldAuditorium(night = false): string[] {
  const winL = night ? 'y' : 'o';
  const winR = night ? 'y' : 'b';
  return [
    '............kkkkkkkk............',
    '....kkkkkkkkttttttttkkkkkkkk....',
    '...kttttuwuwttttttttuwuwttttk...',
    '...kmmmmmmmmmmmmmmmmmmmmmmmmk...',
    '..kmmmmmmmmmmmmmmmmmmmmmmmmmmk..',
    '.kmmmmmmmmmmmmmmmmmmmmmmmmmmmmk.',
    'kmmmmmmkwkwkwkmmmmkwkwkwkmmmmmmk',
    'kmmmmmkwkwkwkwmmmmwkwkwkwkmmmmmk',
    'kmmmmknnnnnnnnmmmmnnnnnnnnkmmmmk',
    'kmmmkttmmmmmmmmmmmmmmmmmmttkmmmk',
    'kmmktttmmkeekmmmmmmeekmmmtttkmmk',
    'kmmktttmmkeekmmmmmmeekmmmtttkmmk',
    'kmmktttmmmmmmmmmmmmmmmmmmtttkmmk',
    'kmmktttmmk' + winL + winL + 'kmmmmmmk' + winR + winR + 'kmmtttkmmk',
    'kmmktttmmk' + winL + winL + 'kmmmmmmk' + winR + winR + 'kmmtttkmmk',
    'kmmktttmmmmmmmmmmmmmmmmmmtttkmmk',
    'kmmktttmmk' + winL + winL + 'kmmmmmmk' + winR + winR + 'kmmtttkmmk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  ];
}

export function bldFBlock(night = false): string[] {
  const w = night ? 'y' : 'e';
  return [
    '............kkkkkkkk............',
    '..........kkcccccccckk..........',
    '.........kcccccccccccck.........',
    '.......kkkkkkkkkkkkkkkkkk.......',
    '......kmmmmmmmmmmmmmmmmmmk......',
    'mmkkkkkcccccccccccccccccckkkkkmm',
    'ttttttcccccckkkkkkkkcccccccttttt',
    't' + w + 't' + w + 'ttcccccck' + w + 'k' + w + 'k' + w + 'kccccccctt' + w + 't' + w + 't',
    'ttttttcccccck' + w + 'k' + w + 'k' + w + 'kcccccccttttt',
    'mmmmmmcccccck' + w + 'k' + w + 'k' + w + 'kccccccmmmmmm',
    'm' + w + 'm' + w + 'mmcccccck' + w + 'k' + w + 'k' + w + 'kccccccmm' + w + 'm' + w + 'm',
    'mmmmmmcccccckkkkkkkkccccccmmmmmm',
    'mmmmmmccccccmmmmmmmmccccccmmmmmm',
    'fgfggfggggggmmmmmmmmggggggfggfgf',
    'rplgglggggggccccccccgggggglgglpr',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  ];
}

export function bldValmiki(night = false): string[] {
  const w = night ? 'y' : 'e';
  return [
    '..........kkkkkkkkkkkk..........',
    '.........kchhhhhhhhhhck.........',
    '.kkkkkkkkkcccccccccccckkkkkkkkk.',
    'kttttkttttkttttkttttkttttkttttk.',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kcccck' + w + 'kcck' + w + 'kcck' + w + 'kcck' + w + 'kcck' + w + 'kccck',
    'kcccckmkcckmkcckmkcckmkcckmkccck',
    'kffkck' + w + 'kcck' + w + 'kcck' + w + 'kcck' + w + 'kcck' + w + 'kffk',
    'kffffkmkcckmkcckmkcckmkcckmkfffk',
    'kffffkcccccccccccccccccccckffffk',
    'kdaaadkcckcwkcwkcwkcwkcckdaaadk.',
    'kdaaadkcckcwkcwkcwkcwkcckdaaadk.',
    'kgggggkcckkkkkkkkkkkkkcckgggggk.',
    'krrrrrkccccccccccccccccckrrrrrk.',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  ];
}

export function bldLibrary(night = false): string[] {
  const w = night ? 'y' : 'e';
  return [
    '..........kkkkkkkkkkkk..........',
    '........kkmmmmmmmmmmmmkk........',
    '......kkmmmmmmmmmmmmmmmmkk......',
    '.....kmmbbbbbbbbbbbbbbbbmmk.....',
    '....kkkkkkkkkkkkkkkkkkkkkkkk....',
    'kkkkkkkkttttttttttttttttkkkkkkkk',
    'kmtmtmtmttttchhhhhhcttttmtmtmtmk',
    'km' + w + 'm' + w + 'm' + w + 'mttttttttttttttttm' + w + 'm' + w + 'm' + w + 'mk',
    'kmtmtmtmttmkkkkkkkkkkmmtmtmtmtmk',
    'km' + w + 'm' + w + 'm' + w + 'mttmk' + w + 'k' + w + 'k' + w + 'k' + w + 'kmmtm' + w + 'm' + w + 'm' + w + 'mk',
    'kmtmtmtmttmttttttttttmmtmtmtmtmk',
    'km' + w + 'm' + w + 'm' + w + 'mttmtchhhhhhctmmtm' + w + 'm' + w + 'm' + w + 'mk',
    'kmtmtmtmttfgkkkkkkkkfgmtmtmtmtmk',
    'kmtmtmtmttfgk' + w + 'k' + w + 'k' + w + 'kfgmtmtmtmtmk',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
  ];
}

export const ROCKS = [
  '......kkkk..........',
  '....kkaaaakk..kkkk..',
  '..kkaaaaaaaakkaaaak.',
  '.kaaadwaaaaaaadwaaak',
  'kaaaaaaaaaaaaaaadwak',
  'krpyaaaaaaaaaaaarpok',
  '.kkkkkkkkkkkkkkkkkk.',
];

