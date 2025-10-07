import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { IFileService } from './IFileService';
import { storageService } from '../storage';
import {
  FileValidationOptions,
  FileValidationResult,
  ProcessedFile,
  FileProcessingOptions,
  FileUploadRequest,
  FileUploadResponse,
  FileDeletionRequest,
  FileDeletionResponse,
  FileListRequest,
  FileListResponse,
  FileListItem,
  FILE_CONSTRAINTS,
} from '../../types/file.types';
import { StorageBucket } from '../../types/storage.types';

export class FileService implements IFileService {
  async validateFile(file: ProcessedFile, options: FileValidationOptions): Promise<FileValidationResult> {
    const errors: string[] = [];

    // Check file size
    if (file.size > options.maxSize) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(options.maxSize / 1024 / 1024).toFixed(2)}MB`);
    }

    // Check MIME type
    if (!options.allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`);
    }

    // Check file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!options.allowedExtensions.includes(fileExtension)) {
      errors.push(`File extension ${fileExtension} is not allowed. Allowed extensions: ${options.allowedExtensions.join(', ')}`);
    }

    // For images, check dimensions if required
    let dimensions: { width: number; height: number } | undefined;
    if (options.requireImageDimensions && this.isImageFile(file.mimetype)) {
      try {
        dimensions = await this.getImageDimensions(file.buffer);

        if (options.minWidth && dimensions.width < options.minWidth) {
          errors.push(`Image width ${dimensions.width}px is below minimum required ${options.minWidth}px`);
        }

        if (options.minHeight && dimensions.height < options.minHeight) {
          errors.push(`Image height ${dimensions.height}px is below minimum required ${options.minHeight}px`);
        }

        if (options.maxWidth && dimensions.width > options.maxWidth) {
          errors.push(`Image width ${dimensions.width}px exceeds maximum allowed ${options.maxWidth}px`);
        }

        if (options.maxHeight && dimensions.height > options.maxHeight) {
          errors.push(`Image height ${dimensions.height}px exceeds maximum allowed ${options.maxHeight}px`);
        }
      } catch (error) {
        errors.push('Failed to read image dimensions');
      }
    }

    // Check for potentially malicious content
    if (this.containsSuspiciousContent(file.originalname)) {
      errors.push('File name contains suspicious content');
    }

    return {
      isValid: errors.length === 0,
      errors,
      fileInfo: {
        size: file.size,
        mimetype: file.mimetype,
        extension: fileExtension,
        dimensions,
      },
    };
  }

  async processFile(file: ProcessedFile, options?: FileProcessingOptions): Promise<Buffer> {
    // For now, return the original buffer
    // TODO: Implement image processing with sharp library if needed
    return file.buffer;
  }

  async uploadFile(request: FileUploadRequest): Promise<FileUploadResponse> {
    try {
      // Validate file
      const validationOptions = this.getValidationOptionsForContext(
        request.context.entityType,
        request.context.category
      );

      const validationResult = await this.validateFile(request.file, validationOptions);

      if (!validationResult.isValid) {
        return {
          success: false,
          url: '',
          path: '',
          size: request.file.size,
          metadata: {
            originalName: request.file.originalname,
            mimetype: request.file.mimetype,
            uploadedAt: new Date(),
            uploadedBy: request.context.userId,
          },
          error: validationResult.errors.join(', '),
        };
      }

      // Process file if needed
      const processedBuffer = await this.processFile(request.file, request.options);

      // Generate storage path and filename
      const bucket = this.getBucketForEntityType(request.context.entityType);
      const folder = this.generateStoragePath(
        request.context.userId,
        request.context.entityType,
        request.context.category,
        request.context.entityId
      );
      const fileName = this.generateFileName(request.file.originalname, request.context.category);

      // Upload to storage
      const uploadResult = await storageService.upload(processedBuffer, {
        bucket,
        folder,
        fileName,
        metadata: {
          originalName: request.file.originalname,
          uploadedBy: request.context.userId,
          entityType: request.context.entityType,
          entityId: request.context.entityId || '',
          category: request.context.category,
        },
      });

      if (!uploadResult.success) {
        return {
          success: false,
          url: '',
          path: uploadResult.path,
          size: request.file.size,
          metadata: {
            originalName: request.file.originalname,
            mimetype: request.file.mimetype,
            uploadedAt: new Date(),
            uploadedBy: request.context.userId,
          },
          error: uploadResult.error,
        };
      }

      return {
        success: true,
        url: uploadResult.url,
        path: uploadResult.path,
        size: uploadResult.size,
        metadata: {
          originalName: request.file.originalname,
          mimetype: request.file.mimetype,
          uploadedAt: new Date(),
          uploadedBy: request.context.userId,
        },
      };
    } catch (error) {
      return {
        success: false,
        url: '',
        path: '',
        size: request.file.size,
        metadata: {
          originalName: request.file.originalname,
          mimetype: request.file.mimetype,
          uploadedAt: new Date(),
          uploadedBy: request.context.userId,
        },
        error: error instanceof Error ? error.message : 'Unknown upload error',
      };
    }
  }

  async deleteFiles(request: FileDeletionRequest): Promise<FileDeletionResponse> {
    if (request.paths.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        errors: [],
      };
    }

    // Group paths by bucket
    const pathsByBucket: Record<StorageBucket, string[]> = {
      'pet-images': [],
      'business-images': [],
      'user-profiles': [],
      'documents': [],
      'service-images': [],
    };

    request.paths.forEach(path => {
      const bucket = this.extractBucketFromPath(path, request.entityType);
      if (bucket && pathsByBucket[bucket]) {
        pathsByBucket[bucket].push(path);
      }
    });

    const allErrors: Array<{ path: string; error: string }> = [];
    let totalDeleted = 0;

    // Delete from each bucket
    for (const [bucket, paths] of Object.entries(pathsByBucket)) {
      if (paths.length === 0) continue;

      const deleteResult = await storageService.delete({
        bucket: bucket as StorageBucket,
        paths,
      });

      if (deleteResult.success) {
        totalDeleted += deleteResult.deletedPaths.length;
      }

      allErrors.push(...deleteResult.errors);
    }

    return {
      success: allErrors.length === 0,
      deletedCount: totalDeleted,
      errors: allErrors,
    };
  }

  getValidationOptionsForContext(entityType: string, category: string): FileValidationOptions {
    switch (entityType) {
      case 'pet':
        if (category === 'document') {
          return FILE_CONSTRAINTS.DOCUMENTS;
        }
        return {
          ...FILE_CONSTRAINTS.PET_IMAGES,
          requireImageDimensions: true,
        };
      case 'business':
        if (category === 'document') {
          return FILE_CONSTRAINTS.DOCUMENTS;
        }
        return {
          ...FILE_CONSTRAINTS.BUSINESS_IMAGES,
          requireImageDimensions: true,
        };
      case 'service':
        return {
          ...FILE_CONSTRAINTS.PET_IMAGES,
          requireImageDimensions: true,
        };
      case 'user':
        if (category === 'document') {
          return FILE_CONSTRAINTS.DOCUMENTS;
        }
        return {
          ...FILE_CONSTRAINTS.USER_PROFILES,
          requireImageDimensions: true,
        };
      default:
        return FILE_CONSTRAINTS.DOCUMENTS;
    }
  }

  sanitizeFileName(fileName: string): string {
    // Remove or replace dangerous characters
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }

  generateStoragePath(userId: string, entityType: string, category: string, entityId?: string): string {
    if (entityId) {
      return `${userId}/${entityType}/${entityId}/${category}`;
    }
    return `${userId}/${entityType}/${category}`;
  }

  private getBucketForEntityType(entityType: string): StorageBucket {
    switch (entityType) {
      case 'pet':
        return 'pet-images';
      case 'business':
        return 'business-images';
      case 'service':
        return 'service-images';
      case 'user':
        return 'user-profiles';
      default:
        return 'documents';
    }
  }

  private generateFileName(originalName: string, category: string): string {
    const extension = path.extname(originalName);
    const sanitizedName = this.sanitizeFileName(path.basename(originalName, extension));
    const uuid = uuidv4();
    const timestamp = Date.now();

    return `${category}_${timestamp}_${uuid}_${sanitizedName}${extension}`;
  }

  private isImageFile(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  private async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    // TODO: Implement with sharp library for proper image dimension reading
    // For now, return dummy dimensions
    return { width: 800, height: 600 };
  }

  private containsSuspiciousContent(fileName: string): boolean {
    const suspiciousPatterns = [
      /\.\./,
      /[<>:"|?*]/,
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,
      /\.(exe|bat|cmd|scr|pif|com)$/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(fileName));
  }

  async listEntityFiles(request: FileListRequest): Promise<FileListResponse> {
    try {
      const { userId, entityType, entityId } = request;
      const targetEntityId = entityType === 'user' ? userId : entityId;

      if (!targetEntityId) {
        return {
          success: false,
          error: 'Entity ID is required',
        };
      }

      // Determine which buckets to search based on entity type
      const bucketsToSearch: StorageBucket[] = [];

      if (entityType === 'pet') {
        bucketsToSearch.push('pet-images');
      } else if (entityType === 'business') {
        bucketsToSearch.push('business-images');
      } else if (entityType === 'service') {
        bucketsToSearch.push('service-images');
      } else if (entityType === 'user') {
        bucketsToSearch.push('user-profiles');
      }

      const allFiles: FileListItem[] = [];

      // Search each bucket for files belonging to this entity
      for (const bucket of bucketsToSearch) {
        try {
          // We need to search for all categories since files are in subfolders
          // Upload structure: userId/entityType/entityId/category/filename

          let searchPrefixes: string[] = [];

          if (entityType === 'user') {
            // For users, search only in their own folder
            searchPrefixes.push(`${userId}/user/`);
          } else {
            // For business/pet/service, we need to search across all user folders
            // Supabase .list() only returns items at the specified level, not recursively
            // So we first need to get all user folders (top-level), then search within each

            console.log(`[FileService] Getting all user folders in bucket ${bucket}`);
            const userFolders = await storageService.listFiles(bucket, '');
            console.log(`[FileService] Found ${userFolders.length} user folders:`, userFolders.map(f => f.name));

            const uniquePrefixes = new Set<string>();

            // For each user folder, check if they have files for this entity
            for (const userFolder of userFolders) {
              // userFolder.name will be just the folder name (userId), not a full path
              const possibleUserId = userFolder.name;
              console.log(`[FileService] Checking user folder: ${possibleUserId}`);

              // Try to list files in the entity path for this user
              const entityPath = `${possibleUserId}/${entityType}/${targetEntityId}`;
              console.log(`[FileService] Trying path: ${entityPath}`);

              try {
                const entityFiles = await storageService.listFiles(bucket, entityPath);
                console.log(`[FileService] Found ${entityFiles.length} items in ${entityPath}`);

                if (entityFiles.length > 0) {
                  // This user has files for this entity
                  uniquePrefixes.add(`${entityPath}/`);
                  console.log(`[FileService] Added prefix: ${entityPath}/`);
                }
              } catch (error) {
                // Path doesn't exist for this user, continue
                console.log(`[FileService] No files in ${entityPath}`);
              }
            }

            searchPrefixes = Array.from(uniquePrefixes);
            console.log(`[FileService] Final unique prefixes:`, searchPrefixes);
          }

          console.log(`[FileService] Searching bucket ${bucket} with ${searchPrefixes.length} prefixes:`, searchPrefixes);

          for (const basePrefix of searchPrefixes) {
            // Get all items under the base prefix (this will include category folders)
            const items = await storageService.listFiles(bucket, basePrefix);
            console.log(`[FileService] Found ${items.length} items in prefix: ${basePrefix}`);

            // Now search within each category folder (removed 'document' since we no longer support document uploads)
            const categories = ['profile', 'additional', 'gallery', 'logo', 'service-image'];

            for (const category of categories) {
              try {
                const categoryPrefix = `${basePrefix}${category}/`;

                const categoryFiles = await storageService.listFiles(bucket, categoryPrefix);

                for (const file of categoryFiles) {
                  // Skip if it's a folder (no file extension)
                  if (!file.name.includes('.')) {
                    continue;
                  }

                  const fileItem: FileListItem = {
                    url: storageService.getPublicUrl({ bucket, path: file.name }),
                    path: file.name,
                    category: category,
                    size: file.metadata?.size || 0,
                    uploadedAt: file.updated_at || file.created_at || new Date(),
                    metadata: file.metadata,
                  };
                  allFiles.push(fileItem);
                }
              } catch (categoryError) {
                // Category folder might not exist, continue with next category
              }
            }
          }
        } catch (bucketError) {
          // Continue with other buckets if one fails
          console.warn(`Failed to list files in bucket ${bucket}:`, bucketError);
        }
      }

      return {
        success: true,
        files: allFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()),
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to list entity files: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private extractCategoryFromPath(filePath: string): string | null {
    // File paths follow pattern: userId/entityType/entityId/category/filename
    // or for users: userId/user/category/filename
    const parts = filePath.split('/');

    if (parts.length >= 4) {
      // The category is the folder name (second-to-last part)
      return parts[parts.length - 2];
    }

    // Fallback: extract category from filename (it's the first part before the first underscore)
    const filename = parts[parts.length - 1];
    const categoryMatch = filename.match(/^([^_]+)_/);
    return categoryMatch ? categoryMatch[1] : null;
  }

  private extractBucketFromPath(path: string, entityType?: string): StorageBucket | null {
    if (path.includes('pet-images') || entityType === 'pet') return 'pet-images';
    if (path.includes('business-images') || entityType === 'business') return 'business-images';
    if (path.includes('service-images') || entityType === 'service') return 'service-images';
    if (path.includes('user-profiles') || entityType === 'user') return 'user-profiles';
    if (path.includes('documents')) return 'documents';
    return null;
  }
}