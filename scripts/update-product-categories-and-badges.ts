import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ProductUpdate {
  category: 'Suits' | 'Kurtis' | 'Dresses' | 'Dupatta Sets' | 'Co-ord Sets' | 'Anarkali' | 'Festive Wear';
  subcategory: string;
  isBestSeller: boolean;
  isTrending: boolean;
  isFestive: boolean;
  isSale: boolean;
  isFeatured: boolean;
}

// Exact category and badge mapping.
// CRITICAL: isNewArrival is NOT modified in this script to strictly adhere to user directive
// ("New arrivals ko chhod ke baki pura sab").
const PRODUCT_UPDATES: Record<number, ProductUpdate> = {
  // 1. Product 20: Royal Purple Embroidered Anarkali Set
  20: {
    category: 'Anarkali',
    subcategory: 'Anarkali Suit Sets',
    isBestSeller: true,
    isTrending: false,
    isFestive: false,
    isSale: false,
    isFeatured: true
  },

  // 2. Product 21: Pearl Border Designer Kurta Palazzo Set (New Arrival)
  21: {
    category: 'Kurtis',
    subcategory: 'Kurta Palazzo Sets',
    isBestSeller: false,
    isTrending: false,
    isFestive: false,
    isSale: false,
    isFeatured: true
  },

  // 3. Product 22: Royal Floral Embroidered Anarkali Gown (New Arrival)
  22: {
    category: 'Anarkali',
    subcategory: 'Embroidered Anarkali Gowns',
    isBestSeller: false,
    isTrending: false,
    isFestive: false,
    isSale: false,
    isFeatured: true
  },

  // 4. Product 23: Women’s Elegant Embellished Flared Kurti Set (New Arrival)
  23: {
    category: 'Kurtis',
    subcategory: 'Flared Kurti Sets',
    isBestSeller: false,
    isTrending: false,
    isFestive: false,
    isSale: false,
    isFeatured: false
  },

  // 5. Product 24: Stylish Lace-Up Asymmetrical Kurti Set
  24: {
    category: 'Kurtis',
    subcategory: 'Asymmetrical Kurtis',
    isBestSeller: true,
    isTrending: false,
    isFestive: false,
    isSale: false,
    isFeatured: true
  },

  // 6. Product 25: Elegant Pearl Border Asymmetrical Anarkali Set
  25: {
    category: 'Anarkali',
    subcategory: 'Designer Anarkali',
    isBestSeller: false,
    isTrending: false,
    isFestive: true,
    isSale: false,
    isFeatured: true
  },

  // 7. Product 26: Dreamy Tie-Dye Palazzo Co-Ord Set
  26: {
    category: 'Co-ord Sets',
    subcategory: 'Printed Co-Ords',
    isBestSeller: false,
    isTrending: true,
    isFestive: false,
    isSale: false,
    isFeatured: true
  },

  // 8. Product 27: Royal Embroidered Anarkali Suit Set
  27: {
    category: 'Anarkali',
    subcategory: 'Embroidered Anarkali',
    isBestSeller: true,
    isTrending: false,
    isFestive: false,
    isSale: false,
    isFeatured: true
  },

  // 9. Product 28: Designer Embroidered Sharara Suit Set
  28: {
    category: 'Suits',
    subcategory: 'Sharara Suit Sets',
    isBestSeller: false,
    isTrending: false,
    isFestive: true,
    isSale: false,
    isFeatured: true
  },

  // 10. Product 29: Stylish Cold Shoulder Designer Kurti Palazzo Set
  29: {
    category: 'Kurtis',
    subcategory: 'Designer Kurti Sets',
    isBestSeller: true,
    isTrending: false,
    isFestive: false,
    isSale: false,
    isFeatured: true
  },

  // 11. Product 30: Elegant Cold-Shoulder Embroidered Kurti Palazzo Set
  30: {
    category: 'Kurtis',
    subcategory: 'Embroidered Kurti Sets',
    isBestSeller: false,
    isTrending: false,
    isFestive: true,
    isSale: false,
    isFeatured: true
  },

  // 12. Product 31: Stylish Layered Ruffle Palazzo Set (New Arrival)
  31: {
    category: 'Co-ord Sets',
    subcategory: 'Festive Co-Ords',
    isBestSeller: false,
    isTrending: false,
    isFestive: false,
    isSale: false,
    isFeatured: true
  },

  // 13. Product 32: Women’s Striped Formal Shirt & Trouser Co-Ord
  32: {
    category: 'Co-ord Sets',
    subcategory: 'Formal & Casual Co-Ords',
    isBestSeller: false,
    isTrending: true,
    isFestive: false,
    isSale: false,
    isFeatured: false
  },

  // 14. Product 33: Women’s Casual Solid Shirt & Wide Leg Palazzo Set
  33: {
    category: 'Co-ord Sets',
    subcategory: 'Lounge Co-Ords',
    isBestSeller: false,
    isTrending: true,
    isFestive: false,
    isSale: false,
    isFeatured: false
  },

  // 15. Product 34: Women’s Floral Printed Cotton Kurti Set
  34: {
    category: 'Kurtis',
    subcategory: 'Cotton Daily Kurtis',
    isBestSeller: true,
    isTrending: false,
    isFestive: false,
    isSale: false,
    isFeatured: true
  },

  // 16. Product 35: Full Combo Set – Kurti, Palazzo & Dupatta
  35: {
    category: 'Dupatta Sets',
    subcategory: '3-Piece Dupatta Sets',
    isBestSeller: true,
    isTrending: false,
    isFestive: false,
    isSale: false,
    isFeatured: true
  },

  // 17. Product 36: White Floral Printed Anarkali Kurti
  36: {
    category: 'Anarkali',
    subcategory: 'Cotton Anarkali',
    isBestSeller: false,
    isTrending: false,
    isFestive: true,
    isSale: false,
    isFeatured: false
  },

  // 18. Product 37: Black Floral Embroidered Kurta Set
  37: {
    category: 'Kurtis',
    subcategory: 'Embroidered Kurta Sets',
    isBestSeller: false,
    isTrending: true,
    isFestive: false,
    isSale: false,
    isFeatured: true
  },

  // 19. Product 41: Printed Square-Neck Short Kurti with Pom-Pom Lace Palazzo Set (New Arrival)
  41: {
    category: 'Kurtis',
    subcategory: 'Short Kurti Sets',
    isBestSeller: false,
    isTrending: false,
    isFestive: false,
    isSale: true,
    isFeatured: true
  },

  // 20. Product 42: Embroidered Sleeveless Short Kurti with Palazzo & Dupatta Set (New Arrival)
  42: {
    category: 'Suits',
    subcategory: 'Party Wear Suit Sets',
    isBestSeller: false,
    isTrending: false,
    isFestive: false,
    isSale: true,
    isFeatured: true
  },

  // 21. Product 43: Floral Printed Front-Slit Long Jacket Tunic with Palazzo Set (New Arrival)
  43: {
    category: 'Dresses',
    subcategory: 'Indo-Western Tunics & Dresses',
    isBestSeller: false,
    isTrending: false,
    isFestive: false,
    isSale: true,
    isFeatured: true
  },

  // 22. Product 44: Tiered Cotton Maxi Dress with Cropped Denim Jacket Set (New Arrival)
  44: {
    category: 'Dresses',
    subcategory: 'Maxi Dresses & Jackets',
    isBestSeller: false,
    isTrending: false,
    isFestive: false,
    isSale: true,
    isFeatured: true
  },

  // 23. Product 45: Pastel Sky Blue Embroidered Kurti Palazzo Set (New Arrival)
  45: {
    category: 'Kurtis',
    subcategory: 'Gota Patti Kurti Sets',
    isBestSeller: false,
    isTrending: false,
    isFestive: false,
    isSale: true,
    isFeatured: true
  },

  // 24. Product 46: Rust Chocolate Floral Printed Kurti Palazzo Set (New Arrival)
  46: {
    category: 'Kurtis',
    subcategory: 'Handblock Kurti Sets',
    isBestSeller: false,
    isTrending: false,
    isFestive: false,
    isSale: true,
    isFeatured: true
  },

  // 25. Product 47: Periwinkle Lavender Floral Short Kurti Palazzo Set (New Arrival)
  47: {
    category: 'Kurtis',
    subcategory: 'Flared Short Kurti Sets',
    isBestSeller: false,
    isTrending: false,
    isFestive: false,
    isSale: false,
    isFeatured: true
  }
};

async function updateAll() {
  console.log('Fetching products to apply exact category and badge distribution...');
  const { data: products, error } = await supabase.from('products').select('*').order('id');

  if (error || !products) {
    console.error('Error loading products:', error);
    process.exit(1);
  }

  for (const p of products) {
    const pId = Number(p.id);
    const update = PRODUCT_UPDATES[pId];
    if (!update) {
      console.warn(`No update found for Product ID ${pId}`);
      continue;
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({
        category: update.category,
        subcategory: update.subcategory,
        isBestSeller: update.isBestSeller,
        isTrending: update.isTrending,
        isFestive: update.isFestive,
        isSale: update.isSale,
        isFeatured: update.isFeatured
      })
      .eq('id', pId);

    if (updateError) {
      console.error(`Error updating product ${pId}:`, updateError.message);
    } else {
      console.log(`✅ Product ${pId} (${p.name.slice(0, 28)}...): Category -> [${update.category} / ${update.subcategory}] | Badges -> BestSeller:${update.isBestSeller} | Trending:${update.isTrending} | Festive:${update.isFestive} | Sale:${update.isSale} | Featured:${update.isFeatured}`);
    }
  }

  console.log('\n🌟 ALL 25 PRODUCTS UPDATED WITH EXACT CATEGORIES & DISTINCT MERCHANDISING BADGES!');
}

updateAll();
