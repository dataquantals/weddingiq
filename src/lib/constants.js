export const SUPA_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const DS_KEY   = import.meta.env.VITE_DEEPSEEK_API_KEY

export const THEMES = [
  { id:'mughal',  name:'Mughal Gold',   bg:'linear-gradient(160deg,#F0D8E5,#E0C8DC,#C8B4D8)', acc:'#C9A84C', txt:'#5C2D6E', sub:'#8B5AB8', orn:'❋' },
  { id:'noir',    name:'Midnight Noir', bg:'linear-gradient(160deg,#0D0A14,#1A0E28,#0D0814)', acc:'#C9A84C', txt:'#F0E6D3', sub:'#A08060', orn:'◆' },
  { id:'sage',    name:'Sage Garden',   bg:'linear-gradient(160deg,#F0F4EC,#E4ECD8,#D4E0C4)', acc:'#7A9E5C', txt:'#2D4A1E', sub:'#5A7840', orn:'✿' },
  { id:'blush',   name:'Blush Minimal', bg:'linear-gradient(160deg,#FFF5F7,#FFE8EE,#FFDDE6)', acc:'#D4607A', txt:'#4A1828', sub:'#8B3450', orn:'❀' },
  { id:'azure',   name:'Azure Coast',   bg:'linear-gradient(160deg,#EEF4FF,#D8E8FF,#C4D8F8)', acc:'#2A5FC8', txt:'#0A2060', sub:'#3A60A8', orn:'✦' },
  { id:'terra',   name:'Terracotta',    bg:'linear-gradient(160deg,#FDF0E8,#F8E0CC,#F0CCAA)', acc:'#C8541C', txt:'#4A1808', sub:'#8B3C18', orn:'༄' },
]

export const BUILTIN_TEMPLATES = [
  {
    id:'boho_terracotta', name:'Boho Terracotta', style:'Warm · Earthy · Tropical', badge:'hot',
    desc:'Brown vertical stripe, gold foliage, warm cream background. Perfect for garden and outdoor weddings.',
    bg:'linear-gradient(135deg,#F5EBD8,#EDD5B3,#F0E4CC)', accent:'#8B5E3C', txt:'#3D1F0A', sub:'#6B3D20', orn:'✿', themeId:'terra',
  },
  {
    id:'mughal_gold', name:'Mughal Gold', style:'Regal · Ornate · Celebratory', badge:'',
    desc:'Violet gradients with gold accents. A timeless classic for formal celebrations.',
    bg:'linear-gradient(160deg,#F0D8E5,#E0C8DC,#C8B4D8)', accent:'#C9A84C', txt:'#5C2D6E', sub:'#8B5AB8', orn:'❋', themeId:'mughal',
  },
  {
    id:'midnight_noir', name:'Midnight Noir', style:'Bold · Dramatic · Luxe', badge:'',
    desc:'Deep midnight with gold typography. Sophisticated and striking for evening receptions.',
    bg:'linear-gradient(160deg,#0D0A14,#1A0E28,#0D0814)', accent:'#C9A84C', txt:'#F0E6D3', sub:'#A08060', orn:'◆', themeId:'noir',
  },
  {
    id:'sage_garden', name:'Sage Garden', style:'Botanical · Serene · Natural', badge:'new',
    desc:'Soft sage greens with botanical details. Fresh and calming for garden ceremonies.',
    bg:'linear-gradient(160deg,#F0F4EC,#E4ECD8,#D4E0C4)', accent:'#7A9E5C', txt:'#2D4A1E', sub:'#5A7840', orn:'✿', themeId:'sage',
  },
  {
    id:'blush_minimal', name:'Blush Minimal', style:'Soft · Romantic · Clean', badge:'',
    desc:'Delicate blush tones with a clean layout. Effortlessly romantic for intimate weddings.',
    bg:'linear-gradient(160deg,#FFF5F7,#FFE8EE,#FFDDE6)', accent:'#D4607A', txt:'#4A1828', sub:'#8B3450', orn:'❀', themeId:'blush',
  },
  {
    id:'azure_coast', name:'Azure Coast', style:'Fresh · Coastal · Elegant', badge:'',
    desc:'Ocean blues and white — perfect for beach or lakeside ceremonies.',
    bg:'linear-gradient(160deg,#EEF4FF,#D8E8FF,#C4D8F8)', accent:'#2A5FC8', txt:'#0A2060', sub:'#3A60A8', orn:'✦', themeId:'azure',
  },
  {
    id:'african_chitenge', name:'African Chitenge', style:'Vibrant · Cultural · Joyful', badge:'new',
    desc:'Rich amber and earth tones inspired by African textiles. Bold, proud and celebratory.',
    bg:'linear-gradient(135deg,#8B2500,#C84B00,#E87020)', accent:'#FFD700', txt:'#FFF8E7', sub:'rgba(255,248,231,.7)', orn:'༄', themeId:'terra',
  },
  {
    id:'kingdom_hall', name:'Kingdom Hall White', style:'Pure · Reverent · Traditional', badge:'',
    desc:'Clean white with gold detailing. Respectful and timeless for Kingdom Hall celebrations.',
    bg:'linear-gradient(160deg,#FDFCF8,#F8F5EC,#F2EDD8)', accent:'#B8960C', txt:'#1A1408', sub:'#5C4A10', orn:'❋', themeId:'mughal',
  },
]

export const IMG_PACKS = {
  floral: [
    { url:'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=400&q=80', lbl:'White roses' },
    { url:'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=80', lbl:'Pink peonies' },
    { url:'https://images.unsplash.com/photo-1490750967868-88df5691cc8d?w=400&q=80', lbl:'Lavender' },
    { url:'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&q=80', lbl:'Orchids' },
    { url:'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&q=80', lbl:'Wildflowers' },
    { url:'https://images.unsplash.com/photo-1548094891-c4ba474efd16?w=400&q=80', lbl:'Bouquet' },
  ],
  venue: [
    { url:'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80', lbl:'Grand hall' },
    { url:'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=80', lbl:'Garden' },
    { url:'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80', lbl:'Beachside' },
    { url:'https://images.unsplash.com/photo-1561131668-f63504fc549d?w=400&q=80', lbl:'Fairy lights' },
    { url:'https://images.unsplash.com/photo-1486017945781-6eefc2e7d99c?w=400&q=80', lbl:'Candlelit' },
    { url:'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&q=80', lbl:'Outdoor arch' },
  ],
  texture: [
    { url:'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=80', lbl:'Gold foil' },
    { url:'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=400&q=80', lbl:'Silk' },
    { url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', lbl:'Marble' },
    { url:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80', lbl:'Lace' },
    { url:'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400&q=80', lbl:'Floral paper' },
    { url:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', lbl:'Watercolour' },
  ],
}

export const DEFAULT_DESIGN = {
  headline:      'Two hearts, one beautiful journey',
  hosts_line:    '',
  ceremony_line: 'to the wedding of their daughter',
  couple_intro:  'A love story written in the stars, celebrated with those they hold dearest.',
  personal_note: 'We are overjoyed to share this milestone with you and look forward to celebrating surrounded by the warmth of your presence.',
  footer_verse:  'Together is the most beautiful place to be',
  // Background color for the QR + Venue Directions strip shown below the invite preview.
  // Stored as a solid hex color so it can be edited with <input type="color" />.
  bottom_bar_bg: '#0D0A14',
}
