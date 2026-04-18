const products = [
  {
    name: 'Floor Cleaner',
    slug: 'floor-cleaner',
    description: 'Powerful floor cleaner that removes tough stains and kills 99.9% germs. Leaves a fresh fragrance and keeps your floors sparkling clean.',
    category: 'floor-cleaner',
    price: 99,
    originalPrice: 120,
    discount: 17,
    quantity: '1 litre',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Various_cleaning_products.jpg/640px-Various_cleaning_products.jpg',
    features: ['Kills 99.9% germs', 'Fresh fragrance', 'Safe for all floor types', 'Eco-friendly formula'],
    usage: 'Dilute 30ml in 1 half bucket of water. Mop floors. No rinsing needed.',
    isFeatured: true,
    isRefill: false,
    subscriptionAvailable: true,
    variants: [
      { variantId: 'v-fc-1L-bottle', size: '1 Litre', type: 'Bottle', fragrance: 'Lemon', price: 99, originalPrice: 120, stockQuantity: 50 },
      { variantId: 'v-fc-500ml-bottle', size: '500 ml', type: 'Bottle', fragrance: 'Lemon', price: 55, originalPrice: 65, stockQuantity: 20 },
      { variantId: 'v-fc-1L-refill', size: '1 Litre', type: 'Eco Refill', fragrance: 'Lemon', price: 79, originalPrice: 99, stockQuantity: 100 },
    ]
  },
  {
    name: 'Toilet Cleaner',
    slug: 'toilet-cleaner',
    description: 'Powerful toilet cleaner with thick gel formula that clings to bowl surfaces to eliminate stains, odors, and harmful bacteria.',
    category: 'toilet-cleaner',
    price: 99,
    originalPrice: 120,
    discount: 17,
    quantity: '1 litre',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Cleaning_products.jpg/800px-Cleaning_products.jpg',
    features: ['Thick gel formula', 'Eliminates odors', 'Kills harmful bacteria', 'Easy squeeze bottle'],
    usage: 'Apply under rim. Leave for 10 minutes. Scrub and flush.',
    isFeatured: true,
    isRefill: false,
    subscriptionAvailable: true,
    variants: [
      { variantId: 'v-tc-1L-bottle', size: '1 Litre', type: 'Bottle', price: 99, originalPrice: 120, stockQuantity: 40 },
      { variantId: 'v-tc-500ml-bottle', size: '500 ml', type: 'Bottle', price: 55, originalPrice: 65, stockQuantity: 30 }
    ]
  },
  {
    name: 'Dish Wash Liquid',
    slug: 'dish-wash',
    description: 'Gentle yet effective dishwash liquid that cuts through grease and leaves your dishes sparkling clean with a fresh lemon scent.',
    category: 'dish-wash',
    price: 79,
    originalPrice: 99,
    discount: 20,
    quantity: '750 ml',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Dishwashing_liquid_bottle.jpg/480px-Dishwashing_liquid_bottle.jpg',
    features: ['Cuts tough grease', 'Lemon fresh scent', 'Gentle on hands', 'High foam formula'],
    usage: 'Apply a few drops on wet sponge. Scrub dishes and rinse well.',
    isFeatured: true,
    isRefill: false,
    subscriptionAvailable: true,
    variants: [
      { variantId: 'v-dw-750ml-bottle', size: '750 ml', type: 'Bottle', price: 79, originalPrice: 99, stockQuantity: 80 },
      { variantId: 'v-dw-1L-refill', size: '1 Litre', type: 'Eco Refill', price: 89, originalPrice: 110, stockQuantity: 120 }
    ]
  },
  {
    name: 'Detergent Liquid',
    slug: 'detergent-liquid',
    description: 'Advanced liquid detergent that deep cleans clothes, removes tough stains, and keeps fabrics soft and bright.',
    category: 'detergent',
    price: 99,
    originalPrice: 130,
    discount: 24,
    quantity: '1 litre',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Laundry_detergent.jpg/640px-Laundry_detergent.jpg',
    features: ['Deep cleans fabrics', 'Removes tough stains', 'Suitable for all washing machines', 'Fabric care formula'],
    usage: 'For machine wash: Add 30ml per load. For hand wash: Add 10ml to bucket of water.',
    isFeatured: false,
    isRefill: false,
    subscriptionAvailable: true,
    variants: [
      { variantId: 'v-det-1L-bottle', size: '1 Litre', type: 'Bottle', price: 99, originalPrice: 130, stockQuantity: 60 },
      { variantId: 'v-det-1L-refill', size: '1 Litre', type: 'Eco Refill', price: 85, originalPrice: 110, stockQuantity: 90 },
      { variantId: 'v-det-5L-can', size: '5 Litres', type: 'Canister', price: 450, originalPrice: 600, stockQuantity: 15 }
    ]
  },
  {
    name: 'Bathroom Cleaning Kit',
    slug: 'bathroom-cleaning-kit',
    description: 'Perfect bundle for a spotless bathroom. Includes Toilet cleaner, Tiles cleaner, and a free scrub brush.',
    category: 'combo',
    price: 180,
    originalPrice: 240,
    discount: 25,
    quantity: '2 products',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Various_cleaning_products.jpg/640px-Various_cleaning_products.jpg',
    features: ['Complete bathroom care', 'Kills germs', 'Removes hard stains'],
    usage: 'Use products individually as needed.',
    comboItems: ['Toilet Cleaner 1lt', 'Tiles Cleaner 1lt'],
    isCombo: true,
    isFeatured: true,
    isRefill: false,
    subscriptionAvailable: true,
    variants: [
      { variantId: 'v-cb-bath-standard', size: 'Bundle', type: 'Standard Kit', price: 180, originalPrice: 240, stockQuantity: 25 }
    ]
  },
  {
    name: 'Complete Home Cleaning Combo',
    slug: 'complete-home-cleaning-combo',
    description: 'Complete home cleaning solution! Get all essential cleaners at one unbeatable price. Perfect for a full home deep clean.',
    category: 'combo',
    price: 550,
    originalPrice: 889,
    discount: 38,
    quantity: '6 products',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Various_cleaning_products.jpg/640px-Various_cleaning_products.jpg',
    features: [
      'Includes 6 full-size products',
      'Floor Cleaner 1lt',
      'Toilet Cleaner 1lt',
      'Dish Wash 750ml',
      'Detergent 1lt × 2',
      'Tiles Cleaner 1lt',
      'Save ₹339 instantly',
    ],
    usage: 'A complete home care package.',
    comboItems: ['Floor Cleaner 1lt', 'Toilet Cleaner 1lt', 'Dish Wash 750ml', 'Detergent 1lt', 'Detergent 1lt', 'Tiles Cleaner 1lt'],
    isCombo: true,
    isFeatured: true,
    isRefill: false,
    subscriptionAvailable: true,
    variants: [
      { variantId: 'v-cb-home-full', size: 'Bundle', type: 'Big Combo', price: 550, originalPrice: 889, stockQuantity: 18 }
    ]
  }
];

module.exports = products;
