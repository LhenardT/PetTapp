export type StorageBucket = 'pet-images' | 'business-images' | 'user-profiles' | 'documents' | 'service-images';

export type FileCategory = 'profile' | 'additional' | 'logo' | 'gallery' | 'document' | 'service-image';

export interface StorageConfig {
  bucket: StorageBucket;
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowTransforms: boolean;
}

export interface StorageUploadOptions {
  bucket: StorageBucket;
  folder: string;
  fileName: string;
  upsert?: boolean;
  metadata?: Record<string, string>;
}

export interface StorageUploadResult {
  success: boolean;
  url: string;
  path: string;
  size: number;
  error?: string;
}

export interface StorageDeleteOptions {
  bucket: StorageBucket;
  paths: string[];
}

export interface StorageDeleteResult {
  success: boolean;
  deletedPaths: string[];
  errors: Array<{
    path: string;
    error: string;
  }>;
}

export interface TransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  resize?: 'cover' | 'contain' | 'fill';
}

export interface StorageUrlOptions {
  bucket: StorageBucket;
  path: string;
  transform?: TransformOptions;
  expiresIn?: number;
}

export interface StorageMetadata {
  bucket: StorageBucket;
  path: string;
  size: number;
  mimetype: string;
  lastModified: Date;
  metadata?: Record<string, string>;
}

export interface StorageFileInfo {
  name: string;
  id: string;
  updated_at: Date;
  created_at: Date;
  last_accessed_at?: Date;
  metadata?: {
    size?: number;
    mimetype?: string;
    [key: string]: any;
  };
}

export interface StorageListOptions {
  bucket: StorageBucket;
  prefix?: string;
  limit?: number;
  offset?: number;
}