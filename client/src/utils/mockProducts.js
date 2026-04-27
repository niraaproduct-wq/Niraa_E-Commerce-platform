import floorCleanerImg from '../assets/images/products/floor-cleaner.png';
import toiletCleanerImg from '../assets/images/products/toilet-cleaner.png';
import dishWashImg from '../assets/images/products/dish-wash.png';
import detergentImg from '../assets/images/products/detergent-liquid.png';
import glassCleanerImg from '../assets/images/products/glass-cleaner.png';
import fabricConditionerImg from '../assets/images/products/fabric-conditioner.png';

// ─── FLOOR CARE ──────────────────────────────────────────────────────────────
const floorCleanerBase = {
  category: 'floor-cleaner',
  categoryLabel: 'Floor Care',
  image: floorCleanerImg,
  images: [floorCleanerImg],
  usage: 'Dilute 30ml in half a bucket of water. Mop floors thoroughly. No rinsing needed.',
  isFeatured: true,
  isCombo: false,
  isRefill: false,
  subscriptionAvailable: true,
};

// ─── BATHROOM CARE ────────────────────────────────────────────────────────────
const toiletCleanerBase = {
  category: 'toilet-cleaner',
  categoryLabel: 'Bathroom Care',
  image: toiletCleanerImg,
  images: [toiletCleanerImg],
  usage: 'Apply under rim. Leave for 10 minutes. Scrub with toilet brush and flush.',
  isFeatured: true,
  isCombo: false,
  isRefill: false,
  subscriptionAvailable: true,
};

// ─── KITCHEN CARE ─────────────────────────────────────────────────────────────
const dishWashBase = {
  category: 'dish-wash',
  categoryLabel: 'Kitchen Care',
  image: dishWashImg,
  images: [dishWashImg],
  usage: 'Apply a few drops on wet sponge. Scrub dishes and rinse well with water.',
  isFeatured: true,
  isCombo: false,
  isRefill: false,
  subscriptionAvailable: true,
};

// ─── LAUNDRY CARE ─────────────────────────────────────────────────────────────
const detergentBase = {
  category: 'detergent',
  categoryLabel: 'Laundry Care',
  image: detergentImg,
  images: [detergentImg],
  usage: 'For machine wash: Add 30ml per load. For hand wash: Add 10ml to a bucket of water.',
  isFeatured: true,
  isCombo: false,
  isRefill: false,
  subscriptionAvailable: true,
};

export const mockProducts = [

  // ══════════════════════ FLOOR CARE ══════════════════════
  {
    ...floorCleanerBase,
    _id: 'floor-cleaner-lemon',
    name: 'Floor Cleaner – Lemon Fresh',
    slug: 'floor-cleaner-lemon',
    description: 'Kills 99.9% germs with a refreshing lemon burst. Safe for marble, tiles, and granite. Leaves floors sparkling with zero residue.',
    price: 99, originalPrice: 120, discount: 17, quantity: '1 litre',
    features: ['Kills 99.9% germs', 'Lemon fresh burst', 'Safe for all floor types', 'Eco-friendly formula', 'No rinsing needed'],
    rating: 4.5, numReviews: 24,
    variants: [
      { variantId: 'v-fc-lemon-1L', size: '1 Litre', type: 'Bottle', fragrance: 'Lemon', price: 99, originalPrice: 120, stockQuantity: 50 },
      { variantId: 'v-fc-lemon-500ml', size: '500 ml', type: 'Bottle', fragrance: 'Lemon', price: 55, originalPrice: 65, stockQuantity: 20 },
      { variantId: 'v-fc-lemon-1L-refill', size: '1 Litre', type: 'Eco Refill', fragrance: 'Lemon', price: 79, originalPrice: 99, stockQuantity: 100 },
    ],
  },
  {
    ...floorCleanerBase,
    _id: 'floor-cleaner-rose',
    name: 'Floor Cleaner – Rose Petal',
    slug: 'floor-cleaner-rose',
    description: 'Premium rose fragrance floor cleaner that transforms cleaning into an aromatic experience. Powerful germ kill with a long-lasting floral scent.',
    price: 109, originalPrice: 130, discount: 16, quantity: '1 litre',
    features: ['Long-lasting rose fragrance', 'Kills harmful bacteria', 'Streak-free finish', 'pH balanced', 'Marble safe'],
    rating: 4.4, numReviews: 18,
    variants: [
      { variantId: 'v-fc-rose-1L', size: '1 Litre', type: 'Bottle', fragrance: 'Rose', price: 109, originalPrice: 130, stockQuantity: 35 },
      { variantId: 'v-fc-rose-500ml', size: '500 ml', type: 'Bottle', fragrance: 'Rose', price: 59, originalPrice: 70, stockQuantity: 15 },
    ],
  },
  {
    ...floorCleanerBase,
    _id: 'floor-cleaner-jasmine',
    name: 'Floor Cleaner – Jasmine Bloom',
    slug: 'floor-cleaner-jasmine',
    description: 'Jasmine-infused floor cleaner that keeps your home smelling like a garden. Powerful disinfectant action with a soft, long-lasting floral finish.',
    price: 109, originalPrice: 135, discount: 19, quantity: '1 litre',
    features: ['Jasmine floral scent', 'Disinfects & deodorizes', 'Works on all surfaces', 'Gentle formula', 'No harsh chemicals'],
    rating: 4.3, numReviews: 14,
    variants: [
      { variantId: 'v-fc-jasmine-1L', size: '1 Litre', type: 'Bottle', fragrance: 'Jasmine', price: 109, originalPrice: 135, stockQuantity: 30 },
      { variantId: 'v-fc-jasmine-refill', size: '1 Litre', type: 'Eco Refill', fragrance: 'Jasmine', price: 85, originalPrice: 108, stockQuantity: 60 },
    ],
  },

  // ══════════════════════ GLASS / SURFACE ══════════════════════
  {
    ...floorCleanerBase,
    category: 'glass-cleaner',
    categoryLabel: 'Surface Care',
    image: glassCleanerImg,
    images: [glassCleanerImg],
    _id: 'glass-cleaner',
    name: 'Shine Glass & Surface Cleaner',
    slug: 'glass-cleaner',
    description: 'Streak-free shine for windows, mirrors, and glass. Removes dust and fingerprints instantly. Ammonia-free formula, safe for tinted glass.',
    price: 85, originalPrice: 110, discount: 22, quantity: '500 ml',
    features: ['Streak-free shine', 'Removes fingerprints', 'Fast drying', 'Ammonia-free', 'Safe for tinted glass'],
    rating: 4.4, numReviews: 12,
    usage: 'Spray directly on surface and wipe with a clean dry cloth in circular motions.',
    variants: [
      { variantId: 'v-gl-500ml-spray', size: '500 ml', type: 'Spray Bottle', price: 85, originalPrice: 110, stockQuantity: 60 },
      { variantId: 'v-gl-1L-refill', size: '1 Litre', type: 'Refill Pouch', price: 110, originalPrice: 130, stockQuantity: 40 },
    ],
  },

  // ══════════════════════ BATHROOM CARE ══════════════════════
  {
    ...toiletCleanerBase,
    _id: 'toilet-cleaner-regular',
    name: 'Toilet Cleaner – Regular',
    slug: 'toilet-cleaner-regular',
    description: 'Thick gel formula that clings to toilet surfaces to eliminate stains, odors, and harmful bacteria. Curved nozzle reaches under the rim.',
    price: 99, originalPrice: 120, discount: 17, quantity: '1 litre',
    features: ['Thick gel formula', 'Eliminates odors', 'Kills bacteria', 'Easy squeeze bottle', 'Under-rim nozzle'],
    rating: 4.3, numReviews: 18,
    variants: [
      { variantId: 'v-tc-reg-1L', size: '1 Litre', type: 'Bottle', price: 99, originalPrice: 120, stockQuantity: 40 },
      { variantId: 'v-tc-reg-500ml', size: '500 ml', type: 'Bottle', price: 55, originalPrice: 65, stockQuantity: 30 },
    ],
  },
  {
    ...toiletCleanerBase,
    _id: 'toilet-cleaner-ultra',
    name: 'Toilet Cleaner – Power Ultra',
    slug: 'toilet-cleaner-ultra',
    description: 'Industrial-strength gel for stubborn toilet stains and hard water deposits. 10x stronger formula for deep cleaning results in one application.',
    price: 129, originalPrice: 160, discount: 19, quantity: '1 litre',
    features: ['10x stronger formula', 'Removes hard water deposits', 'Kills 99.9% germs', 'Thick ultra-clinging gel', 'Fresh pine scent'],
    rating: 4.6, numReviews: 21,
    variants: [
      { variantId: 'v-tc-ultra-1L', size: '1 Litre', type: 'Bottle', price: 129, originalPrice: 160, stockQuantity: 25 },
    ],
  },

  // ══════════════════════ KITCHEN CARE ══════════════════════
  {
    ...dishWashBase,
    _id: 'dish-wash-lemon',
    name: 'Dish Wash Liquid – Lemon',
    slug: 'dish-wash-lemon',
    description: 'Cuts through grease effortlessly with a bright lemon burst. High-foam formula is gentle on hands and works great in hard water.',
    price: 79, originalPrice: 99, discount: 20, quantity: '750 ml',
    features: ['Cuts tough grease', 'Lemon fresh scent', 'Gentle on hands', 'High foam formula', 'Works in hard water'],
    rating: 4.6, numReviews: 31,
    variants: [
      { variantId: 'v-dw-lemon-750ml', size: '750 ml', type: 'Bottle', price: 79, originalPrice: 99, stockQuantity: 80 },
      { variantId: 'v-dw-lemon-refill', size: '1 Litre', type: 'Eco Refill', price: 89, originalPrice: 110, stockQuantity: 120 },
    ],
  },
  {
    ...dishWashBase,
    _id: 'dish-wash-orange',
    name: 'Dish Wash Liquid – Orange Zest',
    slug: 'dish-wash-orange',
    description: 'Energising orange-zest dish wash that tackles oily pans, greasy vessels, and stubborn stains. Leaves dishes spotlessly clean with a citrus finish.',
    price: 85, originalPrice: 105, discount: 19, quantity: '750 ml',
    features: ['Orange citrus burst', 'Anti-grease formula', 'Gentle on skin', 'Rinses off easily', 'Pleasant smell'],
    rating: 4.5, numReviews: 20,
    variants: [
      { variantId: 'v-dw-orange-750ml', size: '750 ml', type: 'Bottle', price: 85, originalPrice: 105, stockQuantity: 50 },
    ],
  },

  // ══════════════════════ LAUNDRY CARE ══════════════════════
  {
    ...detergentBase,
    _id: 'detergent-blue',
    name: 'Detergent Liquid – Blue Power',
    slug: 'detergent-blue',
    description: 'Advanced blue liquid detergent that deep cleans and brightens whites. Removes tough stains like mud, food, and grease in one wash.',
    price: 99, originalPrice: 130, discount: 24, quantity: '1 litre',
    features: ['Deep cleans fabrics', 'Brightens whites', 'Removes tough stains', 'Machine & hand wash safe', 'Color protection'],
    rating: 4.2, numReviews: 15,
    variants: [
      { variantId: 'v-det-blue-1L', size: '1 Litre', type: 'Bottle', price: 99, originalPrice: 130, stockQuantity: 60 },
      { variantId: 'v-det-blue-refill', size: '1 Litre', type: 'Eco Refill', price: 85, originalPrice: 110, stockQuantity: 90 },
      { variantId: 'v-det-blue-5L', size: '5 Litres', type: 'Canister', price: 450, originalPrice: 600, stockQuantity: 8 },
    ],
  },
  {
    ...detergentBase,
    _id: 'detergent-green',
    name: 'Detergent Liquid – Eco Green',
    slug: 'detergent-green',
    description: 'Plant-based eco-friendly detergent with natural surfactants. Safe for sensitive skin, biodegradable, and gentle on coloured clothes.',
    price: 115, originalPrice: 149, discount: 23, quantity: '1 litre',
    features: ['Plant-based formula', 'Safe for sensitive skin', 'Biodegradable', 'Protects colours', 'Gentle on all fabrics'],
    rating: 4.4, numReviews: 11,
    variants: [
      { variantId: 'v-det-green-1L', size: '1 Litre', type: 'Bottle', price: 115, originalPrice: 149, stockQuantity: 45 },
      { variantId: 'v-det-green-refill', size: '1 Litre', type: 'Eco Refill', price: 95, originalPrice: 125, stockQuantity: 70 },
    ],
  },
  {
    ...detergentBase,
    _id: 'fabric-conditioner',
    name: 'Soft Touch Fabric Conditioner',
    slug: 'fabric-conditioner',
    description: 'Nourish your clothes with long-lasting freshness. Untangles cloth fibers, leaves them soft, fragrant, and wrinkle-free wash after wash.',
    price: 150, originalPrice: 199, discount: 25, quantity: '1 litre',
    image: fabricConditionerImg,
    images: [fabricConditionerImg],
    features: ['Long lasting fragrance', 'Softens fibers', 'Reduces wrinkles', 'Protects colours', 'Anti-static effect'],
    usage: 'Add one capful to the last rinse cycle. Do not pour directly on clothes.',
    rating: 4.1, numReviews: 9,
    variants: [
      { variantId: 'v-fc-cond-1L', size: '1 Litre', type: 'Bottle', price: 150, originalPrice: 199, stockQuantity: 30 },
    ],
  },

  // ══════════════════════ COMBO DEALS ══════════════════════
  {
    _id: 'combo-bathroom-kit',
    name: 'Bathroom Care Kit',
    slug: 'combo-bathroom-kit',
    category: 'combo', categoryLabel: 'Combo Deal',
    description: 'Everything for a spotless bathroom in one box. Includes our top-rated Toilet Cleaner and Floor Cleaner at an unbeatable combo price.',
    price: 180, originalPrice: 240, discount: 25, quantity: '2 products',
    image: toiletCleanerImg, images: [toiletCleanerImg, floorCleanerImg],
    features: ['Toilet Cleaner 1L', 'Floor Cleaner 1L', 'Kills germs & bacteria', 'Save ₹60 instantly'],
    usage: 'Use each product as directed on label.',
    comboItems: ['Toilet Cleaner 1L', 'Floor Cleaner – Lemon 1L'],
    comboTag: '🚾 Bathroom', comboColor: '#0d7a6a',
    isCombo: true, isFeatured: true, isRefill: false, subscriptionAvailable: true,
    rating: 4.7, numReviews: 22,
    variants: [{ variantId: 'v-combo-bath', size: 'Bundle', type: 'Kit', price: 180, originalPrice: 240, stockQuantity: 25 }],
  },
  {
    _id: 'combo-kitchen-sparkle',
    name: 'Kitchen Sparkle Duo',
    slug: 'combo-kitchen-sparkle',
    category: 'combo', categoryLabel: 'Combo Deal',
    description: 'Keep your kitchen gleaming with this powerful duo. Dish Wash Liquid + Glass & Surface Cleaner for a complete kitchen clean every day.',
    price: 155, originalPrice: 210, discount: 26, quantity: '2 products',
    image: dishWashImg, images: [dishWashImg, glassCleanerImg],
    features: ['Dish Wash Lemon 750ml', 'Glass & Surface Cleaner 500ml', 'Cuts grease & streak-free shine', 'Save ₹55 instantly'],
    usage: 'Use each product as directed on label.',
    comboItems: ['Dish Wash Lemon 750ml', 'Glass Cleaner 500ml'],
    comboTag: '🍽️ Kitchen', comboColor: '#c8a84b',
    isCombo: true, isFeatured: true, isRefill: false, subscriptionAvailable: true,
    rating: 4.6, numReviews: 17,
    variants: [{ variantId: 'v-combo-kitchen', size: 'Bundle', type: 'Kit', price: 155, originalPrice: 210, stockQuantity: 30 }],
  },
  {
    _id: 'combo-laundry-expert',
    name: 'Laundry Expert Set',
    slug: 'combo-laundry-expert',
    category: 'combo', categoryLabel: 'Combo Deal',
    description: 'Complete laundry care from wash to finish. Blue Power Detergent + Soft Touch Conditioner for clothes that smell great and feel soft.',
    price: 230, originalPrice: 305, discount: 25, quantity: '2 products',
    image: detergentImg, images: [detergentImg, fabricConditionerImg],
    features: ['Detergent Blue Power 1L', 'Fabric Conditioner 1L', 'Deep cleans + softens', 'Save ₹75 instantly'],
    usage: 'Use detergent for wash cycle, conditioner in final rinse.',
    comboItems: ['Detergent Blue Power 1L', 'Fabric Conditioner 1L'],
    comboTag: '👕 Laundry', comboColor: '#4a6fa8',
    isCombo: true, isFeatured: true, isRefill: false, subscriptionAvailable: true,
    rating: 4.5, numReviews: 14,
    variants: [{ variantId: 'v-combo-laundry', size: 'Bundle', type: 'Kit', price: 230, originalPrice: 305, stockQuantity: 20 }],
  },
  {
    _id: 'combo-mega-laundry',
    name: 'Mega Laundry Combo',
    slug: 'combo-mega-laundry',
    category: 'combo', categoryLabel: 'Combo Deal',
    description: 'Stock up for the whole month! 2× Detergent + 1× Conditioner — the best value laundry combo for large families.',
    price: 320, originalPrice: 460, discount: 30, quantity: '3 products',
    image: detergentImg, images: [detergentImg, fabricConditionerImg],
    features: ['2× Detergent Blue Power 1L', '1× Fabric Conditioner 1L', 'Best value for families', 'Save ₹140 instantly'],
    usage: 'Use detergent for wash, conditioner for final rinse.',
    comboItems: ['Detergent 1L', 'Detergent 1L', 'Fabric Conditioner 1L'],
    comboTag: '💪 Mega Value', comboColor: '#7c3aed',
    isCombo: true, isFeatured: false, isRefill: false, subscriptionAvailable: true,
    rating: 4.5, numReviews: 14,
    variants: [{ variantId: 'v-combo-mega-laundry', size: 'Bundle', type: 'Mega Kit', price: 320, originalPrice: 460, stockQuantity: 15 }],
  },
  {
    _id: 'combo-sparkle-shine',
    name: 'Sparkle & Shine Floor Bundle',
    slug: 'combo-sparkle-shine',
    category: 'combo', categoryLabel: 'Combo Deal',
    description: 'The ultimate floor care duo. Lemon Floor Cleaner for deep cleaning + Glass & Surface Cleaner for mirrors and windows — your home will shine from top to bottom.',
    price: 175, originalPrice: 230, discount: 24, quantity: '2 products',
    image: floorCleanerImg, images: [floorCleanerImg, glassCleanerImg],
    features: ['Floor Cleaner Lemon 1L', 'Glass & Surface Cleaner 500ml', 'Floor-to-ceiling shine', 'Save ₹55 instantly'],
    usage: 'Use floor cleaner for floors, glass cleaner for windows and mirrors.',
    comboItems: ['Floor Cleaner Lemon 1L', 'Glass Cleaner 500ml'],
    comboTag: '✨ Floor + Glass', comboColor: '#0d9488',
    isCombo: true, isFeatured: false, isRefill: false, subscriptionAvailable: true,
    rating: 4.4, numReviews: 10,
    variants: [{ variantId: 'v-combo-sparkle', size: 'Bundle', type: 'Kit', price: 175, originalPrice: 230, stockQuantity: 22 }],
  },
  {
    _id: 'combo-complete-home',
    name: 'Complete Home Combo',
    slug: 'combo-complete-home',
    category: 'combo', categoryLabel: 'Combo Deal',
    description: 'The ultimate value pack for Dharmapuri families — 6 full-size products covering every cleaning need in your home. Stock up once, clean for months.',
    price: 549, originalPrice: 889, discount: 38, quantity: '6 products',
    image: floorCleanerImg, images: [floorCleanerImg, toiletCleanerImg, dishWashImg, detergentImg],
    features: ['Floor Cleaner 1L', 'Toilet Cleaner 1L', 'Dish Wash 750ml', '2× Detergent 1L', 'Glass Cleaner 500ml', 'Save ₹340 instantly'],
    usage: 'A complete home care package. Use each product as directed on its label.',
    comboItems: ['Floor Cleaner 1L', 'Toilet Cleaner 1L', 'Dish Wash 750ml', 'Detergent 1L', 'Detergent 1L', 'Glass Cleaner 500ml'],
    comboTag: '🏠 Best Value', comboColor: '#c8a84b',
    isCombo: true, isFeatured: true, isRefill: false, subscriptionAvailable: true,
    rating: 4.8, numReviews: 35,
    variants: [{ variantId: 'v-combo-full-home', size: 'Bundle', type: 'Mega Combo', price: 549, originalPrice: 889, stockQuantity: 12 }],
  },
];

// Derived helpers
export const getProductsByCategory = (cat) => mockProducts.filter(p => p.category === cat);
export const getCombos = () => mockProducts.filter(p => p.isCombo);
export const getIndividualProducts = () => mockProducts.filter(p => !p.isCombo);
export const getFeatured = () => mockProducts.filter(p => p.isFeatured && !p.isCombo);

export const CATEGORIES = [
  { id: 'detergent',      label: 'Laundry Care',   icon: '👕', desc: 'Machine & hand-wash detergents for bright, soft clothes.' },
  { id: 'floor-cleaner',  label: 'Floor Care',     icon: '🧹', desc: 'Effective floor cleaners for tiles, marble & granite.' },
  { id: 'toilet-cleaner', label: 'Bathroom Care',  icon: '🚿', desc: 'Deep-clean your bathroom with our germ-kill formulas.' },
  { id: 'dish-wash',      label: 'Kitchen Care',   icon: '🍽️', desc: 'Cut through grease and keep dishes sparkling clean.' },
  { id: 'glass-cleaner',  label: 'Surface Care',   icon: '🪟', desc: 'Streak-free shine for glass, mirrors and all surfaces.' },
];
