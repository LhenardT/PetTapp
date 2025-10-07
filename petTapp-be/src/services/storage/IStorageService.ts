import {
  StorageUploadOptions,
  StorageUploadResult,
  StorageDeleteOptions,
  StorageDeleteResult,
  StorageUrlOptions,
  StorageMetadata,
  StorageFileInfo,
  StorageBucket,
} from '../../types/storage.types';

export interface IStorageService {
  upload(file: Buffer, options: StorageUploadOptions): Promise<StorageUploadResult>;

  delete(options: StorageDeleteOptions): Promise<StorageDeleteResult>;

  getPublicUrl(options: StorageUrlOptions): string;

  getSignedUrl(options: StorageUrlOptions): Promise<string>;

  getMetadata(bucket: string, path: string): Promise<StorageMetadata | null>;

  exists(bucket: string, path: string): Promise<boolean>;

  move(sourceBucket: string, sourcePath: string, destBucket: string, destPath: string): Promise<boolean>;

  copy(sourceBucket: string, sourcePath: string, destBucket: string, destPath: string): Promise<boolean>;

  listFiles(bucket: StorageBucket, prefix?: string): Promise<StorageFileInfo[]>;
}