import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';
import { StorageBucket } from '../types/storage.types';

export class SupabaseConfig {
  private static instance: SupabaseConfig;
  private readonly client: SupabaseClient;
  private readonly serviceClient: SupabaseClient;

  private constructor() {
    // Client for general operations (uses anon key)
    this.client = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    });

    // Service client for admin operations (uses service key)
    this.serviceClient = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false,
      },
    });
  }

  public static getInstance(): SupabaseConfig {
    if (!SupabaseConfig.instance) {
      SupabaseConfig.instance = new SupabaseConfig();
    }
    return SupabaseConfig.instance;
  }

  public getClient(): SupabaseClient {
    return this.client;
  }

  public getServiceClient(): SupabaseClient {
    return this.serviceClient;
  }

  public getStorageClient() {
    return this.serviceClient.storage;
  }

  public async ensureBucketsExist(): Promise<void> {
    const buckets: StorageBucket[] = ['pet-images', 'business-images', 'user-profiles', 'documents', 'service-images'];

    try {
      const { data: existingBuckets } = await this.serviceClient.storage.listBuckets();
      const existingBucketNames = existingBuckets?.map(bucket => bucket.name) || [];

      for (const bucketName of buckets) {
        if (!existingBucketNames.includes(bucketName)) {
          const { error } = await this.serviceClient.storage.createBucket(bucketName, {
            public: false,
            allowedMimeTypes: this.getAllowedMimeTypesForBucket(bucketName),
            fileSizeLimit: this.getFileSizeLimitForBucket(bucketName),
          });

          if (error) {
            console.error(`Failed to create bucket ${bucketName}:`, error);
            throw new Error(`Failed to create storage bucket: ${bucketName}`);
          } else {
            console.log(`✅ Created storage bucket: ${bucketName}`);
          }
        }
      }
    } catch (error) {
      console.error('Error ensuring buckets exist:', error);
      throw error;
    }
  }

  private getAllowedMimeTypesForBucket(bucket: StorageBucket): string[] {
    switch (bucket) {
      case 'pet-images':
      case 'business-images':
      case 'user-profiles':
      case 'service-images':
        return ['image/jpeg', 'image/png', 'image/webp'];
      case 'documents':
        return [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ];
      default:
        return ['*/*'];
    }
  }

  private getFileSizeLimitForBucket(bucket: StorageBucket): number {
    switch (bucket) {
      case 'pet-images':
        return 5 * 1024 * 1024; // 5MB
      case 'business-images':
        return 10 * 1024 * 1024; // 10MB
      case 'service-images':
        return 5 * 1024 * 1024; // 5MB
      case 'user-profiles':
        return 2 * 1024 * 1024; // 2MB
      case 'documents':
        return 20 * 1024 * 1024; // 20MB
      default:
        return 5 * 1024 * 1024; // 5MB default
    }
  }
}

// Export singleton instance
export const supabase = SupabaseConfig.getInstance();