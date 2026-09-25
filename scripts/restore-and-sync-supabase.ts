import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ColorThief = require('colorthief');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://cgonpvpjvdqeycdbdyrh.supabase.co/storage/v1/object/public/product-images/products/';

const COLOR_NAMES: { name: string; r: number; g: number; b: number }[] = [
  { name: 'Rani Magenta Pink', r: 203, g: 12, b: 83 },
  { name: 'Navy Blue', r: 5, g: 27, b: 90 },
  { name: 'Sky Blue', r: 135, g: 177, b: 205 },
  { name: 'Rust Peach', r: 231, g: 146, b: 112 },
  { name: 'Deep Maroon Wine', r: 82, g: 4, b: 15 },
  { name: 'Emerald Green', r: 10, g: 41, b: 26 },
  { name: 'Royal Purple', r: 98, g: 24, b: 94 },
  { name: 'Wine Plum', r: 92, g: 20, b: 50 },
  { name: 'Pearl Ivory White', r: 245, g: 242, b: 235 },
  { name: 'Classic Black', r: 25, g: 25, b: 28 },
  { name: 'Dusty Rose Pink', r: 212, g: 130, b: 147 },
  { name: 'Bottle Green', r: 18, g: 68, b: 45 },
  { name: 'Sage Mint Green', r: 142, g: 180, b: 154 },
  { name: 'Mustard Yellow', r: 224, g: 169, b: 38 },
  { name: 'Powder Blue', r: 176, g: 206, b: 224 },
  { name: 'Teal Peacock', r: 18, g: 104, b: 115 },
  { name: 'Coral Orange', r: 235, g: 94, b: 64 },
  { name: 'Charcoal Grey', r: 65, g: 68, b: 75 },
  { name: 'Beige Cream', r: 228, g: 213, b: 183 },
  { name: 'Lilac Lavender', r: 180, g: 152, b: 206 },
  { name: 'Ruby Crimson Red', r: 178, g: 24, b: 43 },
  { name: 'Olive Green', r: 95, g: 110, b: 50 },
  { name: 'Golden Ochre', r: 205, g: 145, b: 40 },
  { name: 'Terracotta Rust', r: 180, g: 75, b: 50 },
  { name: 'Aqua Cyan', r: 80, g: 185, b: 200 },
];

function getClosestColorName(r: number, g: number, b: number): string {
  let minD = Infinity;
  let best = 'Classic Shade';
  for (const c of COLOR_NAMES) {
    const d = Math.hypot(c.r - r, c.g - g, c.b - b);
    if (d < minD) {
      minD = d;
      best = c.name;
    }
  }
  return best;
}

async function extractColorFromUrl(imageUrl: string): Promise<{ hex: string; name: string }> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const tmpPath = path.join('/tmp', `sample_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.png`);
    fs.writeFileSync(tmpPath, buf);

    const col = await ColorThief.getColor(tmpPath);
    try { fs.unlinkSync(tmpPath); } catch {}

    const r = col._r;
    const g = col._g;
    const b = col._b;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
    const name = getClosestColorName(r, g, b);
    return { hex, name };
  } catch (err) {
    console.error('Error getting color for', imageUrl, err);
    return { hex: '#58152D', name: 'Royal Maroon' };
  }
}

// Product definitions for the 18 catalog items + new arrivals
interface ProductDef {
  id?: number;
  sku: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  fabric: string;
  fit: string;
  occasion: string;
  washCare: string;
  description: string;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isFestive: boolean;
  isFeatured: boolean;
  inStock: boolean;
  imageFilenames: string[];
}

const DEFINITIVE_PRODUCT_COLORS: Record<number, { name: string; hex: string }[]> = {
  20: [
    { name: 'Royal Purple', hex: '#301060' },
    { name: 'Deep Violet', hex: '#200040' }
  ],
  21: [
    { name: 'Midnight Navy Blue', hex: '#102030' },
    { name: 'Mustard Gold', hex: '#E0A010' },
    { name: 'Coffee Brown', hex: '#503020' },
    { name: 'Rani Pink', hex: '#A00050' },
    { name: 'Blush Peach', hex: '#F0B0A0' },
    { name: 'Classic Black', hex: '#101010' }
  ],
  22: [
    { name: 'Rani Magenta Pink', hex: '#CB0C53' },
    { name: 'Navy Blue', hex: '#051B5A' },
    { name: 'Sky Blue', hex: '#87B1CD' },
    { name: 'Rust Peach', hex: '#E79270' },
    { name: 'Deep Maroon Wine', hex: '#52040F' },
    { name: 'Deep Emerald Green', hex: '#0A291A' }
  ],
  23: [
    { name: 'Deep Wine Maroon', hex: '#501020' },
    { name: 'Pearl Ivory White', hex: '#F0E0D0' },
    { name: 'Midnight Navy Blue', hex: '#102030' },
    { name: 'Peach Coral', hex: '#F0B090' },
    { name: 'Classic Black', hex: '#101010' },
    { name: 'Crimson Ruby Red', hex: '#A02020' },
    { name: 'Rani Magenta Pink', hex: '#B02050' },
    { name: 'Mustard Gold', hex: '#D09010' },
    { name: 'Dark Plum Wine', hex: '#400010' }
  ],
  24: [
    { name: 'Sand Beige', hex: '#C0A98C' },
    { name: 'Warm Beige', hex: '#BEA093' },
    { name: 'Desert Tan', hex: '#B7998A' },
    { name: 'Soft Khaki Beige', hex: '#B09D8C' },
    { name: 'Natural Sand', hex: '#AD9B8C' },
    { name: 'Warm Linen', hex: '#B19B90' }
  ],
  25: [
    { name: 'Rani Pink', hex: '#E95585' },
    { name: 'Lavender Purple', hex: '#975AA7' },
    { name: 'Ruby Red', hex: '#93020C' },
    { name: 'Mustard Gold', hex: '#D59104' },
    { name: 'Classic Black', hex: '#1A1A1A' }
  ],
  26: [
    { name: 'Lilac Purple', hex: '#9070B0' },
    { name: 'Baby Pink', hex: '#F0B0C0' },
    { name: 'Pastel Sky Blue', hex: '#80B0D0' },
    { name: 'Wine Maroon', hex: '#800010' },
    { name: 'Peacock Teal', hex: '#104050' }
  ],
  27: [
    { name: 'Champagne Beige Gold', hex: '#E4C197' },
    { name: 'Warm Beige', hex: '#DDBB91' },
    { name: 'Jet Black Accent', hex: '#1B1B1B' },
    { name: 'Classic Cream Gold', hex: '#FAE2BD' },
    { name: 'Ivory Pearl', hex: '#F9E8D2' }
  ],
  28: [
    { name: 'Dusty Rose Pink', hex: '#C495A2' },
    { name: 'Classic Black', hex: '#1C1B1F' },
    { name: 'Olive Ochre Gold', hex: '#846F48' },
    { name: 'Wine Maroon', hex: '#581622' },
    { name: 'Charcoal Midnight', hex: '#1A1D24' },
    { name: 'Deep Black Emerald', hex: '#111317' }
  ],
  29: [
    { name: 'Peach Nude', hex: '#D8A99B' },
    { name: 'Dusty Rose Pink', hex: '#B88698' },
    { name: 'Midnight Black', hex: '#1C1B1F' },
    { name: 'Mustard Tan', hex: '#856A47' },
    { name: 'Wine Maroon', hex: '#561824' },
    { name: 'Dark Charcoal', hex: '#181A22' }
  ],
  30: [
    { name: 'Mustard Gold', hex: '#FABF32' },
    { name: 'Rust Terracotta', hex: '#8C4528' },
    { name: 'Ruby Crimson Red', hex: '#A90C1A' },
    { name: 'Pastel Sky Blue', hex: '#94AEE3' },
    { name: 'Lavender Lilac', hex: '#BC96D3' },
    { name: 'Peach Rose', hex: '#E7A9A9' }
  ],
  31: [
    { name: 'Soft Mauve Lavender', hex: '#C0A0C0' },
    { name: 'Slate Silver Grey', hex: '#909090' },
    { name: 'Mustard Yellow Gold', hex: '#F0C070' },
    { name: 'Rose Blush Pink', hex: '#F0A0B0' },
    { name: 'Classic Black', hex: '#202020' }
  ],
  32: [
    { name: 'Warm Beige Stripe', hex: '#BFA68A' },
    { name: 'Sand Khaki Stripe', hex: '#AC9580' },
    { name: 'Soft Tan Stripe', hex: '#C0A087' },
    { name: 'Almond Beige Stripe', hex: '#B8997F' },
    { name: 'Desert Sand Stripe', hex: '#C3A78D' }
  ],
  33: [
    { name: 'Steel Navy Blue', hex: '#354B64' },
    { name: 'Deep Steel Blue', hex: '#45566A' },
    { name: 'Classic Royal Navy', hex: '#364B65' },
    { name: 'Midnight Navy Blue', hex: '#344B6A' },
    { name: 'Slate Navy Blue', hex: '#445C77' }
  ],
  34: [
    { name: 'Blush Coral', hex: '#CCA595' },
    { name: 'Olive Ochre', hex: '#9C8F74' },
    { name: 'Khaki Beige', hex: '#B7AB8A' },
    { name: 'Deep Olive Green', hex: '#6A684E' }
  ],
  35: [
    { name: 'Pastel Sky Blue', hex: '#B8CEE8' },
    { name: 'Cream Beige', hex: '#DCC8B4' },
    { name: 'Dusty Rose Pink', hex: '#F0B4C8' },
    { name: 'Jet Classic Black', hex: '#181818' }
  ],
  36: [
    { name: 'Pearl White', hex: '#FAF9F6' }
  ],
  37: [
    { name: 'Classic Black', hex: '#1A1815' }
  ],
  41: [
    { name: 'Royal Navy Blue', hex: '#104070' },
    { name: 'Ruby Crimson Red', hex: '#901030' },
    { name: 'Lavender Purple', hex: '#B090C0' },
    { name: 'Mustard Ochre Gold', hex: '#C09060' },
    { name: 'Peach Coral', hex: '#F0A080' }
  ],
  42: [
    { name: 'Navy Blue', hex: '#15264B' },
    { name: 'Dark Green', hex: '#0C4533' },
    { name: 'Purple', hex: '#3B1744' },
    { name: 'Maroon', hex: '#5F1023' },
    { name: 'Yellow', hex: '#F2A900' }
  ],
  43: [
    { name: 'Teal', hex: '#0E7A7D' },
    { name: 'Maroon', hex: '#6F1A2A' },
    { name: 'Green', hex: '#087345' },
    { name: 'Red', hex: '#A3182E' },
    { name: 'Light Blue', hex: '#7CB4E8' }
  ],
  44: [
    { name: 'Light Blue', hex: '#799FC7' },
    { name: 'Purple', hex: '#663483' },
    { name: 'Dark Green', hex: '#1E5939' },
    { name: 'Beige', hex: '#BCA075' },
    { name: 'Light Pink', hex: '#D598A7' }
  ],
  45: [
    { name: 'Pastel Sky Blue', hex: '#A0C0D0' },
    { name: 'Ocean Teal Green', hex: '#308080' },
    { name: 'Deep Bottle Green', hex: '#105040' },
    { name: 'Dark Plum Wine', hex: '#603050' },
    { name: 'Royal Ruby Red', hex: '#A02030' }
  ],
  46: [
    { name: 'Classic Black', hex: '#1C1C1E' },
    { name: 'Rust Chocolate Brown', hex: '#854138' },
    { name: 'Slate Indigo Blue', hex: '#6070A0' },
    { name: 'Deep Olive Green', hex: '#2F432B' },
    { name: 'Ivory Beige Cream', hex: '#E2CEB9' }
  ],
  47: [
    { name: 'Periwinkle Sky Blue', hex: '#89A4DB' },
    { name: 'Ruby Maroon', hex: '#901030' },
    { name: 'Lavender Lilac', hex: '#B090C0' },
    { name: 'Mustard Ochre Gold', hex: '#C09060' },
    { name: 'Peach Coral', hex: '#F0A080' }
  ]
};

const PRODUCTS_TO_SYNC: ProductDef[] = [
  // 1. Royal Purple Embroidered Anarkali Set
  {
    id: 20,
    sku: 'SBA-COT-9182',
    name: 'Royal Purple Embroidered Anarkali Set',
    category: 'Anarkali',
    price: 1199,
    originalPrice: 2499,
    discount: 52,
    rating: 4.9,
    reviewCount: 168,
    fabric: 'Pure Georgette with Shantoon Inner Lining & Organza Dupatta',
    fit: 'Floor-Length Regal Flared Fit',
    occasion: 'Weddings, Reception & Grand Evening Celebrations',
    washCare: 'Dry Clean Only for fine zardozi & thread work preservation',
    description: 'An ethereal deep royal purple Anarkali suit set enriched with rich golden zari and resham thread embroidery. Designed with a wide scalloped flare, matching churidar pants, and a luminous sheer dupatta.',
    isNewArrival: true,
    isBestSeller: true,
    isTrending: true,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'b8snmt1arnh_1789136975530.png',
      'ih1j5x2s5yr_1789136985484.png'
    ]
  },
  // 2. Pearl Border Designer Kurta Palazzo Set
  {
    id: 21,
    sku: 'SBA-COT-3571',
    name: 'Pearl Border Designer Kurta Palazzo Set',
    category: 'Kurtis',
    price: 899,
    originalPrice: 1899,
    discount: 53,
    rating: 4.8,
    reviewCount: 134,
    fabric: 'Pure Chanderi Silk Blend with Cotton Lining',
    fit: 'Straight Cut Kurti with Flared Palazzo',
    occasion: 'Festive Gatherings, Puja & Elegant Celebrations',
    washCare: 'Gentle Hand Wash in Cold Water or Mild Dry Clean',
    description: 'Crafted in lustrous fabric with delicate pearl lace detailing along the neckline, sleeves, and hem. Paired with a matching wide-leg palazzo pants and lightweight dupatta.',
    isNewArrival: true,
    isBestSeller: true,
    isTrending: false,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      '3tiv4uq3z8u_1789137572616.jpg',
      'qwl90h1wvoh_1789137573943.jpg',
      'cbfjgev3x2d_1789137574821.jpg',
      '8zbqn2li4cx_1789137575842.jpg',
      'pzm0ahcj99e_1789137577206.jpg',
      'zfidvxuva5_1789137578009.jpg'
    ]
  },
  // 3. Royal Floral Embroidered Anarkali Gown (ID 22 is already in DB, will ensure it keeps colors)
  {
    id: 22,
    sku: 'SBA-COT-2041',
    name: 'Royal Floral Embroidered Anarkali Gown',
    category: 'Suits',
    price: 1199,
    originalPrice: 2799,
    discount: 57,
    rating: 4.9,
    reviewCount: 189,
    fabric: 'Premium Soft Net with Satin Inner Lining and 3D Floral Embroidery',
    fit: 'Flared Floor-Length Silhouette with Fitted Waistline',
    occasion: 'Weddings, Sangeet & Festive Galas',
    washCare: 'Dry Clean Recommended for 3D embroidery & pearl work',
    description: 'Elegant floor-length Anarkali gown featuring intricate floral embroidery throughout, beautiful 3D floral appliqué work on the shoulders and front panel, a flattering V-neckline with pearl detailing, and stylish layered bell sleeves.',
    isNewArrival: true,
    isBestSeller: false,
    isTrending: true,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      '6uzm55erdvt_1789137984979.png',
      '455j93lndd7_1789137988097.png',
      'a8n8trnf6dp_1789137990797.png',
      'vabomxuqp7_1789137993509.png',
      'chsrt5bapx_1789137997281.png',
      'xyixbbwjya_1789138000682.png'
    ]
  },
  // 4. Women’s Elegant Embellished Flared Kurti Set
  {
    id: 23,
    sku: 'SBA-COT-6729',
    name: 'Women’s Elegant Embellished Flared Kurti Set',
    category: 'Kurtis',
    price: 799,
    originalPrice: 1699,
    discount: 53,
    rating: 4.7,
    reviewCount: 112,
    fabric: 'Fine Rayon Cotton with Sequinned Yoke & Zari Borders',
    fit: 'Flared A-line Anarkali Cut with Side Dori Tassels',
    occasion: 'Festive Wear, Family Get-togethers & Casual Celebrations',
    washCare: 'Machine wash delicate cycle with mild detergent',
    description: 'Embellished flared kurti crafted with precision yoke zari work, paired with matching pants and a contrast printed dupatta. Breathable and comfortable for all-day celebrations.',
    isNewArrival: true,
    isBestSeller: true,
    isTrending: true,
    isFestive: true,
    isFeatured: false,
    inStock: true,
    imageFilenames: [
      'nhk6b4fcvr8_1789138292204.webp',
      's7e9xuwfyok_1789138293171.webp',
      'jnw66kk1q0n_1789138293882.webp',
      '3jr6chsk7oi_1789138294985.webp',
      'yuc63dk5lgh_1789138296058.webp',
      'ssn8nonsru_1789138296921.webp',
      'yfke207nb09_1789138297873.webp',
      '9412v8guf2o_1789138299171.webp',
      '92ok5942ybs_1789138300121.webp'
    ]
  },
  // 5. Stylish Lace-Up Asymmetrical Kurti Set
  {
    id: 24,
    sku: 'SBA-COT-3918',
    name: 'Stylish Lace-Up Asymmetrical Kurti Set',
    category: 'Kurtis',
    price: 749,
    originalPrice: 1599,
    discount: 53,
    rating: 4.8,
    reviewCount: 96,
    fabric: 'Slub Cotton Blend with Handloom Texture',
    fit: 'Asymmetrical High-Low Flare with Lace Accents',
    occasion: 'Office Ethnic, Brunches & Casual Outings',
    washCare: 'Hand Wash Cold or Machine Wash Delicate',
    description: 'Modern silhouette featuring side lace-up tie detailing and an asymmetrical high-low hemline. Paired with cropped cigarette pants for a smart ethnic look.',
    isNewArrival: false,
    isBestSeller: true,
    isTrending: true,
    isFestive: false,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'd5u7a42zzs_1789138603984.jpg',
      'mh8ebpbnkhj_1789138605130.jpg',
      'n1f4u67j6ho_1789138605812.jpg',
      'ulujdarjpb9_1789138607049.jpg',
      'ypy4eq1frim_1789138607718.jpg',
      'ff7slk9hh9p_1789138608733.jpg'
    ]
  },
  // 6. Elegant Pearl Border Asymmetrical Anarkali Set (ID 25 intact in DB)
  {
    id: 25,
    sku: 'SBA-COT-7701',
    name: 'Elegant Pearl Border Asymmetrical Anarkali Set',
    category: 'Suits',
    price: 1299,
    originalPrice: 2599,
    discount: 50,
    rating: 4.9,
    reviewCount: 154,
    fabric: 'Silk Georgette with Pure Cotton Inner',
    fit: 'Asymmetric Designer Cut with Scalloped Kali',
    occasion: 'Weddings, Engagements & Grand Receptions',
    washCare: 'Dry Clean Only',
    description: 'Bespoke pearl hand-embroidered border along the asymmetric neckline and flared hem. Delivers unmatched grace and flowy elegance.',
    isNewArrival: false,
    isBestSeller: true,
    isTrending: false,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'wldn8x25ric_1789138792269.jpg',
      'lvsan3sx6dn_1789138793610.jpg',
      'z4kv9lyleof_1789138794881.jpg',
      'svsykbn2508_1789138795842.jpg',
      'l50zj65jqgh_1789138797069.jpg'
    ]
  },
  // 7. Dreamy Tie-Dye Palazzo Co-Ord Set
  {
    id: 26,
    sku: 'SBA-COT-4819',
    name: 'Dreamy Tie-Dye Palazzo Co-Ord Set',
    category: 'Co-ord Sets',
    price: 699,
    originalPrice: 1499,
    discount: 53,
    rating: 4.8,
    reviewCount: 88,
    fabric: 'Lightweight Breathable Modal Rayon Tie-Dye Fabric',
    fit: 'Relaxed Fit Peplum Top with High-Waist Palazzo',
    occasion: 'Summer Holidays, Resort Wear & Casual Brunches',
    washCare: 'Gentle Hand Wash Separately in Cold Water',
    description: 'Vibrant tie-dye ombre patterns in soothing pastels. Crafted from ultra-soft modal fabric with comfortable elasticated palazzo waist.',
    isNewArrival: false,
    isBestSeller: false,
    isTrending: true,
    isFestive: false,
    isFeatured: false,
    inStock: true,
    imageFilenames: [
      '0d52emx5ychi_1789138937407.png',
      '9zyh7uk2icp_1789138940661.png',
      'abjotzdtnwp_1789138942889.png',
      '1okzb5mgro6_1789138946418.png',
      'wbeye6qxj7_1789138950683.png'
    ]
  },
  // 8. Royal Embroidered Anarkali Suit Set (ID 27 intact in DB)
  {
    id: 27,
    sku: 'SBA-COT-4520',
    name: 'Royal Embroidered Anarkali Suit Set',
    category: 'Suits',
    price: 799,
    originalPrice: 1699,
    discount: 53,
    rating: 4.7,
    reviewCount: 78,
    fabric: 'Mulmul Cotton with Zari and Thread Detailing',
    fit: 'Flared Kalidar Anarkali Silhouette',
    occasion: 'Pujas, Festive Family Gatherings & Celebrations',
    washCare: 'Hand Wash Cold with Mild Liquid Detergent',
    description: 'Exquisite threadwork and gotta patti details on the front yoke. Features flared kalis that spin with effortless charm and a coordinating dupatta.',
    isNewArrival: false,
    isBestSeller: true,
    isTrending: false,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'nlgkia74zc_1789139124237.png',
      'i6yqkcac8sd_1789139128060.png',
      'vflslab4jk_1789139131763.png',
      'jtpqvgrou_1789139136059.png',
      'va1aijhtif_1789139139991.png'
    ]
  },
  // 9. Designer Embroidered Sharara Suit Set (ID 28 intact in DB)
  {
    id: 28,
    sku: 'SBA-COT-5379',
    name: 'Designer Embroidered Sharara Suit Set',
    category: 'Suits',
    price: 899,
    originalPrice: 1899,
    discount: 53,
    rating: 4.8,
    reviewCount: 94,
    fabric: 'Georgette Sharara with Crepe Lining & Organza Dupatta',
    fit: 'Short Peplum Kurti with Multi-tiered Sharara Flounce',
    occasion: 'Mehendi, Sangeet & Festive Soirées',
    washCare: 'Dry Clean Recommended',
    description: 'Stunning sharara suit set with mirror and sequin highlights on the short kurti. Paired with wide flared tiered sharara pants and an embroidered dupatta.',
    isNewArrival: false,
    isBestSeller: true,
    isTrending: true,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'ca29tt19mda_1789139265843.jpg',
      '4ascjm3wk9z_1789139267734.jpg',
      'c6bdpa40g9_1789139269006.jpg',
      'hin50tbq26b_1789139270282.jpg',
      '98mhh1eatqd_1789139271489.jpg',
      'cfi7revwr4_1789139286731.jpg'
    ]
  },
  // 10. Stylish Cold Shoulder Designer Kurti Palazzo Set (ID 29 intact in DB)
  {
    id: 29,
    sku: 'SBA-COT-8476',
    name: 'Stylish Cold Shoulder Designer Kurti Palazzo Set',
    category: 'Kurtis',
    price: 730,
    originalPrice: 1499,
    discount: 51,
    rating: 4.7,
    reviewCount: 65,
    fabric: 'Pure Cotton Cambric with Cold Shoulder Detailing',
    fit: 'Straight Kurti with Contemporary Cutout Sleeves & Palazzo',
    occasion: 'College Wear, Festive Daywear & Casual Outings',
    washCare: 'Hand Wash Cold',
    description: 'Chic ethnic wear featuring modern cold-shoulder cutouts and subtle lace accents. Breathable pure cotton comfort throughout.',
    isNewArrival: false,
    isBestSeller: true,
    isTrending: false,
    isFestive: false,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'v3fubypx0lg_1789139367853.jpg',
      'lsaqgmdm3d_1789139369197.jpg',
      'xdbkvjhvi1_1789139370285.jpg',
      '3hlfren6f87_1789139371484.jpg',
      'kofxt86ocmh_1789139372443.jpg',
      '3q7qlrgktvx_1789139373403.jpg'
    ]
  },
  // 11. Elegant Cold-Shoulder Embroidered Kurti Palazzo Set (ID 30 intact in DB)
  {
    id: 30,
    sku: 'SBA-COT-4209',
    name: 'Elegant Cold-Shoulder Embroidered Kurti Palazzo Set',
    category: 'Kurtis',
    price: 899,
    originalPrice: 1799,
    discount: 50,
    rating: 4.9,
    reviewCount: 82,
    fabric: 'Chanderi Rayon Blend with Gota Patti Trim',
    fit: 'A-line Kurti with Cold Shoulder Sleeves & Wide Palazzo',
    occasion: 'Festive Dinners, Engagements & Parties',
    washCare: 'Dry Clean or Gentle Hand Wash',
    description: 'Detailed gotta patti floral motifs on the yoke and stylish cold-shoulder sleeves with scallop lace borders. Paired with a flowy palazzo.',
    isNewArrival: false,
    isBestSeller: true,
    isTrending: true,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'e3iijc52cl_1789139732527.jpg',
      '2n5hwcj2w3d_1789139734476.jpg',
      '3fzxl8qgiob_1789139735404.jpg',
      '2dc45g1syfn_1789139736613.jpg',
      'amjqt0grjje_1789139737479.jpg',
      '3dbfssrtpio_1789139738352.jpg'
    ]
  },
  // 12. Stylish Layered Ruffle Palazzo Set
  {
    id: 31,
    sku: 'SBA-COT-5128',
    name: 'Stylish Layered Ruffle Palazzo Set',
    category: 'Co-ord Sets',
    price: 799,
    originalPrice: 1699,
    discount: 53,
    rating: 4.8,
    reviewCount: 91,
    fabric: 'Georgette Blend with Micro-Ruffle Tiers & Crepe Lining',
    fit: 'Fitted Peplum Yoke with Tiered Ruffle Palazzo',
    occasion: 'Cocktail Parties, Festive Celebrations & Sangeet',
    washCare: 'Mild Hand Wash or Dry Clean',
    description: 'Dramatic tiered ruffle flare on the palazzo creating movement and elegance with every step. Complemented by a tailored top.',
    isNewArrival: true,
    isBestSeller: false,
    isTrending: true,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      '5lo1pgdzmf9_1789139959926.jpg',
      'd6wro57xxgu_1789139961480.jpg',
      'd88pnpbi6ab_1789139962443.jpg',
      'ehugm5tfc1a_1789139963736.jpg',
      '7p4lpwzol7f_1789139964518.jpg'
    ]
  },
  // 13. Women’s Striped Formal Shirt & Trouser Co-Ord
  {
    id: 32,
    sku: 'SBA-COT-8910',
    name: 'Women’s Striped Formal Shirt & Trouser Co-Ord',
    category: 'Co-ord Sets',
    price: 749,
    originalPrice: 1599,
    discount: 53,
    rating: 4.7,
    reviewCount: 76,
    fabric: 'Premium Yarn-Dyed Cotton Blend',
    fit: 'Oversized Boyfriend Shirt with High-Rise Cigarette Trousers',
    occasion: 'Office Formal, Workwear & Smart Casuals',
    washCare: 'Machine Wash Delicate, Warm Iron',
    description: 'Sleek vertical striped two-piece co-ord set designed for modern boss-woman elegance. Includes collared shirt and tailored trousers with functional pockets.',
    isNewArrival: false,
    isBestSeller: false,
    isTrending: true,
    isFestive: false,
    isFeatured: false,
    inStock: true,
    imageFilenames: [
      '0gkuggbrwch_1789140343267.png',
      'yyej61wund_1789140346522.png',
      'ilp8rtctl3g_1789140348580.png',
      '5y80g4ab16d_1789140353556.png',
      '02cvibgpr574_1789140356896.png'
    ]
  },
  // 14. Women’s Casual Solid Shirt & Wide Leg Palazzo Set
  {
    id: 33,
    sku: 'SBA-COT-6204',
    name: 'Women’s Casual Solid Shirt & Wide Leg Palazzo Set',
    category: 'Co-ord Sets',
    price: 699,
    originalPrice: 1499,
    discount: 53,
    rating: 4.6,
    reviewCount: 54,
    fabric: 'Soft Lyocell Cotton Blend',
    fit: 'Relaxed Drop-Shoulder Shirt with Wide Flared Pants',
    occasion: 'Travel, Casual Lounge & Airport Looks',
    washCare: 'Machine Wash Cold, Hang Dry',
    description: 'Effortless minimalism meets ethnic loungewear luxury. Features a relaxed collared shirt paired with fluid wide-leg palazzo pants.',
    isNewArrival: false,
    isBestSeller: false,
    isTrending: true,
    isFestive: false,
    isFeatured: false,
    inStock: true,
    imageFilenames: [
      'lgaytclk3zc_1789140508359.jpg',
      '9d6qyo58qnr_1789140510036.jpg',
      '8jr5d1z3y9j_1789140511001.jpg',
      '8a07osyuuye_1789140511794.jpg',
      '3dghp2t26ya_1789140512549.jpg'
    ]
  },
  // 15. Women’s Floral Printed Cotton Kurti Set
  {
    id: 34,
    sku: 'SBA-COT-3914',
    name: 'Women’s Floral Printed Cotton Kurti Set',
    category: 'Kurtis',
    price: 649,
    originalPrice: 1399,
    discount: 54,
    rating: 4.8,
    reviewCount: 110,
    fabric: '100% Pure Jaipuri Printed Cotton',
    fit: 'Straight Cut Kurti with Side Slits & Matching Pants',
    occasion: 'Daily Wear, Workwear & Summer Outings',
    washCare: 'Hand Wash or Machine Wash Cold with like colors',
    description: 'Vibrant hand-block inspired floral prints on ultra-breathable pure cotton fabric. Finished with neat lace detailing on the round neckline and sleeve cuffs.',
    isNewArrival: false,
    isBestSeller: true,
    isTrending: false,
    isFestive: false,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'rt7ap3jnu9e_1789140735826.png',
      'rioqmm03gbn_1789140739038.png',
      'paqny7ccerc_1789140741932.png',
      'rvb19mxmbhc_1789140746026.png'
    ]
  },
  // 16. Full Combo Set – Kurti, Palazzo & Dupatta
  {
    id: 35,
    sku: 'SBA-COT-7195',
    name: 'Full Combo Set – Kurti, Palazzo & Dupatta',
    category: 'Suits',
    price: 899,
    originalPrice: 1999,
    discount: 55,
    rating: 4.9,
    reviewCount: 145,
    fabric: 'Heavy Rayon Slub Kurti & Palazzo with Foil Print Nazneen Dupatta',
    fit: 'Flared Regular Straight Fit Combo Set',
    occasion: 'Festive Wear, Family Gatherings & Celebrations',
    washCare: 'Dry Clean or Gentle Hand Wash in Mild Suds',
    description: 'A complete 3-piece festive wardrobe staple. Features an embellished kurti with delicate zari embroidery, wide flared palazzo pants, and a shimmering foil printed dupatta.',
    isNewArrival: false,
    isBestSeller: true,
    isTrending: true,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'u1qwpmnqa8_1789142736797.png',
      'rxajnc35vs_1789142743811.png',
      '0t4whicdp4p_1789142757187.png',
      '6yff7oujx0j_1789142764339.png'
    ]
  },
  // 17. White Floral Printed Anarkali Kurti
  {
    id: 36,
    sku: 'SBA-COT-2901',
    name: 'White Floral Printed Anarkali Kurti',
    category: 'Anarkali',
    price: 799,
    originalPrice: 1599,
    discount: 50,
    rating: 4.7,
    reviewCount: 68,
    fabric: 'Pure Muslin Cotton with Handblock Floral Motifs',
    fit: 'Full Kalidar Flared Anarkali Silhouette',
    occasion: 'Morning Pujas, Summer Festivities & Temple Visits',
    washCare: 'Hand Wash Cold Separately',
    description: 'Serene ivory white background adorned with charming multi-colored botanical blooms. Flared kalis give a dreamy silhouette.',
    isNewArrival: false,
    isBestSeller: false,
    isTrending: true,
    isFestive: true,
    isFeatured: false,
    inStock: true,
    imageFilenames: [
      'gbksffv285q_1789143348615.webp'
    ]
  },
  // 18. Black Floral Embroidered Kurta Set
  {
    id: 37,
    sku: 'SBA-COT-8412',
    name: 'Black Floral Embroidered Kurta Set',
    category: 'Kurtis',
    price: 849,
    originalPrice: 1799,
    discount: 53,
    rating: 4.8,
    reviewCount: 92,
    fabric: 'Pure Cotton Silk Blend with Resham Floral Embroidery',
    fit: 'Straight Cut Kurta with Ankle Pants',
    occasion: 'Evening Dinners, Soirées & Festive Parties',
    washCare: 'Dry Clean Recommended',
    description: 'Striking jet black canvas highlighted with luminous floral resham embroidery across the neck and sleeves. Paired with coordinating straight pants.',
    isNewArrival: false,
    isBestSeller: false,
    isTrending: true,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'm191x2y6rll_1789143556422.webp'
    ]
  },
  // 19. Printed Square-Neck Short Kurti with Pom-Pom Lace Palazzo Set (ID 41 in DB)
  {
    id: 41,
    sku: 'SBA-COT-4525',
    name: 'Printed Square-Neck Short Kurti with Pom-Pom Lace Palazzo Set',
    category: 'Kurtis',
    price: 599,
    originalPrice: 1399,
    discount: 57,
    rating: 4.8,
    reviewCount: 76,
    fabric: 'Pure Breathable Cotton with Pom-Pom Lace Trim',
    fit: 'Contemporary Square Neck Short Kurti with Flared Palazzo',
    occasion: 'Casual Festivities, College & Daywear',
    washCare: 'Gentle Machine Wash Cold',
    description: 'Youthful and chic printed square-neck short kurti adorned with playful pom-pom lace edging along the hem and sleeves. Paired with a comfortable flared printed palazzo.',
    isNewArrival: true,
    isBestSeller: true,
    isTrending: true,
    isFestive: false,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'wz9npvbgdwd_1789328128380.png',
      '299vxb0u5u4_1789328130362.png',
      'g55jwef64mu_1789328131623.png',
      '3du6uqkz4u_1789328133008.png',
      'x1urhu7bxg_1789328134169.png'
    ]
  },
  // 20. Embroidered Sleeveless Short Kurti with Palazzo & Dupatta Set (ID 42 in DB)
  {
    id: 42,
    sku: 'SBA-COT-4459',
    name: 'Embroidered Sleeveless Short Kurti with Palazzo & Dupatta Set',
    category: 'Suits',
    price: 599,
    originalPrice: 1499,
    discount: 60,
    rating: 4.9,
    reviewCount: 94,
    fabric: 'Chanderi Rayon Blend with Zari Yoke & Chiffon Dupatta',
    fit: 'Sleeveless Peplum Cut Kurti with Flared Palazzo',
    occasion: 'Mehendi, Festive Celebrations & Sangeet',
    washCare: 'Hand Wash Cold or Mild Dry Clean',
    description: 'Stunning sleeveless short kurti with rich resham and zari floral embroidery on the yoke. Accompanied by matching palazzo pants and a sheer flowing dupatta with golden lace borders.',
    isNewArrival: true,
    isBestSeller: true,
    isTrending: true,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'zzqcps0f7x_1789328316950.png',
      '2pv1wuqppv9_1789328318586.png',
      'gtbls9vf7jb_1789328320074.png',
      'p43el0xolgj_1789328321209.png',
      'meq6s65qxti_1789328322351.png'
    ]
  },
  // 21. Floral Printed Front-Slit Long Jacket Tunic with Palazzo Set (ID 43 in DB)
  {
    id: 43,
    sku: 'SBA-COT-9296',
    name: 'Floral Printed Front-Slit Long Jacket Tunic with Palazzo Set',
    category: 'Kurtis',
    price: 750,
    originalPrice: 1699,
    discount: 56,
    rating: 4.8,
    reviewCount: 68,
    fabric: 'Fine Georgette Printed Jacket with Cotton Inner & Palazzo',
    fit: 'Front-Open Slit Flowing Jacket with Matching Pants',
    occasion: 'Parties, Festive Dinners & Evening Soirées',
    washCare: 'Dry Clean or Gentle Cold Wash',
    description: 'Dramatic front-slit floor-length floral printed jacket tunic creating fluid movement. Paired with solid straight palazzo pants and a coordinated inner top.',
    isNewArrival: true,
    isBestSeller: true,
    isTrending: true,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'blb35wji9we_1789329094844.png',
      'rrtcs3mljvj_1789329097031.png',
      'tp2lozs6btp_1789329098079.png',
      'm0wy46taxtj_1789329099952.png',
      'pbz6zhpxktm_1789329101056.png'
    ]
  },
  // 22. Tiered Cotton Maxi Dress with Cropped Denim Jacket Set (ID 44 in DB)
  {
    id: 44,
    sku: 'SBA-COT-9901',
    name: 'Tiered Cotton Maxi Dress with Cropped Denim Jacket Set',
    category: 'Co-ord Sets',
    price: 799,
    originalPrice: 1799,
    discount: 56,
    rating: 4.9,
    reviewCount: 105,
    fabric: 'Pure Cambric Cotton Maxi Dress with Washed Denim Jacket',
    fit: 'Tiered Flared Maxi Dress with Tailored Cropped Jacket',
    occasion: 'Vacations, Casual Outings, Festive Brunches',
    washCare: 'Machine Wash Cold Separately',
    description: 'Effortlessly modern Indo-western ensemble featuring a multi-tiered cotton maxi dress with handcrafted prints, layered with a chic cropped washed denim jacket with metal button accents.',
    isNewArrival: true,
    isBestSeller: true,
    isTrending: true,
    isFestive: false,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'iqvgfzenom8_1789334395666.png',
      'nhbwt31ee3_1789334397383.png',
      'hj7sg8ctfp_1789334398178.png',
      'lmk2bb5igg_1789334399022.png',
      '0xnjc8nyujbc_1789334399997.png'
    ]
  },
  // 23. Pastel Sky Blue Embroidered Kurti Palazzo Set (Uploaded batch 17893263...)
  {
    sku: 'SBA-COT-6322',
    name: 'Pastel Sky Blue Embroidered Kurti Palazzo Set',
    category: 'Kurtis',
    price: 749,
    originalPrice: 1599,
    discount: 53,
    rating: 4.8,
    reviewCount: 84,
    fabric: 'Chanderi Rayon Blend with Gotta Patti Work',
    fit: 'Straight Cut Kurti with Flared Palazzo',
    occasion: 'Daytime Functions, Pujas & Festive Gatherings',
    washCare: 'Hand Wash Cold with Mild Detergent',
    description: 'Refreshing pastel powder blue kurti featuring delicate white thread and gotta patti accents. Complemented by breezy matching palazzo pants.',
    isNewArrival: true,
    isBestSeller: false,
    isTrending: true,
    isFestive: true,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'rlogdt0o42r_1789326322521.png',
      'kqkonjr8qec_1789326325741.png',
      'vdw18upufwf_1789326327600.png',
      '6e6r5v0x04j_1789326331161.png',
      'b41r6ge3ohk_1789326333277.png'
    ]
  },
  // 24. Rust Chocolate Floral Printed Kurti Palazzo Set (Uploaded batch 17893272...)
  {
    sku: 'SBA-COT-7260',
    name: 'Rust Chocolate Floral Printed Kurti Palazzo Set',
    category: 'Kurtis',
    price: 699,
    originalPrice: 1499,
    discount: 53,
    rating: 4.7,
    reviewCount: 62,
    fabric: 'Pure Cotton with Jaipuri Handblock Motifs',
    fit: 'Comfort Fit Straight Kurti & Elasticated Palazzo',
    occasion: 'Office Ethnic, Casual Daywear & Gatherings',
    washCare: 'Gentle Machine Wash Cold',
    description: 'Earthy rust and warm chocolate hues decorated with intricate floral jaal motifs. Crafted from premium breathable cotton.',
    isNewArrival: true,
    isBestSeller: false,
    isTrending: true,
    isFestive: false,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'jtah84dwks_1789327260238.png',
      'qhzpkhkro2h_1789327263132.png',
      'am7s3uzgzc_1789327265016.png',
      '1c5ylsojrv3_1789327267978.png',
      'ni4n7yuorfj_1789327270128.png'
    ]
  },
  // 25. Periwinkle Lavender Floral Short Kurti Palazzo Set (Uploaded batch 17893280...)
  {
    sku: 'SBA-COT-8043',
    name: 'Periwinkle Lavender Floral Short Kurti Palazzo Set',
    category: 'Kurtis',
    price: 699,
    originalPrice: 1499,
    discount: 53,
    rating: 4.8,
    reviewCount: 71,
    fabric: 'Soft Cotton Slub with Lace Edging',
    fit: 'Short Flared Kurti with Flowing Palazzo Pants',
    occasion: 'Festive Luncheons, College & Everyday Chic',
    washCare: 'Hand Wash Cold',
    description: 'Charming periwinkle and soft lavender floral blossoms on lightweight cotton fabric. Highlighted with delicate lace finishes along the hemline.',
    isNewArrival: true,
    isBestSeller: true,
    isTrending: true,
    isFestive: false,
    isFeatured: true,
    inStock: true,
    imageFilenames: [
      'dbmykulz6rm_1789328043333.png',
      'ms9mz8dkm9_1789328045769.png',
      'vt0op25n4h_1789328046957.png',
      '2lyzynf1w9i_1789328048172.png',
      '4c4cu0oesgo_1789328049903.png'
    ]
  }
];

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

async function main() {
  console.log('--- Starting Complete Supabase Restoration & Color Analysis ---');

  // Step 1: Clean up invalid empty "Untitled Product" rows (IDs 39, 40 etc.)
  console.log('Cleaning up empty / invalid placeholder products...');
  const { data: allProds, error: fetchErr } = await supabase.from('products').select('id, name, price');
  if (!fetchErr && allProds) {
    const invalidIds = allProds.filter(p => p.name === 'Untitled Product' && p.price === 0).map(p => p.id);
    console.log('Found empty placeholder IDs to remove:', invalidIds);
    for (const id of invalidIds) {
      await supabase.from('products').delete().eq('id', id);
    }
  }

  // Step 2: Iterate through each product definition, analyze colors, and upsert
  for (const def of PRODUCTS_TO_SYNC) {
    console.log(`\nProcessing: "${def.name}" (ID: ${def.id || 'new'})`);

    const imageUrls = def.imageFilenames.map(fn => `${BASE_URL}${fn}`);
    const colors: { name: string; hex: string; imageUrl: string }[] = [];

    // Determine colors: use exact definitive verified mapping if present
    for (let i = 0; i < imageUrls.length; i++) {
      const imgUrl = imageUrls[i];
      let colorResult: { hex: string; name: string };
      const definitive = def.id && DEFINITIVE_PRODUCT_COLORS[def.id]?.[i];
      if (definitive) {
        colorResult = definitive;
      } else {
        colorResult = await extractColorFromUrl(imgUrl);
      }
      console.log(`  Photo #${i + 1}: ${imgUrl.split('/').pop()} -> ${colorResult.name} (${colorResult.hex})`);
      colors.push({
        name: colorResult.name,
        hex: colorResult.hex,
        imageUrl: imgUrl
      });
    }

    const payload: any = {
      name: def.name,
      category: def.category,
      price: def.price,
      originalPrice: def.originalPrice,
      discount: def.discount,
      rating: def.rating,
      reviewCount: def.reviewCount,
      fabric: def.fabric,
      fit: def.fit,
      occasion: def.occasion,
      washCare: def.washCare,
      description: def.description,
      isNewArrival: def.isNewArrival,
      isBestSeller: def.isBestSeller,
      isTrending: def.isTrending,
      isFestive: def.isFestive,
      isFeatured: def.isFeatured,
      inStock: def.inStock,
      images: JSON.stringify(imageUrls),
      colors: JSON.stringify(colors),
      sizes: JSON.stringify(STANDARD_SIZES),
      sku: def.sku,
    };

    if (def.id) {
      payload.id = def.id;
      // Check if product exists
      const { data: existing } = await supabase.from('products').select('id').eq('id', def.id).maybeSingle();
      if (existing) {
        console.log(`  Updating existing product ID: ${def.id}`);
        const { error: updateErr } = await supabase.from('products').update(payload).eq('id', def.id);
        if (updateErr) console.error('  Update error:', updateErr);
      } else {
        console.log(`  Inserting product with ID: ${def.id}`);
        const { error: insertErr } = await supabase.from('products').insert([payload]);
        if (insertErr) console.error('  Insert error:', insertErr);
      }
    } else {
      // Check by SKU or insert
      const { data: existing } = await supabase.from('products').select('id').eq('sku', def.sku).maybeSingle();
      if (existing) {
        console.log(`  Updating product SKU: ${def.sku}`);
        const { error: updateErr } = await supabase.from('products').update(payload).eq('sku', def.sku);
        if (updateErr) console.error('  Update error:', updateErr);
      } else {
        console.log(`  Inserting new product with SKU: ${def.sku}`);
        const { error: insertErr } = await supabase.from('products').insert([payload]);
        if (insertErr) console.error('  Insert error:', insertErr);
      }
    }
  }

  console.log('\n--- Checking Final State in Supabase ---');
  const { data: finalProducts, error: finalErr } = await supabase
    .from('products')
    .select('id, name, price, isNewArrival, colors, sizes, images')
    .order('id', { ascending: true });

  if (finalErr) {
    console.error('Final check error:', finalErr);
  } else {
    console.log(`SUCCESS! Total verified products in Supabase: ${finalProducts.length}`);
    finalProducts.forEach(p => {
      const cols = typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors;
      const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      const szs = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes;
      console.log(`ID ${p.id}: "${p.name}" | Price: ₹${p.price} | NewArrival: ${p.isNewArrival} | Images: ${imgs?.length} | Colors: ${cols?.length} | Sizes: ${szs?.join(',')}`);
    });
  }
}

main().catch(console.error);
