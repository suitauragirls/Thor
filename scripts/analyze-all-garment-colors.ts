import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function componentToHex(c: number) {
  const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
  return ('#' + componentToHex(r) + componentToHex(g) + componentToHex(b)).toUpperCase();
}

function getExactFashionColorName(r: number, g: number, b: number): string {
  const { h, s, l } = rgbToHsl(r, g, b);
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

  // 1. Black & Charcoals
  if (l < 18 && maxDiff < 14) return 'Classic Black';
  if (l < 25 && maxDiff < 12) return 'Charcoal Black';

  // 2. Jewel Dark Tones (Even if low lightness, identify the rich Indian ethnic shade)
  if (l < 30) {
    if (b > r + 10 && b > g + 8) return 'Midnight Navy Blue';
    if (g > r + 8 && g > b + 6) return 'Deep Bottle Green';
    if (r > g + 12 && b > g + 8) return 'Deep Royal Purple';
    if (r > g + 12 && r > b + 10) return 'Deep Wine Maroon';
    if (maxDiff < 14) return 'Charcoal Grey';
  }

  // 3. Whites & Creams
  if (l > 88 && maxDiff < 16) return 'Pearl White';
  if (l > 80 && s < 18) return 'Ivory Cream';

  // 4. Pure Greys
  if (s < 10 || maxDiff < 12) {
    if (l > 60) return 'Silver Grey';
    if (l > 35) return 'Slate Grey';
    return 'Charcoal';
  }

  // 5. Purples & Violets & Lavenders
  if (h >= 250 && h < 295) {
    if (l < 28) return 'Royal Purple';
    if (l > 65) return 'Soft Lavender';
    if (s > 35) return 'Bright Violet';
    return 'Lilac Purple';
  }

  // 6. Blues & Periwinkles
  if (h >= 195 && h < 250) {
    if (l < 25) return 'Midnight Navy Blue';
    if (l < 42 && s > 25) return 'Royal Navy Blue';
    if (l > 65 && s < 25) return 'Periwinkle Blue';
    if (l > 65) return 'Pastel Sky Blue';
    if (s > 35) return 'Classic Indigo Blue';
    return 'Steel Blue';
  }

  // 7. Greens & Teals
  if (h >= 165 && h < 195) {
    if (l < 30) return 'Dark Teal';
    if (l > 65) return 'Ice Blue';
    return 'Ocean Teal';
  }
  if (h >= 68 && h < 165) {
    if (l < 24) return 'Deep Bottle Green';
    if (l < 42 && s > 25) return 'Emerald Green';
    if (l < 42) return 'Forest Green';
    if (l > 65 && s > 20) return 'Mint Green';
    if (l > 65) return 'Pistachio Sage';
    return 'Olive Green';
  }

  // 8. Yellows & Mustards & Golds
  if (h >= 40 && h < 68) {
    if (l > 75 && s < 25) return 'Beige Cream';
    if (l < 35) return 'Olive Brown';
    if (s > 40 && l > 35) return 'Mustard Gold';
    if (l > 60) return 'Sunshine Yellow';
    return 'Khaki Tan';
  }

  // 9. Oranges, Rusts, Terracottas & Browns
  if (h >= 14 && h < 40) {
    if (l < 25) return 'Rich Chocolate Brown';
    if (l < 42 && s > 30) return 'Rust Terracotta';
    if (l < 45) return 'Coffee Brown';
    if (l > 65 && s > 40) return 'Peach Coral';
    if (l > 65) return 'Soft Peach';
    if (s > 50) return 'Tangerine Orange';
    return 'Warm Tan';
  }

  // 10. Reds, Maroons & Pinks
  if (h >= 340 || h < 14) {
    if (l < 24) return 'Deep Wine Maroon';
    if (l < 38) return 'Royal Maroon';
    if (l > 65) return 'Blush Pink';
    if (s > 45) return 'Crimson Red';
    return 'Dusty Rose';
  }

  // 11. Magenta & Rani Pink
  if (h >= 295 && h < 340) {
    if (l < 26) return 'Dark Plum Wine';
    if (l < 48 && s > 30) return 'Rani Magenta';
    if (l > 65) return 'Baby Pink';
    return 'Rose Berry';
  }

  return 'Artisanal Shade';
}

async function extractFabricColor(buf: Buffer, prodName: string) {
  // Resize to 120x120 for processing
  const { data, info } = await sharp(buf)
    .resize(120, 120, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const W = info.width;
  const H = info.height;

  // 1. Detect Background from image borders (top, bottom, left, right 5% strips)
  const bgSamples: [number, number, number][] = [];
  for (let x = 0; x < W; x += 3) {
    for (let y of [0, 1, 2, H - 3, H - 2, H - 1]) {
      const idx = (y * W + x) * channels;
      bgSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
  }
  for (let y = 0; y < H; y += 3) {
    for (let x of [0, 1, 2, W - 3, W - 2, W - 1]) {
      const idx = (y * W + x) * channels;
      bgSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
    }
  }

  // Compute average background color
  let bgRSum = 0, bgGSum = 0, bgBSum = 0;
  for (const [r, g, b] of bgSamples) {
    bgRSum += r; bgGSum += g; bgBSum += b;
  }
  const bgR = bgRSum / bgSamples.length;
  const bgG = bgGSum / bgSamples.length;
  const bgB = bgBSum / bgSamples.length;

  // 2. Scan central garment area (x: 20-80%, y: 22-82%)
  const startX = Math.floor(W * 0.20);
  const endX = Math.floor(W * 0.80);
  const startY = Math.floor(H * 0.22);
  const endY = Math.floor(H * 0.82);

  const binStep = 16;
  const bins = new Map<string, { rSum: number; gSum: number; bSum: number; weight: number; count: number }>();
  let darkFabricPixels: [number, number, number][] = [];

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * W + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Distance from detected background
      const distFromBg = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
      if (distFromBg < 30) continue; // Background pixel!

      const { s, l, h } = rgbToHsl(r, g, b);

      // Filter near-white studio highlights if background is white
      if (l > 90 && s < 15) continue;

      // Filter extreme black shadows unless garment is black
      if (l < 8) continue;

      if (l < 24) {
        darkFabricPixels.push([r, g, b]);
      }

      // De-weight skin
      const isSkin = h >= 16 && h <= 36 && l >= 45 && l <= 82 && s >= 18 && s <= 55 && r > g && g > b;

      const binR = Math.floor(r / binStep) * binStep;
      const binG = Math.floor(g / binStep) * binStep;
      const binB = Math.floor(b / binStep) * binStep;
      const key = `${binR}-${binG}-${binB}`;

      let w = 1.0;
      if (isSkin) {
        w = 0.05;
      } else {
        w = 1.0 + (s / 20); // prioritize saturated cloth
        if (l >= 20 && l <= 75) w *= 1.3;
      }

      const existing = bins.get(key) || { rSum: 0, gSum: 0, bSum: 0, weight: 0, count: 0 };
      existing.rSum += r * w;
      existing.gSum += g * w;
      existing.bSum += b * w;
      existing.weight += w;
      existing.count++;
      bins.set(key, existing);
    }
  }

  const lower = prodName.toLowerCase();

  // If product is named "Black" or dark pixels predominate (> 40% of non-bg)
  if (lower.includes('black') && darkFabricPixels.length > 50) {
    let rSum = 0, gSum = 0, bSum = 0;
    for (const [r, g, b] of darkFabricPixels) {
      rSum += r; gSum += g; bSum += b;
    }
    const avgR = Math.round(rSum / darkFabricPixels.length);
    const avgG = Math.round(gSum / darkFabricPixels.length);
    const avgB = Math.round(bSum / darkFabricPixels.length);
    return { hex: rgbToHex(avgR, avgG, avgB), name: 'Classic Black' };
  }

  if (lower.includes('white') && bins.size < 10) {
    return { hex: '#FAF9F6', name: 'Pearl White' };
  }

  // Find top bin
  let bestBin = null;
  let maxWeight = -1;
  for (const bin of bins.values()) {
    if (bin.weight > maxWeight) {
      maxWeight = bin.weight;
      bestBin = bin;
    }
  }

  if (!bestBin) {
    return { hex: '#58152D', name: 'Artisanal Ensemble' };
  }

  const finalR = Math.round(bestBin.rSum / bestBin.weight);
  const finalG = Math.round(bestBin.gSum / bestBin.weight);
  const finalB = Math.round(bestBin.bSum / bestBin.weight);

  const hex = rgbToHex(finalR, finalG, finalB);
  const name = getExactFashionColorName(finalR, finalG, finalB);

  return { hex, name, r: finalR, g: finalG, b: finalB };
}

async function run() {
  const { data: products } = await supabase.from('products').select('*').order('id', { ascending: true });
  if (!products) return;

  console.log(`Analyzing ${products.length} products with Border Background Subtraction...`);

  for (const prod of products) {
    let images: string[] = [];
    try { images = JSON.parse(prod.images); } catch { images = [prod.images]; }

    console.log(`\n---------------------------------------------`);
    console.log(`Product [${prod.id}] ${prod.name} (${images.length} images)`);

    const newColors: { name: string; hex: string; imageUrl: string }[] = [];

    for (let i = 0; i < images.length; i++) {
      const imgUrl = images[i];
      const filename = imgUrl.split('/').pop() || '';
      try {
        const { data: blob } = await supabase.storage.from('product-images').download('products/' + filename);
        if (!blob) continue;
        const buf = Buffer.from(await blob.arrayBuffer());
        const extracted = await extractFabricColor(buf, prod.name);
        console.log(`  Photo [${i}] ${filename} -> ${extracted.name} (${extracted.hex})`);
        newColors.push({
          name: extracted.name,
          hex: extracted.hex,
          imageUrl: imgUrl
        });
      } catch (err: any) {
        console.error(`  Error in photo ${i}:`, err.message);
      }
    }

    if (newColors.length > 0) {
      await supabase
        .from('products')
        .update({ colors: JSON.stringify(newColors) })
        .eq('id', prod.id);
      console.log(`  => SYNCED ${newColors.length} colors to Supabase for [${prod.id}]`);
    }
  }

  console.log('\n=============================================');
  console.log('BORDER BACKGROUND SUBTRACTION FINISHED AND SYNCED!');
  console.log('=============================================');
}

run();
