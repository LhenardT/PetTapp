import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropGeoIndex = async () => {
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
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Drop the geospatial index if it exists
    try {
      await collection.dropIndex('address.coordinates_2dsphere');
      console.log('✅ Successfully dropped address.coordinates_2dsphere index');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️  Index address.coordinates_2dsphere does not exist');
      } else {
        throw error;
      }
    }

    // Get indexes after drop
    const indexesAfter = await collection.indexes();
    console.log('Indexes after drop:', JSON.stringify(indexesAfter, null, 2));

    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

dropGeoIndex();
