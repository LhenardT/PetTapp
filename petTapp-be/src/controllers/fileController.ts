import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import { fileService } from '../services/file';
import { storageService } from '../services/storage';
import {
  FileUploadRequest,
  FileDeletionRequest,
  ProcessedFile,
  FileUploadContext,
} from '../types/file.types';

export class FileController {
  async uploadSingleFile(req: AuthRequest, res: Response): Promise<void> {
    try {

      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      if (!req.validatedFiles?.file) {
        res.status(400).json({
          success: false,
          error: 'No valid file provided',
          code: 'NO_VALID_FILE',
        });
        return;
      }

      const { entityType, category, entityId } = req.body;

      const context: FileUploadContext = {
        userId: req.user.userId,
        entityType,
        entityId,
        category,
      };

      const uploadRequest: FileUploadRequest = {
        file: req.validatedFiles.file,
        context,
      };

      const result = await fileService.uploadFile(uploadRequest);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'File uploaded successfully',
          data: {
            url: result.url,
            path: result.path,
            size: result.size,
            metadata: result.metadata,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Upload failed',
          code: 'UPLOAD_FAILED',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during file upload',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  async uploadMultipleFiles(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      if (!req.validatedFiles?.files || req.validatedFiles.files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No valid files provided',
          code: 'NO_VALID_FILES',
        });
        return;
      }

      const { entityType, category, entityId } = req.body;

      const context: FileUploadContext = {
        userId: req.user.userId,
        entityType,
        entityId,
        category,
      };

      const uploadPromises = req.validatedFiles.files.map(file => {
        const uploadRequest: FileUploadRequest = {
          file,
          context,
        };
        return fileService.uploadFile(uploadRequest);
      });

      const results = await Promise.all(uploadPromises);

      const successful = results.filter(result => result.success);
      const failed = results.filter(result => !result.success);

      res.status(successful.length > 0 ? 201 : 400).json({
        success: failed.length === 0,
        message: `${successful.length} of ${results.length} files uploaded successfully`,
        data: {
          successful: successful.map(result => ({
            url: result.url,
            path: result.path,
            size: result.size,
            metadata: result.metadata,
          })),
          failed: failed.map(result => ({
            error: result.error,
            metadata: result.metadata,
          })),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during file upload',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  async deleteFiles(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      const { paths, entityType, entityId } = req.body;

      if (!paths || !Array.isArray(paths) || paths.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Paths array is required',
          code: 'MISSING_PATHS',
        });
        return;
      }

      // Validate that user owns these files (basic path validation)
      const invalidPaths = paths.filter(path => !path.includes(req.user!.userId));
      if (invalidPaths.length > 0) {
        res.status(403).json({
          success: false,
          error: 'Access denied for some file paths',
          code: 'ACCESS_DENIED',
        });
        return;
      }

      const deletionRequest: FileDeletionRequest = {
        userId: req.user.userId,
        paths,
        entityType,
        entityId,
      };

      const result = await fileService.deleteFiles(deletionRequest);

      res.status(200).json({
        success: result.success,
        message: `${result.deletedCount} files deleted successfully`,
        data: {
          deletedCount: result.deletedCount,
          errors: result.errors,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during file deletion',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  async getSignedUrl(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      const { bucket, path, expiresIn } = req.query;

      if (!bucket || !path) {
        res.status(400).json({
          success: false,
          error: 'Bucket and path are required',
          code: 'MISSING_PARAMETERS',
        });
        return;
      }

      // Validate that user owns this file
      if (!path.toString().includes(req.user.userId)) {
        res.status(403).json({
          success: false,
          error: 'Access denied for this file',
          code: 'ACCESS_DENIED',
        });
        return;
      }

      const signedUrl = await storageService.getSignedUrl({
        bucket: bucket as any,
        path: path as string,
        expiresIn: expiresIn ? parseInt(expiresIn as string) : 3600,
      });

      res.status(200).json({
        success: true,
        data: {
          signedUrl,
          expiresIn: expiresIn || 3600,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate signed URL',
        code: 'SIGNED_URL_ERROR',
      });
    }
  }

  async getFileMetadata(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      const { bucket, path } = req.query;

      if (!bucket || !path) {
        res.status(400).json({
          success: false,
          error: 'Bucket and path are required',
          code: 'MISSING_PARAMETERS',
        });
        return;
      }

      // Validate that user owns this file
      if (!path.toString().includes(req.user.userId)) {
        res.status(403).json({
          success: false,
          error: 'Access denied for this file',
          code: 'ACCESS_DENIED',
        });
        return;
      }

      const metadata = await storageService.getMetadata(bucket as string, path as string);

      if (!metadata) {
        res.status(404).json({
          success: false,
          error: 'File not found',
          code: 'FILE_NOT_FOUND',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: metadata,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get file metadata',
        code: 'METADATA_ERROR',
      });
    }
  }

  async listEntityFiles(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        });
        return;
      }

      const { entityType, entityId } = req.body;

      if (!entityType) {
        res.status(400).json({
          success: false,
          error: 'Entity type is required',
          code: 'MISSING_ENTITY_TYPE',
        });
        return;
      }

      // For user files, entityId is optional (defaults to userId)
      const targetEntityId = entityType === 'user' ? req.user.userId : entityId;

      if (!targetEntityId && entityType !== 'user') {
        res.status(400).json({
          success: false,
          error: 'Entity ID is required for non-user entities',
          code: 'MISSING_ENTITY_ID',
        });
        return;
      }

      const result = await fileService.listEntityFiles({
        userId: req.user.userId,
        entityType,
        entityId: targetEntityId,
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            entityType,
            entityId: targetEntityId,
            files: result.files,
            totalFiles: result.files?.length || 0,
          },
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error || 'No files found',
          code: 'FILES_NOT_FOUND',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to list entity files',
        code: 'LIST_FILES_ERROR',
      });
    }
  }
}

export const fileController = new FileController();