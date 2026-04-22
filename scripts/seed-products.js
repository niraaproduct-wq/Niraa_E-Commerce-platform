const { getFirebase } = require('../server/config/firebase');

// Load environment variables from root .env
require('dotenv').config({ path: '../.env' });

// All products extracted from mockProducts.js
const products = [
  // Floor Care
  {
    name: 'Floor Cleaner – Lemon Fresh',
    slug: 'floor-cleaner-lemon',
    description: 'Kills 99.9% germs with a refreshing lemon burst. Safe for marble, tiles, and granite. Leaves floors sparkling with zero residue.',
    price: 99,
    comparePrice: 120,
    category: 'floor-cleaner',
    stock: 50,
    images: ['/assets/images/products/floor-cleaner.png'],
    isActive: true,
    isFeatured: true,
    features: ['Kills 99.9% germs', 'Lemon fresh burst', 'Safe for all floor types', 'Eco-friendly formula', 'No rinsing needed'],
    rating: 4.5,
    numReviews: 24,
    variants: [
      { variantId: 'v-fc-lemon-1L', size: '1 Litre', type: 'Bottle', fragrance: 'Lemon', price: 99, originalPrice: 120, stockQuantity: 50 },
      { variantId: 'v-fc-lemon-500ml', size: '500 ml', type: 'Bottle', fragrance: 'Lemon', price: 55, originalPrice: 65, stockQuantity: 20 },
      { variantId: 'v-fc-lemon-1L-refill', size: '1 Litre', type: 'Eco Refill', fragrance: 'Lemon', price: 79, originalPrice: 99, stockQuantity: 100 },
    ],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Floor Cleaner – Rose Petal',
    slug: 'floor-cleaner-rose',
    description: 'Premium rose fragrance floor cleaner that transforms cleaning into an aromatic experience. Powerful germ kill with a long-lasting floral scent.',
    price: 109,
    comparePrice: 130,
    category: 'floor-cleaner',
    stock: 35,
    images: ['/assets/images/products/floor-cleaner.png'],
    isActive: true,
    isFeatured: true,
    features: ['Long-lasting rose fragrance', 'Kills harmful bacteria', 'Streak-free finish', 'pH balanced', 'Marble safe'],
    rating: 4.4,
    numReviews: 18,
    variants: [
      { variantId: 'v-fc-rose-1L', size: '1 Litre', type: 'Bottle', fragrance: 'Rose', price: 109, originalPrice: 130, stockQuantity: 35 },
      { variantId: 'v-fc-rose-500ml', size: '500 ml', type: 'Bottle', fragrance: 'Rose', price: 59, originalPrice: 70, stockQuantity: 15 },
    ],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Floor Cleaner – Jasmine Bloom',
    slug: 'floor-cleaner-jasmine',
    description: 'Jasmine-infused floor cleaner that keeps your home smelling like a garden. Powerful disinfectant action with a soft, long-lasting floral finish.',
    price: 109,
    comparePrice: 135,
    category: 'floor-cleaner',
    stock: 30,
    images: ['/assets/images/products/floor-cleaner.png'],
    isActive: true,
    isFeatured: true,
    features: ['Jasmine floral scent', 'Disinfects & deodorizes', 'Works on all surfaces', 'Gentle formula', 'No harsh chemicals'],
    rating: 4.3,
    numReviews: 14,
    variants: [
      { variantId: 'v-fc-jasmine-1L', size: '1 Litre', type: 'Bottle', fragrance: 'Jasmine', price: 109, originalPrice: 135, stockQuantity: 30 },
      { variantId: 'v-fc-jasmine-refill', size: '1 Litre', type: 'Eco Refill', fragrance: 'Jasmine', price: 85, originalPrice: 108, stockQuantity: 60 },
    ],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Shine Glass & Surface Cleaner',
    slug: 'glass-cleaner',
    description: 'Streak-free shine for windows, mirrors, and glass. Removes dust and fingerprints instantly. Ammonia-free formula, safe for tinted glass.',
    price: 85,
    comparePrice: 110,
    category: 'glass-cleaner',
    stock: 60,
    images: ['/assets/images/products/glass-cleaner.png'],
    isActive: true,
    isFeatured: true,
    features: ['Streak-free shine', 'Removes fingerprints', 'Fast drying', 'Ammonia-free', 'Safe for tinted glass'],
    rating: 4.4,
    numReviews: 12,
    variants: [
      { variantId: 'v-gl-500ml-spray', size: '500 ml', type: 'Spray Bottle', price: 85, originalPrice: 110, stockQuantity: 60 },
      { variantId: 'v-gl-1L-refill', size: '1 Litre', type: 'Refill Pouch', price: 110, originalPrice: 130, stockQuantity: 40 },
    ],
    createdAt: new Date().toISOString()
  },
  // Bathroom Care
  {
    name: 'Toilet Cleaner – Regular',
    slug: 'toilet-cleaner-regular',
    description: 'Thick gel formula that clings to toilet surfaces to eliminate stains, odors, and harmful bacteria. Curved nozzle reaches under the rim.',
    price: 99,
    comparePrice: 120,
    category: 'toilet-cleaner',
    stock: 40,
    images: ['/assets/images/products/toilet-cleaner.png'],
    isActive: true,
    isFeatured: true,
    features: ['Thick gel formula', 'Eliminates odors', 'Kills bacteria', 'Easy squeeze bottle', 'Under-rim nozzle'],
    rating: 4.3,
    numReviews: 18,
    variants: [
      { variantId: 'v-tc-reg-1L', size: '1 Litre', type: 'Bottle', price: 99, originalPrice: 120, stockQuantity: 40 },
      { variantId: 'v-tc-reg-500ml', size: '500 ml', type: 'Bottle', price: 55, originalPrice: 65, stockQuantity: 30 },
    ],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Toilet Cleaner – Power Ultra',
    slug: 'toilet-cleaner-ultra',
    description: 'Industrial-strength gel for stubborn toilet stains and hard water deposits. 10x stronger formula for deep cleaning results in one application.',
    price: 129,
    comparePrice: 160,
    category: 'toilet-cleaner',
    stock: 25,
    images: ['/assets/images/products/toilet-cleaner.png'],
    isActive: true,
    isFeatured: true,
    features: ['10x stronger formula', 'Removes hard water deposits', 'Kills 99.9% germs', 'Thick ultra-clinging gel', 'Fresh pine scent'],
    rating: 4.6,
    numReviews: 21,
    variants: [
      { variantId: 'v-tc-ultra-1L', size: '1 Litre', type: 'Bottle', price: 129, originalPrice: 160, stockQuantity: 25 },
    ],
    createdAt: new Date().toISOString()
  },
  // Kitchen Care
  {
    name: 'Dish Wash Liquid – Lemon',
    slug: 'dish-wash-lemon',
    description: 'Cuts through grease effortlessly with a bright lemon burst. High-foam formula is gentle on hands and works great in hard water.',
    price: 79,
    comparePrice: 99,
    category: 'dish-wash',
    stock: 80,
    images: ['/assets/images/products/dish-wash.png'],
    isActive: true,
    isFeatured: true,
    features: ['Cuts tough grease', 'Lemon fresh scent', 'Gentle on hands', 'High foam formula', 'Works in hard water'],
    rating: 4.6,
    numReviews: 31,
    variants: [
      { variantId: 'v-dw-lemon-750ml', size: '750 ml', type: 'Bottle', price: 79, originalPrice: 99, stockQuantity: 80 },
      { variantId: 'v-dw-lemon-refill', size: '1 Litre', type: 'Eco Refill', price: 89, originalPrice: 110, stockQuantity: 120 },
    ],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Dish Wash Liquid – Orange Zest',
    slug: 'dish-wash-orange',
    description: 'Energising orange-zest dish wash that tackles oily pans, greasy vessels, and stubborn stains. Leaves dishes spotlessly clean with a citrus finish.',
    price: 85,
    comparePrice: 105,
    category: 'dish-wash',
    stock: 50,
    images: ['/assets/images/products/dish-wash.png'],
    isActive: true,
    isFeatured: true,
    features: ['Orange citrus burst', 'Anti-grease formula', 'Gentle on skin', 'Rinses off easily', 'Pleasant smell'],
    rating: 4.5,
    numReviews: 20,
    variants: [
      { variantId: 'v-dw-orange-750ml', size: '750 ml', type: 'Bottle', price: 85, originalPrice: 105, stockQuantity: 50 },
    ],
    createdAt: new Date().toISOString()
  },
  // Laundry Care
  {
    name: 'Detergent Liquid – Blue Power',
    slug: 'detergent-blue',
    description: 'Advanced blue liquid detergent that deep cleans and brightens whites. Removes tough stains like mud, food, and grease in one wash.',
    price: 99,
    comparePrice: 130,
    category: 'detergent',
    stock: 60,
    images: ['/assets/images/products/detergent-liquid.png'],
    isActive: true,
    isFeatured: true,
    features: ['Deep cleans fabrics', 'Brightens whites', 'Removes tough stains', 'Machine & hand wash safe', 'Color protection'],
    rating: 4.2,
    numReviews: 15,
    variants: [
      { variantId: 'v-det-blue-1L', size: '1 Litre', type: 'Bottle', price: 99, originalPrice: 130, stockQuantity: 60 },
      { variantId: 'v-det-blue-refill', size: '1 Litre', type: 'Eco Refill', price: 85, originalPrice: 110, stockQuantity: 90 },
      { variantId: 'v-det-blue-5L', size: '5 Litres', type: 'Canister', price: 450, originalPrice: 600, stockQuantity: 8 },
    ],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Detergent Liquid – Eco Green',
    slug: 'detergent-green',
    description: 'Plant-based eco-friendly detergent with natural surfactants. Safe for sensitive skin, biodegradable, and gentle on coloured clothes.',
    price: 115,
    comparePrice: 149,
    category: 'detergent',
    stock: 45,
    images: ['/assets/images/products/detergent-liquid.png'],
    isActive: true,
    isFeatured: true,
    features: ['Plant-based formula', 'Safe for sensitive skin', 'Biodegradable', 'Protects colours', 'Gentle on all fabrics'],
    rating: 4.4,
    numReviews: 11,
    variants: [
      { variantId: 'v-det-green-1L', size: '1 Litre', type: 'Bottle', price: 115, originalPrice: 149, stockQuantity: 45 },
      { variantId: 'v-det-green-refill', size: '1 Litre', type: 'Eco Refill', price: 95, originalPrice: 125, stockQuantity: 70 },
    ],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Soft Touch Fabric Conditioner',
    slug: 'fabric-conditioner',
    description: 'Nourish your clothes with long-lasting freshness. Untangles cloth fibers, leaves them soft, fragrant, and wrinkle-free wash after wash.',
    price: 150,
    comparePrice: 199,
    category: 'detergent',
    stock: 30,
    images: ['/assets/images/products/fabric-conditioner.png'],
    isActive: true,
    isFeatured: true,
    features: ['Long lasting fragrance', 'Softens fibers', 'Reduces wrinkles', 'Protects colours', 'Anti-static effect'],
    rating: 4.1,
    numReviews: 9,
    variants: [
      { variantId: 'v-fc-cond-1L', size: '1 Litre', type: 'Bottle', price: 150, originalPrice: 199, stockQuantity: 30 },
    ],
    createdAt: new Date().toISOString()
  },
  // Combo Deals
  {
    name: 'Bathroom Care Kit',
    slug: 'combo-bathroom-kit',
    description: 'Everything for a spotless bathroom in one box. Includes our top-rated Toilet Cleaner and Floor Cleaner at an unbeatable combo price.',
    price: 180,
    comparePrice: 240,
    category: 'combo',
    stock: 25,
    images: ['/assets/images/products/toilet-cleaner.png', '/assets/images/products/floor-cleaner.png'],
    isActive: true,
    isFeatured: true,
    isCombo: true,
    features: ['Toilet Cleaner 1L', 'Floor Cleaner 1L', 'Kills germs & bacteria', 'Save ₹60 instantly'],
    rating: 4.7,
    numReviews: 22,
    variants: [
      { variantId: 'v-combo-bath', size: 'Bundle', type: 'Kit', price: 180, originalPrice: 240, stockQuantity: 25 },
    ],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Kitchen Sparkle Duo',
    slug: 'combo-kitchen-sparkle',
    description: 'Keep your kitchen gleaming with this powerful duo. Dish Wash Liquid + Glass & Surface Cleaner for a complete kitchen clean every day.',
    price: 155,
    comparePrice: 210,
    category: 'combo',
    stock: 30,
    images: ['/assets/images/products/dish-wash.png', '/assets/images/products/glass-cleaner.png'],
    isActive: true,
    isFeatured: true,
    isCombo: true,
    features: ['Dish Wash Lemon 750ml', 'Glass & Surface Cleaner 500ml', 'Cuts grease & streak-free shine', 'Save ₹55 instantly'],
    rating: 4.6,
    numReviews: 17,
    variants: [
      { variantId: 'v-combo-kitchen', size: 'Bundle', type: 'Kit', price: 155, originalPrice: 210, stockQuantity: 30 },
    ],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Laundry Expert Set',
    slug: 'combo-laundry-expert',
    description: 'Complete laundry care from wash to finish. Blue Power Detergent + Soft Touch Conditioner for clothes that smell great and feel soft.',
    price: 230,
    comparePrice: 305,
    category: 'combo',
    stock: 20,
    images: ['/assets/images/products/detergent-liquid.png', '/assets/images/products/fabric-conditioner.png'],
    isActive: true,
    isFeatured: true,
    isCombo: true,
    features: ['Detergent Blue Power 1L', 'Fabric Conditioner 1L', 'Deep cleans + softens', 'Save ₹75 instantly'],
    rating: 4.5,
    numReviews: 14,
    variants: [
      { variantId: 'v-combo-laundry', size: 'Bundle', type: 'Kit', price: 230, originalPrice: 305, stockQuantity: 20 },
    ],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Mega Laundry Combo',
    slug: 'combo-mega-laundry',
    description: 'Stock up for the whole month! 2× Detergent + 1× Conditioner — the best value laundry combo for large families.',
    price: 320,
    comparePrice: 460,
    category: 'combo',
    stock: 15,
    images: ['/assets/images/products/detergent-liquid.png', '/assets/images/products/fabric-conditioner.png'],
    isActive: true,
    isFeatured: false,
    isCombo: true,
    features: ['2× Detergent Blue Power 1L', '1× Fabric Conditioner 1L', 'Best value for families', 'Save ₹140 instantly'],
    rating: 4.5,
    numReviews: 14,
    variants: [
      { variantId: 'v-combo-mega-laundry', size: 'Bundle', type: 'Mega Kit', price: 320, originalPrice: 460, stockQuantity: 15 },
    ],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Sparkle & Shine Floor Bundle',
    slug: 'combo-sparkle-shine',
    description: 'The ultimate floor care duo. Lemon Floor Cleaner for deep cleaning + Glass & Surface Cleaner for mirrors and windows — your home will shine from top to bottom.',
    price: 175,
    comparePrice: 230,
    category: 'combo',
    stock: 22,
    images: ['/assets/images/products/floor-cleaner.png', '/assets/images/products/glass-cleaner.png'],
    isActive: true,
    isFeatured: false,
    isCombo: true,
    features: ['Floor Cleaner Lemon 1L', 'Glass & Surface Cleaner 500ml', 'Floor-to-ceiling shine', 'Save ₹55 instantly'],
    rating: 4.4,
    numReviews: 10,
    variants: [
      { variantId: 'v-combo-sparkle', size: 'Bundle', type: 'Kit', price: 175, originalPrice: 230, stockQuantity: 22 },
    ],
    createdAt: new Date().toISOString()
  },
  {
    name: 'Complete Home Combo',
    slug: 'combo-complete-home',
    description: 'The ultimate value pack for Dharmapuri families — 6 full-size products covering every cleaning need in your home. Stock up once, clean for months.',
    price: 549,
    comparePrice: 889,
    category: 'combo',
    stock: 12,
    images: ['/assets/images/products/floor-cleaner.png', '/assets/images/products/toilet-cleaner.png', '/assets/images/products/dish-wash.png', '/assets/images/products/detergent-liquid.png'],
    isActive: true,
    isFeatured: true,
    isCombo: true,
    features: ['Floor Cleaner 1L', 'Toilet Cleaner 1L', 'Dish Wash 750ml', '2× Detergent 1L', 'Glass Cleaner 500ml', 'Save ₹340 instantly'],
    rating: 4.8,
    numReviews: 35,
    variants: [
      { variantId: 'v-combo-full-home', size: 'Bundle', type: 'Mega Combo', price: 549, originalPrice: 889, stockQuantity: 12 },
    ],
    createdAt: new Date().toISOString()
  }
];

async function seedProducts() {
  try {
    const { db } = getFirebase();
    
    console.log(`Seeding ${products.length} products into database...`);
    
    const batch = db.batch();
    
    products.forEach(product => {
      const docRef = db.collection('products').doc();
      batch.set(docRef, product);
    });
    
    await batch.commit();
    
    console.log('✅ All products successfully added to database!');
    console.log(`Total products added: ${products.length}`);
    console.log('\nProducts are now visible in:');
    console.log('  ✓ Admin Product Management page');
    console.log('  ✓ Customer homepage');
    console.log('  ✓ Products listing page');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();