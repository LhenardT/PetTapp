import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const recreateIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const collection = db.collection('businesses');

    console.log('\n=== DROPPING OLD 2DSPHERE INDEX ===');
    try {
      await collection.dropIndex('address.coordinates_2dsphere');
      console.log('✅ Dropped old index');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️  Index does not exist, skipping drop');
      } else {
        console.log('⚠️  Error dropping index:', error.message);
      }
    }

    console.log('\n=== CREATING SPARSE 2DSPHERE INDEX ===');
    await collection.createIndex(
      { 'address.coordinates': '2dsphere' },
      { sparse: true, background: true }
    );
    console.log('✅ Created sparse 2dsphere index');

    console.log('\n=== CURRENT INDEXES ===');
    const indexes = await collection.indexes();
    const geoIndex = indexes.find(idx => idx.name === 'address.coordinates_2dsphere');
    console.log('2dsphere index:', JSON.stringify(geoIndex, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

recreateIndex();
