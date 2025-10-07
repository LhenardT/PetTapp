export { IStorageService } from './IStorageService';
export { SupabaseStorageService } from './SupabaseStorageService';

// Export singleton instance
import { SupabaseStorageService } from './SupabaseStorageService';
export const storageService = new SupabaseStorageService();