export interface FileValidationOptions {
  maxSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  requireImageDimensions?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  fileInfo?: {
    size: number;
    mimetype: string;
    extension: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

export interface ProcessedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  fieldname: string;
}

export interface FileProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  strip?: boolean;
}

export interface FileUploadContext {
  userId: string;
  entityType: 'pet' | 'business' | 'user' | 'service';
  entityId?: string;
  category: 'profile' | 'additional' | 'logo' | 'gallery' | 'document' | 'service-image';
}

export interface FileUploadRequest {
  file: ProcessedFile;
  context: FileUploadContext;
  options?: FileProcessingOptions;
}

export interface FileUploadResponse {
  success: boolean;
  url: string;
  path: string;
  size: number;
  metadata: {
    originalName: string;
    mimetype: string;
    uploadedAt: Date;
    uploadedBy: string;
  };
  error?: string;
}

export interface FileDeletionRequest {
  userId: string;
  paths: string[];
  entityType?: 'pet' | 'business' | 'user' | 'service';
  entityId?: string;
}

export interface FileDeletionResponse {
  success: boolean;
  deletedCount: number;
  errors: Array<{
    path: string;
    error: string;
  }>;
}

export interface FileListRequest {
  userId: string;
  entityType: 'pet' | 'business' | 'user' | 'service';
  entityId?: string;
}

export interface FileListItem {
  url: string;
  path: string;
  category: string;
  size: number;
  uploadedAt: Date;
  metadata?: any;
}

export interface FileListResponse {
  success: boolean;
  files?: FileListItem[];
  error?: string;
}

export const FILE_CONSTRAINTS = {
  PET_IMAGES: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as string[],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as string[],
    maxWidth: 2048,
    maxHeight: 2048,
  },
  BUSINESS_IMAGES: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as string[],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as string[],
    maxWidth: 4096,
    maxHeight: 4096,
  },
  USER_PROFILES: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as string[],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as string[],
    maxWidth: 1024,
    maxHeight: 1024,
  },
  DOCUMENTS: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ] as string[],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'] as string[],
  },
};