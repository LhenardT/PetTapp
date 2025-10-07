import { Router } from 'express';
import {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
  updatePetImage,
  removePetImage
} from '../controllers/petController';
import { authenticate } from '../middleware/auth';
import { requirePetOwnerOrAdmin } from '../middleware/roleAuth';
import { uploadSingleImage, handleFileUploadError } from '../middleware/fileUpload';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Pet:
 *       type: object
 *       required:
 *         - name
 *         - species
 *         - age
 *         - gender
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the pet
 *         ownerId:
 *           type: string
 *           description: ID of the pet owner
 *         name:
 *           type: string
 *           maxLength: 50
 *           example: "Buddy"
 *         species:
 *           type: string
 *           enum: [dog, cat, bird, fish, rabbit, hamster, guinea-pig, reptile, other]
 *           example: "dog"
 *         breed:
 *           type: string
 *           maxLength: 50
 *           example: "Golden Retriever"
 *         age:
 *           type: number
 *           minimum: 0
 *           maximum: 30
 *           example: 3
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: "male"
 *         weight:
 *           type: number
 *           minimum: 0
 *           maximum: 200
 *           example: 25.5
 *         color:
 *           type: string
 *           maxLength: 30
 *           example: "Golden"
 *         medicalHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               condition:
 *                 type: string
 *                 example: "Hip Dysplasia"
 *               diagnosedDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-15"
 *               treatment:
 *                 type: string
 *                 example: "Physical therapy and medication"
 *               notes:
 *                 type: string
 *                 example: "Responds well to treatment"
 *         vaccinations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               vaccine:
 *                 type: string
 *                 example: "Rabies"
 *               administeredDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-06-01"
 *               nextDueDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-01"
 *               veterinarian:
 *                 type: string
 *                 example: "Dr. Smith"
 *         specialInstructions:
 *           type: string
 *           example: "Friendly with children, nervous around loud noises"
 *         isActive:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PetInput:
 *       type: object
 *       required:
 *         - name
 *         - species
 *         - age
 *         - gender
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 50
 *           example: "Buddy"
 *         species:
 *           type: string
 *           enum: [dog, cat, bird, fish, rabbit, hamster, guinea-pig, reptile, other]
 *           example: "dog"
 *         breed:
 *           type: string
 *           maxLength: 50
 *           example: "Golden Retriever"
 *         age:
 *           type: number
 *           minimum: 0
 *           maximum: 30
 *           example: 3
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           example: "male"
 *         weight:
 *           type: number
 *           minimum: 0
 *           maximum: 200
 *           example: 25.5
 *         color:
 *           type: string
 *           maxLength: 30
 *           example: "Golden"
 *         medicalHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               condition:
 *                 type: string
 *               diagnosedDate:
 *                 type: string
 *                 format: date
 *               treatment:
 *                 type: string
 *               notes:
 *                 type: string
 *         vaccinations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               vaccine:
 *                 type: string
 *               administeredDate:
 *                 type: string
 *                 format: date
 *               nextDueDate:
 *                 type: string
 *                 format: date
 *               veterinarian:
 *                 type: string
 *         specialInstructions:
 *           type: string
 */

router.use(authenticate);

/**
 * @swagger
 * /pets:
 *   post:
 *     summary: Create a new pet profile with optional image
 *     description: |
 *       Creates a new pet profile for the authenticated user with optional profile image upload.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ✅ Can create pets for themselves
 *       - 🏢 **Business Owner**: ❌ No access
 *       - 👑 **Admin**: ✅ Can create pets for any user
 *
 *       **🔒 Restrictions:**
 *       - Pet owners can only create pets linked to their own account
 *       - Admins can create pets for any user by specifying ownerId
 *
 *       **📝 Usage Instructions:**
 *       - Use **multipart/form-data** content type
 *       - **petData** field: JSON string containing all pet information (required fields: name, species, age, gender)
 *       - **image** field: Optional profile image file (JPEG, PNG, WebP, max 5MB)
 *
 *       **Example petData JSON:**
 *       ```json
 *       {
 *         "name": "Buddy",
 *         "species": "dog",
 *         "breed": "Golden Retriever",
 *         "age": 3,
 *         "gender": "male",
 *         "weight": 25.5,
 *         "color": "Golden",
 *         "medicalHistory": [
 *           {
 *             "condition": "Hip Dysplasia",
 *             "diagnosedDate": "2023-01-15",
 *             "treatment": "Physical therapy",
 *             "notes": "Responds well to treatment"
 *           }
 *         ],
 *         "vaccinations": [
 *           {
 *             "vaccine": "Rabies",
 *             "administeredDate": "2023-06-01",
 *             "nextDueDate": "2024-06-01",
 *             "veterinarian": "Dr. Smith"
 *           }
 *         ],
 *         "specialInstructions": "Friendly with children, nervous around loud noises"
 *       }
 *       ```
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - petData
 *             properties:
 *               petData:
 *                 type: string
 *                 description: |
 *                   JSON string containing pet information. Required fields: name, species, age, gender.
 *                   Optional fields: breed, weight, color, medicalHistory, vaccinations, specialInstructions.
 *
 *                   Species enum: dog, cat, bird, fish, rabbit, hamster, guinea-pig, reptile, other
 *                   Gender enum: male, female
 *                 example: '{"name":"Buddy","species":"dog","breed":"Golden Retriever","age":3,"gender":"male","weight":25.5,"color":"Golden","specialInstructions":"Friendly with children"}'
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional pet profile image (JPEG, PNG, WebP, max 5MB)
 *           encoding:
 *             petData:
 *               contentType: application/json
 *             image:
 *               contentType: image/jpeg, image/png, image/webp
 *     responses:
 *       201:
 *         description: Pet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pet created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Validation error or invalid JSON in petData
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', uploadSingleImage, handleFileUploadError, requirePetOwnerOrAdmin, createPet);

/**
 * @swagger
 * /pets:
 *   get:
 *     summary: Get pets
 *     description: Retrieves pets based on user role. Pet owners see their own pets, admins see all pets.
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Pets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pet'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.get('/', requirePetOwnerOrAdmin, getPets);

/**
 * @swagger
 * /pets/{id}:
 *   get:
 *     summary: Get pet by ID
 *     description: Retrieves a specific pet by ID. Pet owners can only access their own pets, admins can access any pet.
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pet ID
 *     responses:
 *       200:
 *         description: Pet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Pet'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Pet not found
 */
router.get('/:id', requirePetOwnerOrAdmin, getPetById);

/**
 * @swagger
 * /pets/{id}:
 *   put:
 *     summary: Update pet profile
 *     description: Updates a pet profile. Pet owners can only update their own pets, admins can update any pet.
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PetInput'
 *     responses:
 *       200:
 *         description: Pet updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pet updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Pet not found
 */
router.put('/:id', requirePetOwnerOrAdmin, updatePet);

/**
 * @swagger
 * /pets/{id}:
 *   delete:
 *     summary: Delete pet profile
 *     description: Soft deletes a pet profile (sets isActive to false). Pet owners can only delete their own pets, admins can delete any pet.
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pet ID
 *     responses:
 *       200:
 *         description: Pet deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pet deleted successfully"
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Pet not found
 */
router.delete('/:id', requirePetOwnerOrAdmin, deletePet);

/**
 * @swagger
 * /pets/{id}/image:
 *   put:
 *     summary: Update pet image
 *     description: Updates a pet's profile or additional image. Pet owners can only update their own pets, admins can update any pet.
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageType
 *               - imageUrl
 *             properties:
 *               imageType:
 *                 type: string
 *                 enum: [profile, additional]
 *                 description: Type of image to update
 *               imageUrl:
 *                 type: string
 *                 description: URL of the uploaded image
 *     responses:
 *       200:
 *         description: Pet image updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Pet not found
 */
router.put('/:id/image', requirePetOwnerOrAdmin, updatePetImage);

/**
 * @swagger
 * /pets/{id}/image:
 *   delete:
 *     summary: Remove pet image
 *     description: Removes a pet's profile or additional image. Pet owners can only update their own pets, admins can update any pet.
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageType
 *               - imageUrl
 *             properties:
 *               imageType:
 *                 type: string
 *                 enum: [profile, additional]
 *                 description: Type of image to remove
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image to remove
 *     responses:
 *       200:
 *         description: Pet image removed successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Pet not found
 */
router.delete('/:id/image', requirePetOwnerOrAdmin, removePetImage);

export default router;