require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

const categories = [
  { name: { fr: 'Électronique', ar: 'إلكترونيات', en: 'Electronics' }, slug: 'electronics', icon: '📱', description: { fr: 'Smartphones, laptops, accessoires', ar: 'هواتف ذكية، حاسوب، ملحقات', en: 'Smartphones, laptops, accessories' } },
  { name: { fr: 'Mode & Vêtements', ar: 'الموضة والملابس', en: 'Fashion & Clothing' }, slug: 'fashion', icon: '👗', description: { fr: 'Vêtements, chaussures, accessoires de mode', ar: 'ملابس، أحذية، إكسسوارات الموضة', en: 'Clothes, shoes, fashion accessories' } },
  { name: { fr: 'Maison & Déco', ar: 'المنزل والديكور', en: 'Home & Decor' }, slug: 'home-decor', icon: '🏠', description: { fr: 'Meubles, décoration, cuisine', ar: 'أثاث، ديكور، مطبخ', en: 'Furniture, decoration, kitchen' } },
  { name: { fr: 'Sports & Fitness', ar: 'الرياضة واللياقة', en: 'Sports & Fitness' }, slug: 'sports', icon: '⚽', description: { fr: 'Équipements sportifs, fitness', ar: 'معدات رياضية، لياقة بدنية', en: 'Sports equipment, fitness' } },
  { name: { fr: 'Beauté & Santé', ar: 'الجمال والصحة', en: 'Beauty & Health' }, slug: 'beauty', icon: '💄', description: { fr: 'Cosmétiques, soins, santé', ar: 'مستحضرات، عناية، صحة', en: 'Cosmetics, care, health' } },
  { name: { fr: 'Alimentation', ar: 'المواد الغذائية', en: 'Food & Grocery' }, slug: 'food', icon: '🛒', description: { fr: 'Produits alimentaires, épicerie', ar: 'منتجات غذائية، بقالة', en: 'Food products, grocery' } },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@ourstore.dz' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@ourstore.dz',
        password: 'admin123456',
        role: 'admin',
      });
      console.log('✅ Admin created: admin@ourstore.dz / admin123456');
    }

    // Create categories
    await Category.deleteMany({});
    const createdCats = await Category.insertMany(categories.map((c, i) => ({ ...c, order: i })));
    console.log(`✅ ${createdCats.length} categories created`);

    // Create sample products
    await Product.deleteMany({});
    const sampleProducts = [
      {
        name: { fr: 'Smartphone ProMax X', ar: 'هاتف بروماكس إكس', en: 'ProMax X Smartphone' },
        description: { fr: 'Dernier smartphone avec écran AMOLED 6.7"', ar: 'أحدث هاتف ذكي بشاشة AMOLED 6.7"', en: 'Latest smartphone with 6.7" AMOLED screen' },
        price: 89000, comparePrice: 99000,
        category: createdCats[0]._id,
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
        stock: 50, isFeatured: true,
        tags: ['smartphone', 'mobile', 'téléphone'],
      },
      {
        name: { fr: 'Sneakers Urban Run', ar: 'حذاء أوربان رن الرياضي', en: 'Urban Run Sneakers' },
        description: { fr: 'Sneakers légères et confortables pour la ville', ar: 'أحذية رياضية خفيفة ومريحة للمدينة', en: 'Lightweight and comfortable city sneakers' },
        price: 8500, comparePrice: 12000,
        category: createdCats[1]._id,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
        stock: 30, isFeatured: true, rating: 4.5, numReviews: 12,
        tags: ['chaussures', 'sneakers', 'sport'],
      },
      {
        name: { fr: 'Canapé Scandinave', ar: 'أريكة إسكندنافية', en: 'Scandinavian Sofa' },
        description: { fr: 'Canapé 3 places design nordique en tissu gris', ar: 'أريكة 3 مقاعد بتصميم نوردي بقماش رمادي', en: '3-seat Nordic design sofa in grey fabric' },
        price: 45000,
        category: createdCats[2]._id,
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
        stock: 10, isFeatured: true,
        tags: ['canapé', 'salon', 'meuble'],
      },
      {
        name: { fr: 'Écouteurs Bluetooth Pro', ar: 'سماعات بلوتوث برو', en: 'Pro Bluetooth Earbuds' },
        description: { fr: 'Écouteurs sans fil avec réduction de bruit active', ar: 'سماعات لاسلكية مع إلغاء الضوضاء النشط', en: 'Wireless earbuds with active noise cancellation' },
        price: 12000, comparePrice: 15000,
        category: createdCats[0]._id,
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'],
        stock: 80, isFeatured: true, rating: 4.8, numReviews: 34,
        tags: ['écouteurs', 'bluetooth', 'audio'],
      },
      {
        name: { fr: 'Haltère 10kg Set', ar: 'طقم دمبيل 10 كجم', en: '10kg Dumbbell Set' },
        description: { fr: 'Ensemble de 2 haltères hexagonaux 10kg', ar: 'مجموعة من اثنين من الدمابل السداسية 10 كجم', en: 'Set of 2 hexagonal dumbbells 10kg' },
        price: 3500,
        category: createdCats[3]._id,
        images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'],
        stock: 25,
        tags: ['fitness', 'haltère', 'musculation'],
      },
      {
        name: { fr: 'Crème Hydratante Premium', ar: 'كريم مرطب ممتاز', en: 'Premium Moisturizing Cream' },
        description: { fr: 'Crème hydratante naturelle à l\'argan et aloe vera', ar: 'كريم مرطب طبيعي بزيت الأركان والصبار', en: 'Natural moisturizing cream with argan and aloe vera' },
        price: 1800, comparePrice: 2500,
        category: createdCats[4]._id,
        images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'],
        stock: 100, rating: 4.6, numReviews: 20,
        tags: ['crème', 'beauté', 'soin'],
      },
    ];

    await Product.insertMany(sampleProducts);
    console.log(`✅ ${sampleProducts.length} sample products created`);
    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
