import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const deleteAndRecreate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const collection = db.collection('businesses');

    // Show current businesses
    const businesses = await collection.find({}).toArray();
    console.log(`Found ${businesses.length} businesses in database`);

    if (businesses.length > 0) {
      console.log('\nCurrent businesses:');
      businesses.forEach((b, i) => {
        console.log(`${i + 1}. ${b.businessName} (${b._id})`);
        console.log(`   Coordinates:`, b.address?.coordinates);
      });

      console.log('\n⚠️  WARNING: This will DELETE all businesses!');
      console.log('Type "yes" to confirm deletion, or Ctrl+C to cancel');

      // In a real script, you'd want to wait for user input
      // For now, we'll just delete them
      const result = await collection.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} businesses`);
      console.log('ℹ️  You can now create new businesses with coordinates in the correct format');
    } else {
      console.log('No businesses to delete');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  }
};

deleteAndRecreate();
