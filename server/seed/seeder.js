const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const ReturnRequest = require('../models/ReturnRequest');
const connectDB = require('../config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing existing data...');
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();
    await ReturnRequest.deleteMany();

    console.log('[Seeder] Creating test users...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const staffPassword = await bcrypt.hash('Staff@123', salt);
    const customerPassword = await bcrypt.hash('Customer@123', salt);

    const adminUser = await User.create({
      name: 'D-Mart Admin',
      email: 'admin@dmart.com',
      password: adminPassword,
      role: 'admin'
    });

    const staffUser = await User.create({
      name: 'Store Manager (Staff)',
      email: 'staff@dmart.com',
      password: staffPassword,
      role: 'staff'
    });

    const customerUser = await User.create({
      name: 'John Customer',
      email: 'customer@dmart.com',
      password: customerPassword,
      role: 'customer'
    });

    console.log('[Seeder] Creating categories...');
    const categoriesData = [
      { name: 'Dairy & Bakery' },
      { name: 'Fresh Produce' },
      { name: 'Beverages' },
      { name: 'Snacks & Munchies' },
      { name: 'Staples & Grains' },
      { name: 'Personal Care' }
    ];

    const categories = await Category.insertMany(categoriesData);
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    console.log('[Seeder] Creating realistic products...');
    const productsData = [
      {
        name: 'Fresh Cow Milk (1L)',
        categoryId: categoryMap['Dairy & Bakery'],
        price: 66.0,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500',
        description: 'Pasteurized whole milk rich in calcium and protein.'
      },
      {
        name: 'Amul Butter (500g)',
        categoryId: categoryMap['Dairy & Bakery'],
        price: 275.0,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500',
        description: 'Delicious salted butter made from pure milk fat.'
      },
      {
        name: 'Whole Wheat Bread (400g)',
        categoryId: categoryMap['Dairy & Bakery'],
        price: 45.0,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
        description: 'Freshly baked 100% whole wheat fiber loaf.'
      },
      {
        name: 'Organic Red Apples (1kg)',
        categoryId: categoryMap['Fresh Produce'],
        price: 180.0,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500',
        description: 'Crisp and sweet farm-fresh red apples.'
      },
      {
        name: 'Fresh Cavendish Bananas (1kg)',
        categoryId: categoryMap['Fresh Produce'],
        price: 55.0,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500',
        description: 'Naturally ripened, energy-dense bananas.'
      },
      {
        name: 'Farm Tomatoes (1kg)',
        categoryId: categoryMap['Fresh Produce'],
        price: 35.0,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500',
        description: 'Juicy, ripe red tomatoes perfect for gravies and salads.'
      },
      {
        name: 'Tropicana Orange Juice (1L)',
        categoryId: categoryMap['Beverages'],
        price: 115.0,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500',
        description: '100% real fruit orange juice loaded with Vitamin C.'
      },
      {
        name: 'Green Tea (100 Bags)',
        categoryId: categoryMap['Beverages'],
        price: 240.0,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500',
        description: 'Antioxidant-rich organic green tea bags for daily wellness.'
      },
      {
        name: 'Lays Magic Masala Chips (90g)',
        categoryId: categoryMap['Snacks & Munchies'],
        price: 30.0,
        stock: 100,
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500',
        description: 'Crispy potato chips seasoned with authentic Indian spices.'
      },
      {
        name: 'Roasted Salted Cashews (250g)',
        categoryId: categoryMap['Snacks & Munchies'],
        price: 320.0,
        stock: 18,
        image: 'https://images.unsplash.com/photo-1536591375315-1989d5203362?w=500',
        description: 'Premium grade crunchy roasted cashews with sea salt.'
      },
      {
        name: 'Basmati Rice (5kg)',
        categoryId: categoryMap['Staples & Grains'],
        price: 499.0,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
        description: 'Long-grain aromatic royal basmati rice.'
      },
      {
        name: 'Fortune Sunlite Sunflower Oil (1L)',
        categoryId: categoryMap['Staples & Grains'],
        price: 145.0,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
        description: 'Refined sunflower oil enriched with Vitamins A & D.'
      },
      {
        name: 'Dove Moisture Body Wash (250ml)',
        categoryId: categoryMap['Personal Care'],
        price: 195.0,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
        description: 'Nourishing body wash for soft, smooth skin.'
      }
    ];

    const products = await Product.insertMany(productsData);

    console.log('[Seeder] Creating sample order & cart...');
    // Seed a sample placed order for testing staff actions
    await Order.create({
      userId: customerUser._id,
      items: [
        {
          productId: products[0]._id,
          name: products[0].name,
          price: products[0].price,
          quantity: 2
        },
        {
          productId: products[3]._id,
          name: products[3].name,
          price: products[3].price,
          quantity: 1
        }
      ],
      subtotal: products[0].price * 2 + products[3].price * 1,
      total: products[0].price * 2 + products[3].price * 1,
      deliveryType: 'home_delivery',
      address: '123 Grocery Lane, Apartment 4B, Metro City',
      status: 'PLACED'
    });

    console.log('✅ [Seeder] Database seeded successfully!');
    console.log('--------------------------------------------------');
    console.log('Test Credentials:');
    console.log('  Admin:    admin@dmart.com    / Admin@123');
    console.log('  Staff:    staff@dmart.com    / Staff@123');
    console.log('  Customer: customer@dmart.com / Customer@123');
    console.log('--------------------------------------------------');

    if (process.argv[2] === '--standalone') {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ [Seeder Error]', error);
    if (process.argv[2] === '--standalone') {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
