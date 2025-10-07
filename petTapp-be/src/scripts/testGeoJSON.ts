import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testGeoJSON = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const collection = db.collection('businesses');

    console.log('\n=== TESTING GEOJSON FORMAT ===');
    try {
      const testDoc = {
        ownerId: 'test123',
        businessName: 'Test GeoJSON Business',
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
            type: 'Point',
            coordinates: [120.9842, 14.5995] // [longitude, latitude] - Manila
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
      console.log('✅ Insert successful with GeoJSON format!');
      console.log('Inserted ID:', result.insertedId);

      // Verify the document
      const inserted = await collection.findOne({ _id: result.insertedId });
      console.log('\nInserted document coordinates:');
      console.log(JSON.stringify(inserted?.address.coordinates, null, 2));

      // Clean up
      await collection.deleteOne({ _id: result.insertedId });
      console.log('\n✅ Test document cleaned up');
    } catch (error: any) {
      console.error('❌ Insert failed:', error.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testGeoJSON();
