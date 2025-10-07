import app from './app';
import { connectDB } from './config/database';
import { config } from './config/env';
import { supabase } from './config/supabase';

const startServer = async () => {
  try {
    await connectDB();

    // Initialize Supabase storage buckets
    try {
      await supabase.ensureBucketsExist();
      console.log('☁️ Supabase storage buckets initialized');
    } catch (error) {
      console.warn('⚠️ Warning: Could not initialize Supabase buckets:', error instanceof Error ? error.message : 'Unknown error');
      console.warn('   Storage functionality may not work properly');
    }

    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`📚 API Documentation: http://localhost:${config.PORT}/api-docs`);
      console.log(`💚 Health check: http://localhost:${config.PORT}/health`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();