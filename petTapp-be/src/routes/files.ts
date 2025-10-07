import express from 'express';
import { fileController } from '../controllers/fileController';
import { authenticate } from '../middleware/auth';
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadDocument,
  handleFileUploadError,
  requireFiles,
  validateFileContext,
} from '../middleware/fileUpload';
import { fileValidationChain } from '../middleware/fileValidation';

const router = express.Router();

// Helper middleware to set context based on route
const setPetContext = (req: any, res: any, next: any) => {
  if (!req.body) req.body = {};
  req.body.entityType = 'pet';
  req.body.entityId = req.params.petId;
  next();
};

const setBusinessContext = (req: any, res: any, next: any) => {
  if (!req.body) req.body = {};
  req.body.entityType = 'business';
  req.body.entityId = req.params.businessId;
  next();
};

const setServiceContext = (req: any, res: any, next: any) => {
  if (!req.body) req.body = {};
  req.body.entityType = 'service';
  req.body.entityId = req.params.serviceId;
  next();
};

const setUserContext = (req: any, res: any, next: any) => {
  if (!req.body) req.body = {};
  req.body.entityType = 'user';
  next();
};

// Helper to set category
const setCategory = (category: string) => (req: any, res: any, next: any) => {
  if (!req.body) req.body = {};
  req.body.category = category;
  next();
};

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "File uploaded successfully"
 *         data:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: Public URL of the uploaded file
 *               example: "https://abc123.supabase.co/storage/v1/object/public/pet-images/user123/pet456/profile_1234567890_uuid123_buddy.jpg"
 *             path:
 *               type: string
 *               description: Storage path of the file
 *               example: "user123/pet456/profile_1234567890_uuid123_buddy.jpg"
 *             size:
 *               type: integer
 *               description: File size in bytes
 *               example: 245760
 *             metadata:
 *               type: object
 *               properties:
 *                 originalName:
 *                   type: string
 *                   example: "buddy_photo.jpg"
 *                 mimetype:
 *                   type: string
 *                   example: "image/jpeg"
 *                 uploadedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-03-15T10:30:00Z"
 *                 uploadedBy:
 *                   type: string
 *                   example: "user123"
 *
 *     MultipleFileUploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "3 of 3 files uploaded successfully"
 *         data:
 *           type: object
 *           properties:
 *             successful:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   url:
 *                     type: string
 *                     example: "https://abc123.supabase.co/storage/v1/object/public/pet-images/user123/pet456/additional_1234567890_uuid123_photo1.jpg"
 *                   path:
 *                     type: string
 *                     example: "user123/pet456/additional_1234567890_uuid123_photo1.jpg"
 *                   size:
 *                     type: integer
 *                     example: 189456
 *                   metadata:
 *                     type: object
 *             failed:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   error:
 *                     type: string
 *                     example: "File size exceeds maximum allowed size"
 *                   metadata:
 *                     type: object
 *
 *     FileDeleteResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "2 files deleted successfully"
 *         data:
 *           type: object
 *           properties:
 *             deletedCount:
 *               type: integer
 *               example: 2
 *             errors:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   path:
 *                     type: string
 *                     example: "user123/pet456/photo.jpg"
 *                   error:
 *                     type: string
 *                     example: "File not found"
 *
 *     SignedUrlResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             signedUrl:
 *               type: string
 *               example: "https://abc123.supabase.co/storage/v1/object/sign/pet-images/user123/pet456/photo.jpg?token=xyz789"
 *             expiresIn:
 *               type: integer
 *               example: 3600
 *
 *     FileMetadataResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             bucket:
 *               type: string
 *               example: "pet-images"
 *             path:
 *               type: string
 *               example: "user123/pet456/profile.jpg"
 *             size:
 *               type: integer
 *               example: 245760
 *             mimetype:
 *               type: string
 *               example: "image/jpeg"
 *             lastModified:
 *               type: string
 *               format: date-time
 *               example: "2024-03-15T10:30:00Z"
 *             metadata:
 *               type: object
 *               example: {"uploadedBy": "user123", "entityType": "pet"}
 */

// =============================================================================
// PET FILE ROUTES
// =============================================================================

/**
 * @swagger
 * /api/files/pets/{petId}:
 *   get:
 *     summary: Get all files for a specific pet
 *     description: Retrieve a list of all files (images, documents) belonging to a specific pet
 *     tags: [Pet Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *         description: Pet ID
 *     responses:
 *       200:
 *         description: Pet files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     petId:
 *                       type: string
 *                       example: "pet123abc"
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: "https://abc123.supabase.co/storage/v1/object/public/pet-images/user123/pet456/profile.jpg"
 *                           path:
 *                             type: string
 *                             example: "user123/pet456/profile.jpg"
 *                           category:
 *                             type: string
 *                             enum: [profile, additional, document]
 *                             example: "profile"
 *                           size:
 *                             type: integer
 *                             example: 245760
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-15T10:30:00Z"
 *                     totalFiles:
 *                       type: integer
 *                       example: 5
 *       403:
 *         description: Access denied - User cannot access files for this pet
 *       404:
 *         description: Pet not found or no files found
 */
router.get(
  '/pets/:petId',
  authenticate,
  setPetContext,
  fileController.listEntityFiles
);

/**
 * @swagger
 * /api/files/pets/{petId}/profile:
 *   post:
 *     summary: Upload pet profile image
 *     description: Upload a single profile image for a specific pet
 *     tags: [Pet Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *         description: Pet ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Pet profile image (JPEG, PNG, WebP, max 5MB)
 *     responses:
 *       201:
 *         description: Pet profile image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 */
router.post(
  '/pets/:petId/profile',
  authenticate,
  uploadSingleImage,
  handleFileUploadError,
  requireFiles,
  setPetContext,
  setCategory('profile'),
  validateFileContext,
  ...fileValidationChain,
  fileController.uploadSingleFile
);

/**
 * @swagger
 * /api/files/pets/{petId}/gallery:
 *   post:
 *     summary: Upload pet gallery images
 *     description: Upload multiple additional images for a pet's gallery
 *     tags: [Pet Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *         description: Pet ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Pet gallery images (max 5 files)
 *     responses:
 *       201:
 *         description: Pet gallery images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultipleFileUploadResponse'
 */
router.post(
  '/pets/:petId/gallery',
  authenticate,
  uploadMultipleImages,
  handleFileUploadError,
  requireFiles,
  setPetContext,
  setCategory('additional'),
  validateFileContext,
  ...fileValidationChain,
  fileController.uploadMultipleFiles
);


/**
 * @swagger
 * /api/files/pets/{petId}/files:
 *   delete:
 *     summary: Delete pet files
 *     description: Delete multiple files belonging to a specific pet
 *     tags: [Pet Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
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
 *               - paths
 *             properties:
 *               paths:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of file paths to delete
 *     responses:
 *       200:
 *         description: Pet files deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileDeleteResponse'
 */
router.delete(
  '/pets/:petId/files',
  authenticate,
  setPetContext,
  fileController.deleteFiles
);

// =============================================================================
// BUSINESS FILE ROUTES
// =============================================================================

/**
 * @swagger
 * /api/files/businesses/{businessId}:
 *   get:
 *     summary: Get all files for a specific business
 *     description: Retrieve a list of all files (images, documents) belonging to a specific business
 *     tags: [Business Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Business files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     businessId:
 *                       type: string
 *                       example: "biz456def"
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: "https://abc123.supabase.co/storage/v1/object/public/business-images/user123/biz456/logo.jpg"
 *                           path:
 *                             type: string
 *                             example: "user123/biz456/logo.jpg"
 *                           category:
 *                             type: string
 *                             enum: [logo, gallery, document]
 *                             example: "logo"
 *                           size:
 *                             type: integer
 *                             example: 512000
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-15T10:30:00Z"
 *                     totalFiles:
 *                       type: integer
 *                       example: 8
 *       403:
 *         description: Access denied - User cannot access files for this business
 *       404:
 *         description: Business not found or no files found
 */
router.get(
  '/businesses/:businessId',
  authenticate,
  setBusinessContext,
  fileController.listEntityFiles
);

/**
 * @swagger
 * /api/files/businesses/{businessId}/logo:
 *   post:
 *     summary: Upload business logo
 *     description: Upload a single logo image for a specific business
 *     tags: [Business Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Business logo (JPEG, PNG, WebP, max 10MB)
 *     responses:
 *       201:
 *         description: Business logo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 */
router.post(
  '/businesses/:businessId/logo',
  authenticate,
  uploadSingleImage,
  handleFileUploadError,
  requireFiles,
  setBusinessContext,
  setCategory('logo'),
  validateFileContext,
  ...fileValidationChain,
  fileController.uploadSingleFile
);

/**
 * @swagger
 * /api/files/businesses/{businessId}/gallery:
 *   post:
 *     summary: Upload business gallery images
 *     description: Upload multiple gallery images for a business
 *     tags: [Business Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Business gallery images (max 5 files)
 *     responses:
 *       201:
 *         description: Business gallery images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultipleFileUploadResponse'
 */
router.post(
  '/businesses/:businessId/gallery',
  authenticate,
  uploadMultipleImages,
  handleFileUploadError,
  requireFiles,
  setBusinessContext,
  setCategory('gallery'),
  validateFileContext,
  ...fileValidationChain,
  fileController.uploadMultipleFiles
);


/**
 * @swagger
 * /api/files/businesses/{businessId}/files:
 *   delete:
 *     summary: Delete business files
 *     description: Delete multiple files belonging to a specific business
 *     tags: [Business Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paths
 *             properties:
 *               paths:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of file paths to delete
 *     responses:
 *       200:
 *         description: Business files deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileDeleteResponse'
 */
router.delete(
  '/businesses/:businessId/files',
  authenticate,
  setBusinessContext,
  fileController.deleteFiles
);

// =============================================================================
// SERVICE FILE ROUTES
// =============================================================================

/**
 * @swagger
 * /api/files/services/{serviceId}:
 *   get:
 *     summary: Get all files for a specific service
 *     description: Retrieve a list of all images belonging to a specific service
 *     tags: [Service Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     serviceId:
 *                       type: string
 *                       example: "svc789xyz"
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: "https://abc123.supabase.co/storage/v1/object/public/service-images/user123/svc789/image.jpg"
 *                           path:
 *                             type: string
 *                             example: "user123/svc789/image.jpg"
 *                           category:
 *                             type: string
 *                             enum: [service-image]
 *                             example: "service-image"
 *                           size:
 *                             type: integer
 *                             example: 380000
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-15T10:30:00Z"
 *                     totalFiles:
 *                       type: integer
 *                       example: 3
 *       403:
 *         description: Access denied - Only business owners can access service files
 *       404:
 *         description: Service not found or no files found
 */
router.get(
  '/services/:serviceId',
  authenticate,
  setServiceContext,
  fileController.listEntityFiles
);

/**
 * @swagger
 * /api/files/services/{serviceId}/image:
 *   post:
 *     summary: Upload service image
 *     description: Upload a single image for a specific service (business-owner only)
 *     tags: [Service Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Service image (JPEG, PNG, WebP, max 5MB)
 *     responses:
 *       201:
 *         description: Service image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       403:
 *         description: Access denied - Only business owners can upload service images
 */
router.post(
  '/services/:serviceId/image',
  authenticate,
  uploadSingleImage,
  handleFileUploadError,
  requireFiles,
  setServiceContext,
  setCategory('service-image'),
  validateFileContext,
  ...fileValidationChain,
  fileController.uploadSingleFile
);

/**
 * @swagger
 * /api/files/services/{serviceId}/files:
 *   delete:
 *     summary: Delete service files
 *     description: Delete multiple files belonging to a specific service (business-owner only)
 *     tags: [Service Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paths
 *             properties:
 *               paths:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of file paths to delete
 *     responses:
 *       200:
 *         description: Service files deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileDeleteResponse'
 *       403:
 *         description: Access denied - Only business owners can delete service files
 */
router.delete(
  '/services/:serviceId/files',
  authenticate,
  setServiceContext,
  fileController.deleteFiles
);

// =============================================================================
// USER FILE ROUTES
// =============================================================================

/**
 * @swagger
 * /api/files/users:
 *   get:
 *     summary: Get all files for the authenticated user
 *     description: Retrieve a list of all files (profile image, documents) belonging to the authenticated user
 *     tags: [User Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "user123xyz"
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: "https://abc123.supabase.co/storage/v1/object/public/user-profiles/user123/profile.jpg"
 *                           path:
 *                             type: string
 *                             example: "user123/profile.jpg"
 *                           category:
 *                             type: string
 *                             enum: [profile, document]
 *                             example: "profile"
 *                           size:
 *                             type: integer
 *                             example: 128000
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-03-15T10:30:00Z"
 *                     totalFiles:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Authentication required
 */
router.get(
  '/users',
  authenticate,
  setUserContext,
  fileController.listEntityFiles
);

/**
 * @swagger
 * /api/files/users/profile:
 *   post:
 *     summary: Upload user profile image
 *     description: Upload a profile image for the authenticated user
 *     tags: [User Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: User profile image (JPEG, PNG, WebP, max 2MB)
 *     responses:
 *       201:
 *         description: User profile image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 */
router.post(
  '/users/profile',
  authenticate,
  uploadSingleImage,
  handleFileUploadError,
  requireFiles,
  setUserContext,
  setCategory('profile'),
  validateFileContext,
  ...fileValidationChain,
  fileController.uploadSingleFile
);


/**
 * @swagger
 * /api/files/users/files:
 *   delete:
 *     summary: Delete user files
 *     description: Delete multiple files belonging to the authenticated user
 *     tags: [User Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paths
 *             properties:
 *               paths:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of file paths to delete
 *     responses:
 *       200:
 *         description: User files deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileDeleteResponse'
 */
router.delete(
  '/users/files',
  authenticate,
  setUserContext,
  fileController.deleteFiles
);

// =============================================================================
// SHARED FILE ROUTES
// =============================================================================

/**
 * @swagger
 * /api/files/shared/signed-url:
 *   get:
 *     summary: Generate temporary signed URL for secure file access
 *     description: Generate a temporary signed URL for any file owned by the authenticated user
 *     tags: [Shared Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pet-images, business-images, user-profiles, documents]
 *         description: Storage bucket name
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Full file path in the bucket
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: integer
 *           minimum: 60
 *           maximum: 86400
 *           default: 3600
 *         description: URL expiration time in seconds
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignedUrlResponse'
 */
router.get('/shared/signed-url', authenticate, fileController.getSignedUrl);

/**
 * @swagger
 * /api/files/shared/metadata:
 *   get:
 *     summary: Retrieve detailed metadata for a specific file
 *     description: Get comprehensive metadata information for any file owned by the authenticated user
 *     tags: [Shared Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pet-images, business-images, user-profiles, documents]
 *         description: Storage bucket name
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Full file path in the bucket
 *     responses:
 *       200:
 *         description: File metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileMetadataResponse'
 */
router.get('/shared/metadata', authenticate, fileController.getFileMetadata);

// =============================================================================
// LEGACY ROUTES (for backward compatibility)
// =============================================================================

/**
 * @deprecated Use specific entity routes instead
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: "[DEPRECATED] Generic file upload - use specific entity routes"
 *     deprecated: true
 *     description: "This endpoint is deprecated. Use /pets/{id}/profile, /businesses/{id}/logo, etc. instead"
 *     tags: ["Deprecated"]
 */
router.post(
  '/upload',
  authenticate,
  uploadSingleImage,
  handleFileUploadError,
  requireFiles,
  validateFileContext,
  ...fileValidationChain,
  fileController.uploadSingleFile
);

/**
 * @deprecated Use specific entity routes instead
 * @swagger
 * /api/files/upload-multiple:
 *   post:
 *     summary: "[DEPRECATED] Generic multiple file upload - use specific entity routes"
 *     deprecated: true
 *     description: "This endpoint is deprecated. Use /pets/{id}/gallery, /businesses/{id}/gallery instead"
 *     tags: ["Deprecated"]
 */
router.post(
  '/upload-multiple',
  authenticate,
  uploadMultipleImages,
  handleFileUploadError,
  requireFiles,
  validateFileContext,
  ...fileValidationChain,
  fileController.uploadMultipleFiles
);

/**
 * @deprecated Use specific entity routes instead
 * @swagger
 * /api/files/upload-document:
 *   post:
 *     summary: "[DEPRECATED] Generic document upload - use specific entity routes"
 *     deprecated: true
 *     description: "This endpoint is deprecated. Use /pets/{id}/documents, /businesses/{id}/documents, etc. instead"
 *     tags: ["Deprecated"]
 */
router.post(
  '/upload-document',
  authenticate,
  uploadDocument,
  handleFileUploadError,
  requireFiles,
  validateFileContext,
  ...fileValidationChain,
  fileController.uploadSingleFile
);

/**
 * @deprecated Use specific entity routes instead
 * @swagger
 * /api/files/delete:
 *   delete:
 *     summary: "[DEPRECATED] Generic file deletion - use specific entity routes"
 *     deprecated: true
 *     description: "This endpoint is deprecated. Use /pets/{id}/files, /businesses/{id}/files, etc. instead"
 *     tags: ["Deprecated"]
 */
router.delete('/delete', authenticate, fileController.deleteFiles);

/**
 * @deprecated Use /shared/signed-url instead
 * @swagger
 * /api/files/signed-url:
 *   get:
 *     summary: "[DEPRECATED] Use /shared/signed-url instead"
 *     deprecated: true
 *     tags: ["Deprecated"]
 */
router.get('/signed-url', authenticate, fileController.getSignedUrl);

/**
 * @deprecated Use /shared/metadata instead
 * @swagger
 * /api/files/metadata:
 *   get:
 *     summary: "[DEPRECATED] Use /shared/metadata instead"
 *     deprecated: true
 *     tags: ["Deprecated"]
 */
router.get('/metadata', authenticate, fileController.getFileMetadata);

export default router;