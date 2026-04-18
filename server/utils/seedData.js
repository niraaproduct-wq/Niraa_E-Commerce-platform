const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const path     = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Product = require('../models/Product');
const User    = require('../models/User');

const products = [
  {
    name: 'Floor Cleaner (Bottle)',
    slug: 'floor-cleaner-1lt',
    description: 'Powerful floor cleaner that removes tough stains and kills 99.9% germs. Leaves a fresh fragrance and keeps your floors sparkling clean.',
    category: 'floor-cleaner',
    price: 99,
    originalPrice: 120,
    discount: 17,
    quantity: '1 litre',
    features: ['Kills 99.9% germs', 'Fresh fragrance', 'Safe for all floor types', 'Eco-friendly formula'],
    usage: 'Dilute 30ml in 1 half bucket of water. Mop floors. No rinsing needed.',
    isFeatured: true,
    isRefill: false,
    subscriptionAvailable: true,
  },
  {
    name: 'Floor Cleaner (Eco Refill Pack)',
    slug: 'floor-cleaner-1lt-refill',
    description: 'Eco-friendly refill pack. Save money and reduce plastic waste. Same powerful formula.',
    category: 'floor-cleaner',
    price: 79,
    originalPrice: 99,
    discount: 20,
    quantity: '1 litre',
    features: ['80% less plastic', 'Fresh fragrance', 'Safe for all floor types', 'Eco-friendly formula'],
    usage: 'Pour into your existing Niraa bottle. Dilute 30ml in half bucket of water.',
    isFeatured: true,
    isRefill: true,
    subscriptionAvailable: true,
  },
  {
    name: 'Toilet Cleaner (Bottle)',
    slug: 'toilet-cleaner-1lt',
    description: 'Powerful toilet cleaner with thick gel formula that clings to bowl surfaces to eliminate stains, odors, and harmful bacteria.',
    category: 'toilet-cleaner',
    price: 99,
    originalPrice: 120,
    discount: 17,
    quantity: '1 litre',
    features: ['Thick gel formula', 'Eliminates odors', 'Kills harmful bacteria', 'Easy squeeze bottle'],
    usage: 'Apply under rim. Leave for 10 minutes. Scrub and flush.',
    isFeatured: true,
    isRefill: false,
    subscriptionAvailable: true,
  },
  {
    name: 'Dish Wash Liquid (Bottle)',
    slug: 'dish-wash-750ml',
    description: 'Gentle yet effective dishwash liquid that cuts through grease and leaves your dishes sparkling clean with a fresh lemon scent.',
    category: 'dish-wash',
    price: 79,
    originalPrice: 99,
    discount: 20,
    quantity: '750 ml',
    features: ['Cuts tough grease', 'Lemon fresh scent', 'Gentle on hands', 'High foam formula'],
    usage: 'Apply a few drops on wet sponge. Scrub dishes and rinse well.',
    isFeatured: true,
    isRefill: false,
    subscriptionAvailable: true,
  },
  {
    name: 'Detergent Liquid (Bottle)',
    slug: 'detergent-liquid-1lt',
    description: 'Advanced liquid detergent that deep cleans clothes, removes tough stains, and keeps fabrics soft and bright.',
    category: 'detergent',
    price: 99,
    originalPrice: 130,
    discount: 24,
    quantity: '1 litre',
    features: ['Deep cleans fabrics', 'Removes tough stains', 'Suitable for all washing machines', 'Fabric care formula'],
    usage: 'For machine wash: Add 30ml per load. For hand wash: Add 10ml to bucket of water.',
    isFeatured: false,
    isRefill: false,
    subscriptionAvailable: true,
  },
  {
    name: 'Detergent Liquid (Eco Refill Pack)',
    slug: 'detergent-liquid-1lt-refill',
    description: 'Eco-friendly detergent refill. Save plastic, get the same deep clean.',
    category: 'detergent',
    price: 85,
    originalPrice: 110,
    discount: 22,
    quantity: '1 litre',
    features: ['80% less plastic', 'Removes tough stains', 'Eco packaging'],
    usage: 'Pour into your empty detergent bottle. Use 30ml per machine load.',
    isFeatured: false,
    isRefill: true,
    subscriptionAvailable: true,
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
    features: ['Complete bathroom care', 'Kills germs', 'Removes hard stains'],
    usage: 'Use products individually as needed.',
    comboItems: ['Toilet Cleaner 1lt', 'Tiles Cleaner 1lt'],
    isCombo: true,
    isFeatured: true,
    isRefill: false,
    subscriptionAvailable: true,
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
  },
  {
    name: 'Monthly Refill Subscription Bundle',
    slug: 'monthly-refill-subscription',
    description: 'All your home cleaning refills delivered every month to your door in Dharmapuri. Super eco-friendly!',
    category: 'combo',
    price: 499,
    originalPrice: 700,
    discount: 28,
    quantity: '5 items',
    features: ['Delivered monthly', 'All refill packs', 'Zero hassle'],
    usage: 'Subscribe once, receive monthly!',
    comboItems: ['Floor Cleaner Refill', 'Toilet Cleaner Refill', 'Dish Wash Refill', 'Detergent Refill x2'],
    isCombo: true,
    isFeatured: true,
    isRefill: true,
    subscriptionAvailable: true,
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing
    await Product.deleteMany({});
    await User.deleteMany({});

    // Insert products
    await Product.insertMany(products);
    console.log('✅ Products seeded');

    // Create admin user
    await User.create({
      name: 'NIRAA Admin',
      email: 'admin@niraa.com',
      password: 'niraa@admin123',
      role: 'admin',
    });
    console.log('✅ Admin user created: admin@niraa.com / niraa@admin123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedData();
