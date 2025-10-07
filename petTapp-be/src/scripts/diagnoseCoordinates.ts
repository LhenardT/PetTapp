import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const diagnose = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const collection = db.collection('businesses');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('\n=== ALL INDEXES ===');
    console.log(JSON.stringify(indexes, null, 2));

    // Check if any documents exist
    const count = await collection.countDocuments({});
    console.log(`\n=== DOCUMENT COUNT: ${count} ===`);

    // Try to insert a test document with coordinates
    console.log('\n=== ATTEMPTING TEST INSERT ===');
    try {
      const testDoc = {
        ownerId: 'test123',
        businessName: 'Test Business',
        businessType: 'veterinary',
        contactInfo: {
          email: 'test@test.com',
          phone: '1234567890'
        },
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Philippines',
          coordinates: {
            latitude: 14.5995,
            longitude: 120.9842
          }
        },
        businessHours: {
          monday: { open: '09:00', close: '17:00', isOpen: true },
          tuesday: { open: '09:00', close: '17:00', isOpen: true },
          wednesday: { open: '09:00', close: '17:00', isOpen: true },
          thursday: { open: '09:00', close: '17:00', isOpen: true },
          friday: { open: '09:00', close: '17:00', isOpen: true },
          saturday: { open: '09:00', close: '17:00', isOpen: true },
          sunday: { open: '09:00', close: '17:00', isOpen: false }
        },
        credentials: {
          certifications: []
        },
        ratings: {
          averageRating: 0,
          totalReviews: 0
        },
        isVerified: false,
        isActive: true
      };

      const result = await collection.insertOne(testDoc);
      console.log('✅ Insert successful!');
      console.log('Inserted ID:', result.insertedId);

      // Clean up test document
      await collection.deleteOne({ _id: result.insertedId });
      console.log('✅ Test document cleaned up');
    } catch (error: any) {
      console.error('❌ Insert failed:', error.message);
      console.error('Error code:', error.code);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    process.exit(1);
  }
};

diagnose();
