import { fileService } from './file';
import { FileListItem } from '../types/file.types';

interface EntityImages {
  profile?: string;
  gallery?: string[];
  logo?: string;
  documents?: string[];
}

export class ImageService {
  /**
   * Fetch and organize images for a user
   */
  async getUserImages(userId: string): Promise<EntityImages> {
    try {
      const result = await fileService.listEntityFiles({
        userId,
        entityType: 'user',
        entityId: userId,
      });

      const images: EntityImages = {};

      if (result.success && result.files) {
        // Find profile image
        const profileImage = result.files.find(file => file.category === 'profile');
        if (profileImage) {
          images.profile = profileImage.url;
        }
      }

      return images;
    } catch (error) {
      console.error('Error fetching user images:', error);
      return {};
    }
  }

  /**
   * Fetch and organize images for a pet
   */
  async getPetImages(userId: string, petId: string): Promise<EntityImages> {
    try {
      const result = await fileService.listEntityFiles({
        userId,
        entityType: 'pet',
        entityId: petId,
      });

      const images: EntityImages = {
        gallery: [],
      };

      if (result.success && result.files) {
        // Find profile image
        const profileImage = result.files.find(file => file.category === 'profile');
        if (profileImage) {
          images.profile = profileImage.url;
        }

        // Find gallery images
        const galleryImages = result.files.filter(file => file.category === 'additional');
        images.gallery = galleryImages.map(img => img.url);
      }

      return images;
    } catch (error) {
      console.error('Error fetching pet images:', error);
      return { gallery: [] };
    }
  }

  /**
   * Fetch and organize images for a business
   */
  async getBusinessImages(businessId: string): Promise<EntityImages> {
    try {
      // Get business to find ownerId
      const Business = require('../models/Business').Business;
      const business = await Business.findById(businessId);

      if (!business) {
        console.log(`[ImageService] Business not found: ${businessId}`);
        return { gallery: [] };
      }

      console.log(`[ImageService] Fetching images for business ${businessId}, ownerId: ${business.ownerId}`);

      const result = await fileService.listEntityFiles({
        userId: business.ownerId,
        entityType: 'business',
        entityId: businessId,
      });

      console.log(`[ImageService] File service result:`, result);

      const images: EntityImages = {
        gallery: [],
      };

      if (result.success && result.files) {
        console.log(`[ImageService] Found ${result.files.length} files`);

        // Find logo
        const logoImage = result.files.find(file => file.category === 'logo');
        if (logoImage) {
          images.logo = logoImage.url;
          console.log(`[ImageService] Found logo: ${logoImage.url}`);
        }

        // Find gallery images
        const galleryImages = result.files.filter(file => file.category === 'gallery');
        images.gallery = galleryImages.map(img => img.url);
        console.log(`[ImageService] Found ${galleryImages.length} gallery images`);
      } else {
        console.log(`[ImageService] No files found or result not successful`);
      }

      return images;
    } catch (error) {
      console.error('Error fetching business images:', error);
      return { gallery: [] };
    }
  }

  /**
   * Attach images to a single user object
   */
  async attachUserImages(user: any): Promise<any> {
    if (!user || !user._id) return user;

    const images = await this.getUserImages(user._id);
    return {
      ...user,
      images,
    };
  }

  /**
   * Attach images to a single pet object
   */
  async attachPetImages(pet: any): Promise<any> {
    if (!pet || !pet._id || !pet.ownerId) return pet;

    const images = await this.getPetImages(pet.ownerId, pet._id);
    return {
      ...pet,
      images: {
        profile: images.profile
      },
    };
  }

  /**
   * Attach images to a single business object
   */
  async attachBusinessImages(business: any): Promise<any> {
    if (!business || !business._id) {
      console.log('[ImageService] Business missing or no _id');
      return business;
    }

    const images = await this.getBusinessImages(business._id);
    console.log('[ImageService] Attaching images:', images);

    return {
      ...business,
      images: {
        logo: images.logo,
        businessImages: images.gallery || []
      },
    };
  }

  /**
   * Attach images to an array of pets
   */
  async attachPetImagesArray(pets: any[]): Promise<any[]> {
    if (!Array.isArray(pets) || pets.length === 0) return pets;

    const petsWithImages = await Promise.all(
      pets.map(pet => this.attachPetImages(pet))
    );

    return petsWithImages;
  }

  /**
   * Attach images to an array of businesses
   */
  async attachBusinessImagesArray(businesses: any[]): Promise<any[]> {
    if (!Array.isArray(businesses) || businesses.length === 0) return businesses;

    const businessesWithImages = await Promise.all(
      businesses.map(business => this.attachBusinessImages(business))
    );

    return businessesWithImages;
  }
}

export const imageService = new ImageService();