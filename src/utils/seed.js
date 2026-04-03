require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const FinancialRecord = require('../models/FinancialRecord');
const connectDB = require('../config/db');

const users = [
  { name: 'Admin User',   email: 'admin@finance.com',   password: 'admin123',   role: 'admin'   },
  { name: 'Analyst User', email: 'analyst@finance.com', password: 'analyst123', role: 'analyst' },
  { name: 'Viewer User',  email: 'viewer@finance.com',  password: 'viewer123',  role: 'viewer'  },
];

const generateRecords = (adminId) => {
  const now = new Date();
  const records = [];

  for (let i = 0; i < 40; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 3);
    const isIncome = i % 3 === 0;

    records.push({
      amount: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
      type: isIncome ? 'income' : 'expense',
      category: isIncome
        ? ['salary', 'freelance', 'investment'][i % 3]
        : ['food', 'transport', 'utilities', 'rent', 'entertainment'][i % 5],
      date,
      notes: `Seeded record #${i + 1}`,
      createdBy: adminId,
    });
  }
  return records;
};

const seed = async () => {
  await connectDB();
  console.log('Seeding database...');

  await User.deleteMany({});
  await FinancialRecord.deleteMany({});

  const createdUsers = await User.create(users);
  const admin = createdUsers.find((u) => u.role === 'admin');

  await FinancialRecord.insertMany(generateRecords(admin._id));

  console.log('\n✅ Seed complete!\n');
  console.log('Test accounts:');
  users.forEach((u) => console.log(`  ${u.role.padEnd(8)} → ${u.email}  /  ${u.password}`));
  console.log('');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
