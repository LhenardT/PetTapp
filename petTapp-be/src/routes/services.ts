import { Router } from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getServicesByBusiness,
  getServiceCategories
} from '../controllers/serviceController';
import { authenticate } from '../middleware/auth';
import { requireBusinessOwnerOrAdmin } from '../middleware/roleAuth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - businessId
 *         - name
 *         - category
 *         - description
 *         - duration
 *         - price
 *         - availability
 *         - requirements
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the service
 *         businessId:
 *           type: string
 *           description: ID of the business offering this service
 *         name:
 *           type: string
 *           maxLength: 100
 *           example: "Pet Vaccination"
 *         category:
 *           type: string
 *           enum: [veterinary, grooming, boarding, daycare, training, emergency, consultation, other]
 *           example: "veterinary"
 *         description:
 *           type: string
 *           maxLength: 500
 *           example: "Complete vaccination package for dogs and cats"
 *         duration:
 *           type: number
 *           minimum: 15
 *           maximum: 1440
 *           description: Duration in minutes
 *           example: 60
 *         price:
 *           type: object
 *           required:
 *             - amount
 *             - currency
 *           properties:
 *             amount:
 *               type: number
 *               minimum: 0
 *               example: 1500
 *             currency:
 *               type: string
 *               enum: [PHP, USD]
 *               default: "PHP"
 *               example: "PHP"
 *         availability:
 *           type: object
 *           properties:
 *             days:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               example: ["monday", "tuesday", "wednesday", "thursday", "friday"]
 *             timeSlots:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                     example: "09:00"
 *                   end:
 *                     type: string
 *                     pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                     example: "17:00"
 *         requirements:
 *           type: object
 *           properties:
 *             petTypes:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [dog, cat, bird, fish, rabbit, hamster, guinea-pig, reptile, other]
 *               example: ["dog", "cat"]
 *             ageRestrictions:
 *               type: object
 *               properties:
 *                 minAge:
 *                   type: number
 *                   minimum: 0
 *                 maxAge:
 *                   type: number
 *                   maximum: 30
 *             healthRequirements:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Current health certificate", "No fever"]
*             specialNotes:
 *               type: string
 *               maxLength: 300
 *               example: "Pet must be calm and well-behaved"
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               minimum: -90
 *               maximum: 90
 *               description: Latitude coordinate for location-based search
 *               example: 14.5995
 *             longitude:
 *               type: number
 *               minimum: -180
 *               maximum: 180
 *               description: Longitude coordinate for location-based search
 *               example: 120.9842
 *         isActive:
 *           type: boolean
 *           default: true
 *         imageUrl:
 *           type: string
 *           nullable: true
 *           description: URL of the service image
 *           example: "https://abc123.supabase.co/storage/v1/object/public/service-images/user123/svc789/service-image_1234567890_uuid123_image.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ServiceInput:
 *       type: object
 *       required:
 *         - businessId
 *         - name
 *         - category
 *         - description
 *         - duration
 *         - price
 *         - availability
 *         - requirements
 *       properties:
 *         businessId:
 *           type: string
 *           description: ID of the business offering this service
 *         name:
 *           type: string
 *           maxLength: 100
 *           example: "Pet Vaccination"
 *         category:
 *           type: string
 *           enum: [veterinary, grooming, boarding, daycare, training, emergency, consultation, other]
 *           example: "veterinary"
 *         description:
 *           type: string
 *           maxLength: 500
 *           example: "Complete vaccination package for dogs and cats"
 *         duration:
 *           type: number
 *           minimum: 15
 *           maximum: 1440
 *           description: Duration in minutes
 *           example: 60
 *         price:
 *           type: object
 *           required:
 *             - amount
 *             - currency
 *           properties:
 *             amount:
 *               type: number
 *               minimum: 0
 *               example: 1500
 *             currency:
 *               type: string
 *               enum: [PHP, USD]
 *               default: "PHP"
 *               example: "PHP"
 *         availability:
 *           type: object
 *           properties:
 *             days:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *               example: ["monday", "tuesday", "wednesday", "thursday", "friday"]
 *             timeSlots:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                     example: "09:00"
 *                   end:
 *                     type: string
 *                     pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                     example: "17:00"
 *         requirements:
 *           type: object
 *           properties:
 *             petTypes:
 *               type: array
 *               items:
 *                 type: string
 *                 enum: [dog, cat, bird, fish, rabbit, hamster, guinea-pig, reptile, other]
 *               example: ["dog", "cat"]
 *             ageRestrictions:
 *               type: object
 *               properties:
 *                 minAge:
 *                   type: number
 *                   minimum: 0
 *                 maxAge:
 *                   type: number
 *                   maximum: 30
 *             healthRequirements:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Current health certificate", "No fever"]
*             specialNotes:
 *               type: string
 *               maxLength: 300
 *               example: "Pet must be calm and well-behaved"
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               minimum: -90
 *               maximum: 90
 *               description: Latitude coordinate for location-based search
 *               example: 14.5995
 *             longitude:
 *               type: number
 *               minimum: -180
 *               maximum: 180
 *               description: Longitude coordinate for location-based search
 *               example: 120.9842
 */

/**
 * @swagger
 * /services/categories:
 *   get:
 *     summary: Get all service categories
 *     description: |
 *       Retrieves the list of all available service categories.
 *
 *       **👥 Role Access:**
 *       - 🌐 **Public**: ✅ Full access - View available service categories
 *       - 🐕 **Pet Owner**: ✅ Full access - Browse service categories
 *       - 🏢 **Business Owner**: ✅ Full access - View service categories
 *       - 👑 **Admin**: ✅ Full access - System oversight
 *
 *       **🔒 Access Level:** Public (No authentication required)
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                     type: string
 *                   example: ["veterinary", "grooming", "boarding", "daycare", "training", "emergency", "consultation", "other"]
 */
router.get('/categories', getServiceCategories);

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get services
 *     description: |
 *       Retrieves services with filtering options.
 *
 *       **👥 Role Access:**
 *       - 🌐 **Public**: ✅ Full access - Browse available services
 *       - 🐕 **Pet Owner**: ✅ Full access - Find services for pets
 *       - 🏢 **Business Owner**: ✅ Full access - Research services and pricing
 *       - 👑 **Admin**: ✅ Full access - System oversight
 *
 *       **🔒 Access Level:** Public (No authentication required)
 *       **📊 Data Filtering:** Shows only active services from verified businesses
 *     tags: [Services]
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
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: string
 *         description: Filter by business ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [veterinary, grooming, boarding, daycare, training, emergency, consultation, other]
 *         description: Filter by service category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in service name and description
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
*       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price filter
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: User's current latitude (required with longitude and radius for location-based search)
 *         example: 14.5995
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: User's current longitude (required with latitude and radius for location-based search)
 *         example: 120.9842
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Search radius in kilometers (required with latitude and longitude)
 *         example: 10
 *     responses:
 *       200:
 *         description: Services retrieved successfully
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
 *                     $ref: '#/components/schemas/Service'
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
 */
router.get('/', getServices);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get service by ID
 *     description: |
 *       Retrieves a specific service by ID with detailed business information.
 *
 *       **👥 Role Access:**
 *       - 🌐 **Public**: ✅ Full access - View service details
 *       - 🐕 **Pet Owner**: ✅ Full access - Service research before booking
 *       - 🏢 **Business Owner**: ✅ Full access - View service details
 *       - 👑 **Admin**: ✅ Full access - System oversight
 *
 *       **🔒 Access Level:** Public (No authentication required)
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 */
router.get('/:id', getServiceById);

/**
 * @swagger
 * /services/business/{businessId}:
 *   get:
 *     summary: Get services by business
 *     description: |
 *       Retrieves all services offered by a specific business.
 *
 *       **👥 Role Access:**
 *       - 🌐 **Public**: ✅ Full access - Browse business services
 *       - 🐕 **Pet Owner**: ✅ Full access - View services from specific providers
 *       - 🏢 **Business Owner**: ✅ Full access - Research competitor services
 *       - 👑 **Admin**: ✅ Full access - System oversight
 *
 *       **🔒 Access Level:** Public (No authentication required)
 *       **📊 Data Filtering:** Shows only active services
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
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
 *         description: Services retrieved successfully
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
 *                     $ref: '#/components/schemas/Service'
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
 */
router.get('/business/:businessId', getServicesByBusiness);

router.use(authenticate);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     description: |
 *       Creates a new service for a business.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ✅ Can create services for own businesses only
 *       - 👑 **Admin**: ✅ Can create services for any business
 *
 *       **🔒 Restrictions:**
 *       - Business owners can only create services for businesses they own
 *       - Admins can create services for any business by specifying businessId
 *       - Service must be linked to a verified business
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       201:
 *         description: Service created successfully
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
 *                   example: "Service created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Business not found
 */
router.post('/', requireBusinessOwnerOrAdmin, createService);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update service
 *     description: |
 *       Updates a service with new information.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ✅ Can update services for own businesses only
 *       - 👑 **Admin**: ✅ Can update any service
 *
 *       **🔒 Restrictions:**
 *       - Business owners can only update services for businesses they own
 *       - Admins can update any service in the system
 *       - Service changes may affect existing bookings
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       200:
 *         description: Service updated successfully
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
 *                   example: "Service updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Service not found
 */
router.put('/:id', requireBusinessOwnerOrAdmin, updateService);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete service
 *     description: |
 *       Soft deletes a service (sets isActive to false).
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ✅ Can delete services for own businesses only
 *       - 👑 **Admin**: ✅ Can delete any service
 *
 *       **🔒 Restrictions:**
 *       - Business owners can only delete services for businesses they own
 *       - Admins can delete any service in the system
 *       - This is a soft delete - service data is preserved but marked inactive
 *       - Existing bookings for this service will remain but no new bookings allowed
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
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
 *                   example: "Service deleted successfully"
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Service not found
 */
router.delete('/:id', requireBusinessOwnerOrAdmin, deleteService);

export default router;