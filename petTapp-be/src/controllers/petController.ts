import { Response, NextFunction } from 'express';
import { Pet } from '../models/Pet';
import { AuthRequest, UserRole } from '../types/auth.types';
import { fileService } from '../services/file';
import { imageService } from '../services/imageService';

export const createPet = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Parse JSON data from petData field if using multipart/form-data
    let petFormData = req.body;
    if (req.body.petData) {
      try {
        petFormData = JSON.parse(req.body.petData);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid petData JSON format'
        });
      }
    }

    const petData = {
      ...petFormData,
      ownerId: req.user?.userId
    };

    const pet = new Pet(petData);
    await pet.save();

    // Handle profile image upload if provided
    let imageUrl = null;
    if (req.file) {
      try {
        const uploadResult = await fileService.uploadFile({
          file: req.file,
          context: {
            userId: req.user!.userId!,
            entityType: 'pet',
            entityId: pet._id.toString(),
            category: 'profile',
          }
        });

        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
          // Update pet with profile image
          pet.images = { profileImage: uploadResult.path, additionalImages: [] };
          await pet.save();
        }
      } catch (uploadError) {
        // If upload fails, still return the pet but note the image upload failed
        console.error('Image upload failed:', uploadError);
      }
    }

    // Attach images to the response
    const petWithImages = await imageService.attachPetImages(pet.toObject());

    res.status(201).json({
      success: true,
      message: 'Pet created successfully',
      data: petWithImages
    });
  } catch (error) {
    next(error);
  }
};

export const getPets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?.userId;

    let filter: any = { isActive: true };

    if (req.user?.role === UserRole.PET_OWNER) {
      filter.ownerId = userId;
    } else if (req.user?.role === UserRole.ADMIN) {
      // Admin can see all pets, no filter needed
    }

    const pets = await Pet.find(filter)
      .select('_id ownerId name species breed age gender images')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Pet.countDocuments(filter);

    // Attach images to all pets
    const petsWithImages = await imageService.attachPetImagesArray(pets.map(pet => pet.toObject()));

    res.json({
      success: true,
      data: petsWithImages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPetById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (req.user?.role === UserRole.PET_OWNER && pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Attach images to the pet
    const petWithImages = await imageService.attachPetImages(pet.toObject());

    res.json({
      success: true,
      data: petWithImages
    });
  } catch (error) {
    next(error);
  }
};

export const updatePet = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (req.user?.role === UserRole.PET_OWNER && pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Pet updated successfully',
      data: updatedPet
    });
  } catch (error) {
    next(error);
  }
};

export const deletePet = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (req.user?.role === UserRole.PET_OWNER && pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete associated images before soft deleting the pet
    const imagePaths: string[] = [];
    if (pet.images?.profileImage) {
      imagePaths.push(pet.images.profileImage);
    }
    if (pet.images?.additionalImages) {
      imagePaths.push(...pet.images.additionalImages);
    }

    if (imagePaths.length > 0) {
      await fileService.deleteFiles({
        userId: userId!,
        paths: imagePaths,
        entityType: 'pet',
        entityId: id,
      });
    }

    await Pet.findByIdAndUpdate(id, { isActive: false });

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updatePetImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { imageType, imageUrl } = req.body; // 'profile' or 'additional'
    const userId = req.user?.userId;

    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (req.user?.role === UserRole.PET_OWNER && pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let updateData: any = {};

    if (imageType === 'profile') {
      // If there's an existing profile image, delete it first
      if (pet.images?.profileImage) {
        await fileService.deleteFiles({
          userId: userId!,
          paths: [pet.images.profileImage],
          entityType: 'pet',
          entityId: id,
        });
      }
      updateData = { 'images.profileImage': imageUrl };
    } else if (imageType === 'additional') {
      // Add to additional images array
      updateData = { $push: { 'images.additionalImages': imageUrl } };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type. Must be "profile" or "additional"'
      });
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Pet image updated successfully',
      data: updatedPet
    });
  } catch (error) {
    next(error);
  }
};

export const removePetImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { imageType, imageUrl } = req.body;
    const userId = req.user?.userId;

    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    if (req.user?.role === UserRole.PET_OWNER && pet.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete from storage
    await fileService.deleteFiles({
      userId: userId!,
      paths: [imageUrl],
      entityType: 'pet',
      entityId: id,
    });

    let updateData: any = {};

    if (imageType === 'profile') {
      updateData = { $unset: { 'images.profileImage': '' } };
    } else if (imageType === 'additional') {
      updateData = { $pull: { 'images.additionalImages': imageUrl } };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type. Must be "profile" or "additional"'
      });
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Pet image removed successfully',
      data: updatedPet
    });
  } catch (error) {
    next(error);
  }
};