import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

dotenv.config(); // .env'deki MONGO_URI'yi yükle

import Seller from '../src/models/sellerModel.js';
import Product from '../src/models/productModel.js';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB bağlandı.');

  // Daha önce çalıştırıldıysa eski test verisini temizle
  await Seller.deleteMany({ email: 'test@savora.com' });
  await Product.deleteMany({ name: { $in: ['Adana Kebap', 'Mercimek Çorbası', 'Baklava'] } });

  // 1) Test satıcısı oluştur
  const hashedPassword = await bcrypt.hash('test1234', 10);
  const seller = await Seller.create({
    taxNumber: '1234567890',
    restaurantName: 'Savora Test Restoran',
    phone: '05001234567',
    email: 'test@savora.com',
    password: hashedPassword,
  });
  console.log(`Satıcı oluşturuldu: ${seller.restaurantName} (id: ${seller._id})`);

  // 2) Bu satıcıya bağlı ürünleri oluştur
  const products = await Product.insertMany([
    {
      sellerId: seller._id,
      name: 'Adana Kebap',
      category: 'Ana Yemek',
      price: 180,
      description: 'Özel baharatlı kıyma, közde pişirilmiş. Yanında lavaş ve salata.',
    },
    {
      sellerId: seller._id,
      name: 'Mercimek Çorbası',
      category: 'Çorba',
      price: 65,
      description: 'Günlük taze kırmızı mercimek çorbası. Limon ve pul biberle servis edilir.',
    },
    {
      sellerId: seller._id,
      name: 'Baklava',
      category: 'Tatlı',
      price: 95,
      description: 'El açması yufka, antep fıstığı, saf tereyağı. 3 dilim.',
    },
  ]);

  console.log(`${products.length} ürün eklendi:`);
  products.forEach(p => console.log(`  - ${p.name} (${p.price} ₺)`));

  await mongoose.disconnect();
  console.log('Bitti.');
}

seed().catch(err => {
  console.error('Seed hatası:', err.message);
  process.exit(1);
});
