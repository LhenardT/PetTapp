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
} from '../../types/file.types';

export interface IFileService {
  validateFile(file: ProcessedFile, options: FileValidationOptions): Promise<FileValidationResult>;

  processFile(file: ProcessedFile, options?: FileProcessingOptions): Promise<Buffer>;

  uploadFile(request: FileUploadRequest): Promise<FileUploadResponse>;

  deleteFiles(request: FileDeletionRequest): Promise<FileDeletionResponse>;

  listEntityFiles(request: FileListRequest): Promise<FileListResponse>;

  getValidationOptionsForContext(entityType: string, category: string): FileValidationOptions;

  sanitizeFileName(fileName: string): string;

  generateStoragePath(userId: string, entityType: string, category: string, entityId?: string): string;
}