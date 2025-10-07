import multer, { MulterError } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { fileService } from '../services/file';
import { FILE_CONSTRAINTS } from '../types/file.types';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Base multer configuration
const baseUpload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max (highest constraint)
    files: 10, // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Basic file type check - more specific validation happens later
    const allowedMimeTypes: string[] = [
      ...FILE_CONSTRAINTS.PET_IMAGES.allowedMimeTypes,
      ...FILE_CONSTRAINTS.BUSINESS_IMAGES.allowedMimeTypes,
      ...FILE_CONSTRAINTS.USER_PROFILES.allowedMimeTypes,
      ...FILE_CONSTRAINTS.DOCUMENTS.allowedMimeTypes,
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }
  },
});

// Middleware factory for different upload types
export const createFileUploadMiddleware = (fieldName: string, maxFiles: number = 1) => {
  if (maxFiles === 1) {
    return baseUpload.single(fieldName);
  } else {
    return baseUpload.array(fieldName, maxFiles);
  }
};

// Specific middleware for different contexts
export const uploadSingleImage = createFileUploadMiddleware('image', 1);
export const uploadMultipleImages = createFileUploadMiddleware('images', 5);
export const uploadProfileImage = createFileUploadMiddleware('profileImage', 1);
export const uploadDocument = createFileUploadMiddleware('document', 1);
export const uploadBusinessImages = createFileUploadMiddleware('businessImages', 10);

// Error handling middleware for multer errors
export const handleFileUploadError = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        res.status(400).json({
          success: false,
          error: 'File size too large. Maximum allowed size is 20MB.',
          code: 'FILE_TOO_LARGE',
        });
        return;

      case 'LIMIT_FILE_COUNT':
        res.status(400).json({
          success: false,
          error: 'Too many files. Maximum allowed files per request is 10.',
          code: 'TOO_MANY_FILES',
        });
        return;

      case 'LIMIT_UNEXPECTED_FILE':
        res.status(400).json({
          success: false,
          error: 'Unexpected file field or unsupported file type.',
          code: 'UNEXPECTED_FILE',
        });
        return;

      case 'LIMIT_PART_COUNT':
        res.status(400).json({
          success: false,
          error: 'Too many parts in multipart form.',
          code: 'TOO_MANY_PARTS',
        });
        return;

      case 'LIMIT_FIELD_KEY':
        res.status(400).json({
          success: false,
          error: 'Field name too long.',
          code: 'FIELD_NAME_TOO_LONG',
        });
        return;

      case 'LIMIT_FIELD_VALUE':
        res.status(400).json({
          success: false,
          error: 'Field value too long.',
          code: 'FIELD_VALUE_TOO_LONG',
        });
        return;

      case 'LIMIT_FIELD_COUNT':
        res.status(400).json({
          success: false,
          error: 'Too many fields in form.',
          code: 'TOO_MANY_FIELDS',
        });
        return;

      default:
        res.status(400).json({
          success: false,
          error: `File upload error: ${error.message}`,
          code: 'FILE_UPLOAD_ERROR',
        });
        return;
    }
  }

  // If it's not a multer error, pass it to the next error handler
  next(error);
};

// Middleware to ensure files are present
export const requireFiles = (req: Request, res: Response, next: NextFunction): void => {
  const hasFile = req.file;
  const hasFiles = req.files && (req.files as Express.Multer.File[]).length > 0;

  if (!hasFile && !hasFiles) {
    res.status(400).json({
      success: false,
      error: 'No files provided.',
      code: 'NO_FILES',
    });
    return;
  }

  next();
};

// Middleware to validate file context parameters
export const validateFileContext = (req: Request, res: Response, next: NextFunction): void => {
  const { entityType, category } = req.body;

  if (!entityType) {
    res.status(400).json({
      success: false,
      error: 'entityType is required.',
      code: 'MISSING_ENTITY_TYPE',
    });
    return;
  }

  if (!category) {
    res.status(400).json({
      success: false,
      error: 'category is required.',
      code: 'MISSING_CATEGORY',
    });
    return;
  }

  const validEntityTypes = ['pet', 'business', 'user', 'service'];
  const validCategories = ['profile', 'additional', 'logo', 'gallery', 'document', 'service-image'];

  if (!validEntityTypes.includes(entityType)) {
    res.status(400).json({
      success: false,
      error: `Invalid entityType. Allowed values: ${validEntityTypes.join(', ')}`,
      code: 'INVALID_ENTITY_TYPE',
    });
    return;
  }

  if (!validCategories.includes(category)) {
    res.status(400).json({
      success: false,
      error: `Invalid category. Allowed values: ${validCategories.join(', ')}`,
      code: 'INVALID_CATEGORY',
    });
    return;
  }

  next();
};

// Comprehensive file upload middleware chain
export const fileUploadChain = [
  uploadSingleImage,
  handleFileUploadError,
  requireFiles,
  validateFileContext,
];

export const multipleFileUploadChain = [
  uploadMultipleImages,
  handleFileUploadError,
  requireFiles,
  validateFileContext,
];