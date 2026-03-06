require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const testUser = async () => {
  try {
    // Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully\n');

    // Delete test user if exists
    await User.deleteOne({ email: 'test@example.com' });
    console.log('2️⃣ Cleaned up old test user\n');

    // Create new user
    console.log('3️⃣ Creating new user...');
    const user = new User({
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'test@example.com',
      password: 'password123',
      currentGrade: 'Class 12',
      examType: 'JEE'
    });

    await user.save();
    console.log('✅ User saved');
    console.log('   ID:', user._id);
    console.log('   Name:', user.firstName, user.lastName);
    console.log('   Email:', user.email);
    console.log('   Password is hashed (not showing)\n');

    // Test password comparison
    console.log('4️⃣ Testing password...');
    const isMatch = await user.comparePassword('password123');
    console.log('   Correct password matches:', isMatch ? '✅ YES' : '❌ NO');
    
    const wrongMatch = await user.comparePassword('wrongpassword');
    console.log('   Wrong password matches:', wrongMatch ? '❌ Should be false' : '✅ Correctly false\n');

    // Find user without password
    console.log('5️⃣ Finding user (password hidden)...');
    const foundUser = await User.findOne({ email: 'test@example.com' });
    console.log('   User found:', foundUser ? '✅' : '❌');
    console.log('   Password in result:', foundUser.password ? '❌ Should be hidden' : '✅ Hidden correctly\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('6️⃣ Disconnected from MongoDB');
  }
};

testUser();