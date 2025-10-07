import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixCoordinates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const collection = db.collection('businesses');

    // Find all businesses with coordinates
    const businesses = await collection.find({
      'address.coordinates': { $exists: true }
    }).toArray();

    console.log(`Found ${businesses.length} businesses with coordinates`);

    // Update each business to remove coordinates temporarily
    for (const business of businesses) {
      console.log(`Updating business: ${business.businessName} (${business._id})`);

      await collection.updateOne(
        { _id: business._id },
        { $unset: { 'address.coordinates': '' } }
      );
    }

    console.log('✅ Successfully removed coordinates from all businesses');
    console.log('ℹ️  You can now use PUT/POST to add coordinates back in the new format');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

fixCoordinates();
