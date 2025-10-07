export { IFileService } from './IFileService';
export { FileService } from './FileService';

// Export singleton instance
import { FileService } from './FileService';
export const fileService = new FileService();