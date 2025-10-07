import { Request, Response, NextFunction } from 'express';
import { fileService } from '../services/file';
import { ProcessedFile } from '../types/file.types';

// Extend Express Request type to include processed file validation
declare global {
  namespace Express {
    interface Request {
      validatedFiles?: {
        file?: ProcessedFile;
        files?: ProcessedFile[];
        isValid: boolean;
        errors: string[];
      };
    }
  }
}

// Middleware to validate uploaded files based on context
export const validateUploadedFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { entityType, category } = req.body;
    const files: ProcessedFile[] = [];

    // Convert multer files to ProcessedFile format
    if (req.file) {
      files.push({
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        fieldname: req.file.fieldname,
      });
    }

    if (req.files && Array.isArray(req.files)) {
      files.push(
        ...req.files.map(file => ({
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          fieldname: file.fieldname,
        }))
      );
    }

    if (files.length === 0) {
      req.validatedFiles = {
        isValid: false,
        errors: ['No files to validate'],
      };
      next();
      return;
    }

    // Get validation options for the context
    const validationOptions = fileService.getValidationOptionsForContext(entityType, category);

    // Validate each file
    const allErrors: string[] = [];
    const validatedFiles: ProcessedFile[] = [];

    for (const file of files) {
      const validationResult = await fileService.validateFile(file, validationOptions);

      if (validationResult.isValid) {
        validatedFiles.push(file);
      } else {
        allErrors.push(`${file.originalname}: ${validationResult.errors.join(', ')}`);
      }
    }

    // Attach validation results to request
    req.validatedFiles = {
      file: validatedFiles[0],
      files: validatedFiles,
      isValid: allErrors.length === 0,
      errors: allErrors,
    };

    // If validation failed, return error
    if (allErrors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'File validation failed',
        details: allErrors,
        code: 'FILE_VALIDATION_FAILED',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'File validation error',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'VALIDATION_ERROR',
    });
  }
};

// Middleware to check file size constraints for specific contexts
export const validateFileSizeForContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { entityType, category } = req.body;

  // Get file size constraints
  const validationOptions = fileService.getValidationOptionsForContext(entityType, category);
  const maxSize = validationOptions.maxSize;

  const files = req.files as Express.Multer.File[] || (req.file ? [req.file] : []);

  for (const file of files) {
    if (file.size > maxSize) {
      res.status(400).json({
        success: false,
        error: `File ${file.originalname} exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(2)}MB for ${entityType} ${category}`,
        code: 'FILE_SIZE_EXCEEDED',
      });
      return;
    }
  }

  next();
};

// Middleware to sanitize file names
export const sanitizeFileNames = (req: Request, res: Response, next: NextFunction): void => {
  if (req.file) {
    req.file.originalname = fileService.sanitizeFileName(req.file.originalname);
  }

  if (req.files && Array.isArray(req.files)) {
    req.files.forEach(file => {
      file.originalname = fileService.sanitizeFileName(file.originalname);
    });
  }

  next();
};

// Middleware to check for duplicate file names in batch uploads
export const checkDuplicateFileNames = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.files || !Array.isArray(req.files) || req.files.length <= 1) {
    next();
    return;
  }

  const fileNames = req.files.map(file => file.originalname.toLowerCase());
  const uniqueNames = new Set(fileNames);

  if (fileNames.length !== uniqueNames.size) {
    res.status(400).json({
      success: false,
      error: 'Duplicate file names detected in upload batch',
      code: 'DUPLICATE_FILE_NAMES',
    });
    return;
  }

  next();
};

// Comprehensive validation middleware chain
export const fileValidationChain = [
  sanitizeFileNames,
  validateFileSizeForContext,
  checkDuplicateFileNames,
  validateUploadedFiles,
];