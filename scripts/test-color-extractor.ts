import sharp from 'sharp';

// RGB to HSL helper
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
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Name that color helper based on Hue, Saturation, Lightness
function getColorName(r: number, g: number, b: number): string {
  const { h, s, l } = rgbToHsl(r, g, b);

  if (l < 15) return 'Classic Black';
  if (l > 88 && s < 15) return 'Off-White / Ivory';
  if (s < 12) {
    if (l > 65) return 'Light Grey';
    if (l > 35) return 'Slate Grey';
    return 'Charcoal';
  }

  // Hue based
  if (h >= 345 || h < 12) {
    if (l < 30) return 'Deep Maroon';
    if (l > 65) return 'Coral Rose';
    return 'Ruby Red';
  }
  if (h >= 12 && h < 38) {
    if (l < 30) return 'Chocolate Brown';
    if (s > 50 && l > 45) return 'Rust Orange';
    if (l > 65) return 'Peach Gold';
    return 'Warm Tan';
  }
  if (h >= 38 && h < 65) {
    if (l > 70) return 'Beige Cream';
    if (l < 40) return 'Mustard Brown';
    return 'Mustard Yellow';
  }
  if (h >= 65 && h < 150) {
    if (l < 25) return 'Dark Forest Green';
    if (l < 45 && s > 40) return 'Emerald Green';
    if (l > 60) return 'Pistachio / Sage Green';
    return 'Olive Green';
  }
  if (h >= 150 && h < 200) {
    if (l < 35) return 'Teal Green';
    return 'Aqua / Sea Green';
  }
  if (h >= 200 && h < 255) {
    if (l < 25) return 'Royal Navy Blue';
    if (l > 65) return 'Powder Sky Blue';
    if (s > 45) return 'Royal Blue';
    return 'Steel Blue';
  }
  if (h >= 255 && h < 290) {
    if (l < 30) return 'Midnight Indigo';
    if (l > 60) return 'Soft Lavender';
    return 'Royal Purple';
  }
  if (h >= 290 && h < 345) {
    if (l < 30) return 'Wine Plum';
    if (l > 65) return 'Baby Pink';
    return 'Magenta Rose';
  }
  return 'Artisanal Shade';
}

async function analyzeGarmentColor(imageUrl: string) {
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status}: ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`Fetched ${imageUrl.slice(-30)}, size: ${buffer.length} bytes, type: ${res.headers.get('content-type')}`);

  // Resize and crop to the garment region (center 50% width, vertical 25% to 75%)
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 1000;

  const cropLeft = Math.floor(width * 0.22);
  const cropTop = Math.floor(height * 0.28);
  const cropWidth = Math.floor(width * 0.56);
  const cropHeight = Math.floor(height * 0.45);

  const { data, info } = await sharp(buffer)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .resize(150, 150, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  const pixelCount = info.width * info.height;

  // Collect candidate fabric pixels
  const candidateColors: { r: number; g: number; b: number; weight: number }[] = [];

  for (let i = 0; i < pixelCount; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    const { s, l } = rgbToHsl(r, g, b);

    // Filter background (pure white / near-white / pale neutral background)
    if (l > 86 && s < 18) continue;
    // Filter dark shadow
    if (l < 10) continue;

    // Weight saturated pixels more, as fabric typically has richer color than skin/shadow
    const saturationWeight = 1 + (s / 40);
    candidateColors.push({ r, g, b, weight: saturationWeight });
  }

  if (candidateColors.length === 0) {
    return { hex: '#58152D', name: 'Artisanal Maroon' };
  }

  // Quantize into 16-step bins
  const binMap = new Map<string, { rSum: number; gSum: number; bSum: number; totalWeight: number; count: number }>();

  for (const c of candidateColors) {
    const qR = Math.floor(c.r / 16) * 16;
    const qG = Math.floor(c.g / 16) * 16;
    const qB = Math.floor(c.b / 16) * 16;
    const key = `${qR}-${qG}-${qB}`;

    const existing = binMap.get(key) || { rSum: 0, gSum: 0, bSum: 0, totalWeight: 0, count: 0 };
    existing.rSum += c.r * c.weight;
    existing.gSum += c.g * c.weight;
    existing.bSum += c.b * c.weight;
    existing.totalWeight += c.weight;
    existing.count++;
    binMap.set(key, existing);
  }

  // Find dominant bin
  let bestBin = null;
  let maxWeight = -1;
  for (const bin of binMap.values()) {
    if (bin.totalWeight > maxWeight) {
      maxWeight = bin.totalWeight;
      bestBin = bin;
    }
  }

  if (!bestBin) {
    return { hex: '#58152D', name: 'Artisanal Shade' };
  }

  const finalR = Math.round(bestBin.rSum / bestBin.totalWeight);
  const finalG = Math.round(bestBin.gSum / bestBin.totalWeight);
  const finalB = Math.round(bestBin.bSum / bestBin.totalWeight);

  const hex = rgbToHex(finalR, finalG, finalB).toUpperCase();
  const name = getColorName(finalR, finalG, finalB);

  return { hex, name, r: finalR, g: finalG, b: finalB };
}

async function test() {
  const testImages = [
    { label: 'Royal Purple Set (ID 20)', url: 'https://cgonpvpjvdqeycdbdyrh.supabase.co/storage/v1/object/public/product-images/products/nwh80q8uoc9_1789136113426.png' },
    { label: 'Black Floral Kurta (ID 37)', url: 'https://cgonpvpjvdqeycdbdyrh.supabase.co/storage/v1/object/public/product-images/products/m191x2y6rll_1789143556422.webp' },
    { label: 'White Floral Anarkali (ID 36)', url: 'https://cgonpvpjvdqeycdbdyrh.supabase.co/storage/v1/object/public/product-images/products/gbksffv285q_1789143348615.webp' },
    { label: 'Pastel Sky Blue (ID 45)', url: 'https://cgonpvpjvdqeycdbdyrh.supabase.co/storage/v1/object/public/product-images/products/rlogdt0o42r_1789326322521.png' },
    { label: 'Rust Chocolate Set (ID 46)', url: 'https://cgonpvpjvdqeycdbdyrh.supabase.co/storage/v1/object/public/product-images/products/jtah84dwks_1789327260238.png' }
  ];

  for (const item of testImages) {
    const result = await analyzeGarmentColor(item.url);
    console.log(`${item.label} -> Hex: ${result.hex} | Name: ${result.name} (RGB: ${result.r}, ${result.g}, ${result.b})`);
  }
}

test();
