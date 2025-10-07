import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../config/supabase';
import { IStorageService } from './IStorageService';
import {
  StorageUploadOptions,
  StorageUploadResult,
  StorageDeleteOptions,
  StorageDeleteResult,
  StorageUrlOptions,
  StorageMetadata,
  StorageBucket,
  StorageFileInfo,
} from '../../types/storage.types';

export class SupabaseStorageService implements IStorageService {
  private readonly storage = supabase.getStorageClient();

  async upload(file: Buffer, options: StorageUploadOptions): Promise<StorageUploadResult> {
    try {
      const filePath = `${options.folder}/${options.fileName}`;

      const { data, error } = await this.storage
        .from(options.bucket)
        .upload(filePath, file, {
          upsert: options.upsert || false,
          metadata: options.metadata,
          contentType: this.detectContentType(options.fileName),
        });

      if (error) {
        return {
          success: false,
          url: '',
          path: filePath,
          size: file.length,
          error: error.message,
        };
      }

      const publicUrl = this.getPublicUrl({
        bucket: options.bucket,
        path: data.path,
      });

      return {
        success: true,
        url: publicUrl,
        path: data.path,
        size: file.length,
      };
    } catch (error) {
      return {
        success: false,
        url: '',
        path: `${options.folder}/${options.fileName}`,
        size: file.length,
        error: error instanceof Error ? error.message : 'Unknown upload error',
      };
    }
  }

  async delete(options: StorageDeleteOptions): Promise<StorageDeleteResult> {
    try {
      const { data, error } = await this.storage
        .from(options.bucket)
        .remove(options.paths);

      if (error) {
        return {
          success: false,
          deletedPaths: [],
          errors: options.paths.map(path => ({
            path,
            error: error.message,
          })),
        };
      }

      return {
        success: true,
        deletedPaths: data?.map(item => item.name) || [],
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        deletedPaths: [],
        errors: options.paths.map(path => ({
          path,
          error: error instanceof Error ? error.message : 'Unknown deletion error',
        })),
      };
    }
  }

  getPublicUrl(options: StorageUrlOptions): string {
    let url = this.storage
      .from(options.bucket)
      .getPublicUrl(options.path).data.publicUrl;

    if (options.transform && this.isImageBucket(options.bucket)) {
      url = this.addTransformParams(url, options.transform);
    }

    return url;
  }

  async getSignedUrl(options: StorageUrlOptions): Promise<string> {
    try {
      const expiresIn = options.expiresIn || 3600; // Default 1 hour

      const { data, error } = await this.storage
        .from(options.bucket)
        .createSignedUrl(options.path, expiresIn);

      if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
      }

      let url = data.signedUrl;

      if (options.transform && this.isImageBucket(options.bucket)) {
        url = this.addTransformParams(url, options.transform);
      }

      return url;
    } catch (error) {
      throw new Error(
        `Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getMetadata(bucket: string, path: string): Promise<StorageMetadata | null> {
    try {
      const { data, error } = await this.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop(),
        });

      if (error || !data || data.length === 0) {
        return null;
      }

      const fileInfo = data[0];

      return {
        bucket: bucket as StorageBucket,
        path,
        size: fileInfo.metadata?.size || 0,
        mimetype: fileInfo.metadata?.mimetype || 'application/octet-stream',
        lastModified: new Date(fileInfo.updated_at || fileInfo.created_at),
        metadata: fileInfo.metadata,
      };
    } catch (error) {
      return null;
    }
  }

  async exists(bucket: string, path: string): Promise<boolean> {
    try {
      const metadata = await this.getMetadata(bucket, path);
      return metadata !== null;
    } catch (error) {
      return false;
    }
  }

  async move(
    sourceBucket: string,
    sourcePath: string,
    destBucket: string,
    destPath: string
  ): Promise<boolean> {
    try {
      const { error } = await this.storage
        .from(sourceBucket)
        .move(sourcePath, `${destBucket}/${destPath}`);

      return !error;
    } catch (error) {
      return false;
    }
  }

  async copy(
    sourceBucket: string,
    sourcePath: string,
    destBucket: string,
    destPath: string
  ): Promise<boolean> {
    try {
      const { error } = await this.storage
        .from(sourceBucket)
        .copy(sourcePath, `${destBucket}/${destPath}`);

      return !error;
    } catch (error) {
      return false;
    }
  }

  private detectContentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  private isImageBucket(bucket: StorageBucket): boolean {
    return ['pet-images', 'business-images', 'user-profiles'].includes(bucket);
  }

  private addTransformParams(url: string, transform: any): string {
    const urlObj = new URL(url);
    const params = new URLSearchParams();

    if (transform.width) params.append('width', transform.width.toString());
    if (transform.height) params.append('height', transform.height.toString());
    if (transform.quality) params.append('quality', transform.quality.toString());
    if (transform.format) params.append('format', transform.format);
    if (transform.resize) params.append('resize', transform.resize);

    if (params.toString()) {
      urlObj.search = params.toString();
    }

    return urlObj.toString();
  }

  public generateFileName(originalName: string, category: string, userId: string): string {
    const extension = originalName.split('.').pop() || '';
    const uuid = uuidv4();
    const timestamp = Date.now();

    return `${category}_${userId}_${timestamp}_${uuid}.${extension}`;
  }

  async listFiles(bucket: StorageBucket, prefix?: string): Promise<StorageFileInfo[]> {
    try {
      const { data, error } = await this.storage
        .from(bucket)
        .list(prefix || '', {
          limit: 1000,
          offset: 0,
        });

      if (error) {
        console.error(`Error listing files in bucket ${bucket}:`, error);
        return [];
      }

      const processedFiles = data
        .filter(file => file.name !== '.emptyFolderPlaceholder') // Filter out folder placeholders
        .map(file => {
          // Supabase returns the file name relative to the prefix when using list()
          // We need to construct the full path for the URL generation
          const fullPath = prefix ? `${prefix}${file.name}` : file.name;

          return {
            name: fullPath,
            id: file.id || file.name,
            updated_at: new Date(file.updated_at || file.created_at || Date.now()),
            created_at: new Date(file.created_at || Date.now()),
            last_accessed_at: file.last_accessed_at ? new Date(file.last_accessed_at) : undefined,
            metadata: file.metadata || { size: 0 },
          };
        });

      return processedFiles;
    } catch (error) {
      console.error(`Failed to list files in bucket ${bucket}:`, error);
      return [];
    }
  }

  public generateFolderPath(userId: string, entityType: string, entityId?: string): string {
    if (entityId) {
      return `${userId}/${entityType}/${entityId}`;
    }
    return `${userId}/${entityType}`;
  }
}