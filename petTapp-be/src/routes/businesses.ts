import { Router } from 'express';
import {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  searchBusinesses
} from '../controllers/businessController';
import { authenticate } from '../middleware/auth';
import { requireBusinessOwnerOrAdmin, requireAdmin, requireAnyRole } from '../middleware/roleAuth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Business:
 *       type: object
 *       required:
 *         - businessName
 *         - businessType
 *         - contactInfo
 *         - address
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the business
 *         ownerId:
 *           type: string
 *           description: ID of the business owner
 *         businessName:
 *           type: string
 *           maxLength: 100
 *           example: "Happy Paws Veterinary Clinic"
 *         businessType:
 *           type: string
 *           enum: [veterinary, grooming, boarding, daycare, training, pet-shop, other]
 *           example: "veterinary"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           example: "Full-service veterinary clinic providing comprehensive pet care"
 *         contactInfo:
 *           type: object
 *           required:
 *             - email
 *             - phone
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               example: "info@happypaws.com"
 *             phone:
 *               type: string
 *               example: "+639123456789"
 *             website:
 *               type: string
 *               example: "https://happypaws.com"
 *         address:
 *           type: object
 *           required:
 *             - street
 *             - city
 *             - state
 *             - zipCode
 *             - country
 *           properties:
 *             street:
 *               type: string
 *               example: "123 Pet Street"
 *             city:
 *               type: string
 *               example: "Manila"
 *             state:
 *               type: string
 *               example: "Metro Manila"
 *             zipCode:
 *               type: string
 *               example: "1000"
 *             country:
 *               type: string
 *               default: "Philippines"
 *               example: "Philippines"
 *             coordinates:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                   minimum: -90
 *                   maximum: 90
 *                   example: 14.5995
 *                 longitude:
 *                   type: number
 *                   minimum: -180
 *                   maximum: 180
 *                   example: 120.9842
 *         businessHours:
 *           type: object
 *           properties:
 *             monday:
 *               $ref: '#/components/schemas/DaySchedule'
 *             tuesday:
 *               $ref: '#/components/schemas/DaySchedule'
 *             wednesday:
 *               $ref: '#/components/schemas/DaySchedule'
 *             thursday:
 *               $ref: '#/components/schemas/DaySchedule'
 *             friday:
 *               $ref: '#/components/schemas/DaySchedule'
 *             saturday:
 *               $ref: '#/components/schemas/DaySchedule'
 *             sunday:
 *               $ref: '#/components/schemas/DaySchedule'
 *         credentials:
 *           type: object
 *           properties:
 *             licenseNumber:
 *               type: string
 *               example: "VET-2023-001"
 *             certifications:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["AVMA Certified", "Small Animal Specialist"]
 *             insuranceInfo:
 *               type: string
 *               example: "Professional liability insurance active"
 *         ratings:
 *           type: object
 *           properties:
 *             averageRating:
 *               type: number
 *               minimum: 0
 *               maximum: 5
 *               example: 4.5
 *             totalReviews:
 *               type: integer
 *               minimum: 0
 *               example: 127
 *         isVerified:
 *           type: boolean
 *           default: false
 *         isActive:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     DaySchedule:
 *       type: object
 *       properties:
 *         open:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           example: "09:00"
 *         close:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           example: "17:00"
 *         isOpen:
 *           type: boolean
 *           example: true
 *     BusinessInput:
 *       type: object
 *       required:
 *         - businessName
 *         - businessType
 *         - contactInfo
 *         - address
 *       properties:
 *         businessName:
 *           type: string
 *           maxLength: 100
 *           example: "Happy Paws Veterinary Clinic"
 *         businessType:
 *           type: string
 *           enum: [veterinary, grooming, boarding, daycare, training, pet-shop, other]
 *           example: "veterinary"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           example: "Full-service veterinary clinic providing comprehensive pet care"
 *         contactInfo:
 *           type: object
 *           required:
 *             - email
 *             - phone
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *             phone:
 *               type: string
 *             website:
 *               type: string
 *         address:
 *           type: object
 *           required:
 *             - street
 *             - city
 *             - state
 *             - zipCode
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zipCode:
 *               type: string
 *             country:
 *               type: string
 *               default: "Philippines"
 *             coordinates:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                   minimum: -90
 *                   maximum: 90
 *                 longitude:
 *                   type: number
 *                   minimum: -180
 *                   maximum: 180
 *         businessHours:
 *           type: object
 *         credentials:
 *           type: object
 *           properties:
 *             licenseNumber:
 *               type: string
 *             certifications:
 *               type: array
 *               items:
 *                 type: string
 *             insuranceInfo:
 *               type: string
 */

/**
 * @swagger
 * /businesses/search:
 *   get:
 *     summary: Search businesses by location and filters
 *     description: |
 *       Search for businesses based on location coordinates, business type, and other filters.
 *
 *       **👥 Role Access:**
 *       - 🌐 **Public**: ✅ Full access - No authentication required
 *       - 🐕 **Pet Owner**: ✅ Full access - Find services for pets
 *       - 🏢 **Business Owner**: ✅ Full access - Research competition
 *       - 👑 **Admin**: ✅ Full access - System oversight
 *
 *       **🔒 Access Level:** Public (No authentication required)
 *     tags: [Businesses]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude for location-based search
 *         example: 14.5995
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude for location-based search
 *         example: 120.9842
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Search radius in kilometers
 *       - in: query
 *         name: businessType
 *         schema:
 *           type: string
 *           enum: [veterinary, grooming, boarding, daycare, training, pet-shop, other]
 *         description: Filter by business type
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
 *         description: Businesses found successfully
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
 *                     $ref: '#/components/schemas/Business'
 */
router.get('/search', searchBusinesses);

/**
 * @swagger
 * /businesses:
 *   get:
 *     summary: Get businesses
 *     description: |
 *       Retrieves businesses with filtering options.
 *
 *       **👥 Role Access:**
 *       - 🌐 **Public**: ✅ Full access - Browse verified businesses
 *       - 🐕 **Pet Owner**: ✅ Full access - Find service providers
 *       - 🏢 **Business Owner**: ✅ Full access - View own and competitors
 *       - 👑 **Admin**: ✅ Full access - System management
 *
 *       **🔒 Access Level:** Public (No authentication required)
 *       **📊 Data Filtering:** Shows only verified and active businesses to public users
 *     tags: [Businesses]
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
 *         name: businessType
 *         schema:
 *           type: string
 *           enum: [veterinary, grooming, boarding, daycare, training, pet-shop, other]
 *         description: Filter by business type
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in business name and description
 *     responses:
 *       200:
 *         description: Businesses retrieved successfully
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
 *                     $ref: '#/components/schemas/Business'
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
router.get('/', getBusinesses);

/**
 * @swagger
 * /businesses/{id}:
 *   get:
 *     summary: Get business by ID
 *     description: |
 *       Retrieves a specific business by ID with detailed information.
 *
 *       **👥 Role Access:**
 *       - 🌐 **Public**: ✅ Full access - View business details
 *       - 🐕 **Pet Owner**: ✅ Full access - Research service providers
 *       - 🏢 **Business Owner**: ✅ Full access - View business profiles
 *       - 👑 **Admin**: ✅ Full access - System oversight
 *
 *       **🔒 Access Level:** Public (No authentication required)
 *     tags: [Businesses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Business retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Business'
 *       404:
 *         description: Business not found
 */
router.get('/:id', getBusinessById);

router.use(authenticate);

/**
 * @swagger
 * /businesses:
 *   post:
 *     summary: Register a new business
 *     description: |
 *       Creates a new business profile for the authenticated user.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ✅ Can register businesses for themselves
 *       - 👑 **Admin**: ✅ Can register businesses for any user
 *
 *       **🔒 Restrictions:**
 *       - Business owners can only register businesses linked to their own account
 *       - Admins can register businesses for any user by specifying ownerId
 *       - All new businesses require admin verification before appearing in public listings
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusinessInput'
 *     responses:
 *       201:
 *         description: Business created successfully
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
 *                   example: "Business created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Business'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', requireBusinessOwnerOrAdmin, createBusiness);

/**
 * @swagger
 * /businesses/{id}:
 *   put:
 *     summary: Update business profile
 *     description: |
 *       Updates a business profile with new information.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ✅ Can update own businesses only
 *       - 👑 **Admin**: ✅ Can update any business
 *
 *       **🔒 Restrictions:**
 *       - Business owners can only update businesses they own
 *       - Admins can update any business in the system
 *       - Verification status may reset if certain fields are modified
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BusinessInput'
 *     responses:
 *       200:
 *         description: Business updated successfully
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
 *                   example: "Business updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Business'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Business not found
 */
router.put('/:id', requireBusinessOwnerOrAdmin, updateBusiness);

/**
 * @swagger
 * /businesses/{id}:
 *   delete:
 *     summary: Delete business profile
 *     description: |
 *       Soft deletes a business profile (sets isActive to false).
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ✅ Can delete own businesses only
 *       - 👑 **Admin**: ✅ Can delete any business
 *
 *       **🔒 Restrictions:**
 *       - Business owners can only delete businesses they own
 *       - Admins can delete any business in the system
 *       - This is a soft delete - business data is preserved but marked inactive
 *       - Associated services will also be deactivated
 *     tags: [Businesses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID
 *     responses:
 *       200:
 *         description: Business deleted successfully
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
 *                   example: "Business deleted successfully"
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Business not found
 */
router.delete('/:id', requireBusinessOwnerOrAdmin, deleteBusiness);

export default router;