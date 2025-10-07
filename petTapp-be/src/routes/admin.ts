import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getPendingBusinesses,
  verifyBusiness,
  getSystemMetrics
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleAuth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardStats:
 *       type: object
 *       properties:
 *         overview:
 *           type: object
 *           properties:
 *             totalUsers:
 *               type: integer
 *               example: 1250
 *             totalBusinesses:
 *               type: integer
 *               example: 89
 *             totalBookings:
 *               type: integer
 *               example: 3420
 *             totalPets:
 *               type: integer
 *               example: 2150
 *             totalServices:
 *               type: integer
 *               example: 245
 *             pendingBookings:
 *               type: integer
 *               example: 45
 *             unverifiedBusinesses:
 *               type: integer
 *               example: 12
 *             completedBookings:
 *               type: integer
 *               example: 2890
 *         analytics:
 *           type: object
 *           properties:
 *             usersByRole:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "pet-owner"
 *                   count:
 *                     type: integer
 *                     example: 1050
 *             businessesByType:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "veterinary"
 *                   count:
 *                     type: integer
 *                     example: 25
 *             bookingsByStatus:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "completed"
 *                   count:
 *                     type: integer
 *                     example: 2890
 *         recentActivity:
 *           type: object
 *           properties:
 *             recentBookings:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Recent booking activity with populated references
 *     AdminUsersList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               role:
 *                 type: string
 *                 enum: [pet-owner, business-owner, admin]
 *                 example: "pet-owner"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             pages:
 *               type: integer
 *     UserStatusUpdate:
 *       type: object
 *       required:
 *         - isActive
 *       properties:
 *         isActive:
 *           type: boolean
 *           example: false
 *           description: Set to false to deactivate user, true to activate
 *     SystemMetrics:
 *       type: object
 *       properties:
 *         newUsers:
 *           type: integer
 *           example: 45
 *           description: Number of new users in the specified date range
 *         newBusinesses:
 *           type: integer
 *           example: 8
 *           description: Number of new businesses in the specified date range
 *         newBookings:
 *           type: integer
 *           example: 234
 *           description: Number of new bookings in the specified date range
 *         totalRevenue:
 *           type: number
 *           example: 125000
 *           description: Total revenue from completed bookings in the specified date range
 *     PendingBusiness:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         businessName:
 *           type: string
 *           example: "Happy Paws Veterinary Clinic"
 *         businessType:
 *           type: string
 *           enum: [veterinary, grooming, boarding, daycare, training, pet-shop, other]
 *           example: "veterinary"
 *         ownerId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             firstName:
 *               type: string
 *               example: "John"
 *             lastName:
 *               type: string
 *               example: "Doe"
 *             email:
 *               type: string
 *               format: email
 *               example: "john@example.com"
 *         contactInfo:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *             phone:
 *               type: string
 *         address:
 *           type: object
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
 *         credentials:
 *           type: object
 *           properties:
 *             licenseNumber:
 *               type: string
 *             certifications:
 *               type: array
 *               items:
 *                 type: string
 *         isVerified:
 *           type: boolean
 *           default: false
 *         isActive:
 *           type: boolean
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 */

router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     description: |
 *       Retrieves comprehensive dashboard statistics for system overview.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ❌ No access
 *       - 👑 **Admin**: ✅ Full access - Complete system oversight
 *
 *       **📊 Dashboard Metrics:**
 *       - User counts by role and status
 *       - Business statistics and verification status
 *       - Booking analytics and status distribution
 *       - Revenue and performance metrics
 *       - Recent system activity
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.get('/dashboard', getDashboardStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     description: |
 *       Retrieves a paginated list of all users in the system with advanced filtering.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ❌ No access
 *       - 👑 **Admin**: ✅ Full access - View all user accounts
 *
 *       **🔍 Search & Filter Options:**
 *       - Filter by role (pet-owner, business-owner, admin)
 *       - Filter by status (active/inactive)
 *       - Search by name or email
 *       - Pagination support
 *     tags: [Admin]
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
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [pet-owner, business-owner, admin]
 *         description: Filter by user role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by user status (active/inactive)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in firstName, lastName, or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminUsersList'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /admin/users/{userId}/status:
 *   patch:
 *     summary: Update user status
 *     description: |
 *       Updates a user's active status with system-wide effects.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ❌ No access
 *       - 👑 **Admin**: ✅ Full access - Activate/deactivate any user
 *
 *       **📋 Side Effects:**
 *       - Deactivated users cannot login
 *       - User's businesses and services become inactive
 *       - Existing bookings remain but no new bookings allowed
 *       - User data is preserved for reactivation
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserStatusUpdate'
 *     responses:
 *       200:
 *         description: User status updated successfully
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
 *                   example: "User deactivated successfully"
 *                 data:
 *                   type: object
 *                   description: Updated user object without sensitive data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.patch('/users/:userId/status', updateUserStatus);

/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete user
 *     description: |
 *       Soft deletes a user account and all associated data.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ❌ No access
 *       - 👑 **Admin**: ✅ Full access - Delete any non-admin user
 *
 *       **⚠️ Restrictions:**
 *       - Cannot delete admin users (safety measure)
 *       - This is a soft delete - data is preserved but marked inactive
 *       - Associated pets, businesses, and bookings are also deactivated
 *       - Action cannot be undone easily
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: "User deleted successfully"
 *       400:
 *         description: Cannot delete admin users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot delete admin users"
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: User not found
 */
router.delete('/users/:userId', deleteUser);

/**
 * @swagger
 * /admin/businesses/pending:
 *   get:
 *     summary: Get pending business verifications
 *     description: |
 *       Retrieves businesses awaiting verification with owner information.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ❌ No access
 *       - 👑 **Admin**: ✅ Full access - View all pending verifications
 *
 *       **📋 Verification Data:**
 *       - Business details and credentials
 *       - Owner information
 *       - License numbers and certifications
 *       - Registration timestamps
 *       - Contact information for verification
 *     tags: [Admin]
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
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Pending businesses retrieved successfully
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
 *                     $ref: '#/components/schemas/PendingBusiness'
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
 *         description: Admin privileges required
 */
router.get('/businesses/pending', getPendingBusinesses);

/**
 * @swagger
 * /admin/businesses/{businessId}/verify:
 *   patch:
 *     summary: Verify business
 *     description: |
 *       Verifies a business after credential validation.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ❌ No access
 *       - 👑 **Admin**: ✅ Full access - Verify any business
 *
 *       **📋 Verification Effects:**
 *       - Business appears in public listings
 *       - Services become bookable by pet owners
 *       - Owner can start accepting bookings
 *       - Business gains verified badge
 *       - Notification sent to business owner
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: Business ID to verify
 *     responses:
 *       200:
 *         description: Business verified successfully
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
 *                   example: "Business verified successfully"
 *                 data:
 *                   type: object
 *                   description: Updated business object
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Business not found
 */
router.patch('/businesses/:businessId/verify', verifyBusiness);

/**
 * @swagger
 * /admin/metrics:
 *   get:
 *     summary: Get system metrics
 *     description: |
 *       Retrieves system performance metrics for specified date ranges.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ❌ No access
 *       - 🏢 **Business Owner**: ❌ No access
 *       - 👑 **Admin**: ✅ Full access - System performance monitoring
 *
 *       **📊 Available Metrics:**
 *       - New user registrations by date range
 *       - New business registrations
 *       - Booking volume and trends
 *       - Revenue calculations from completed bookings
 *       - System performance indicators
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for metrics calculation (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for metrics calculation (YYYY-MM-DD)
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: System metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SystemMetrics'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.get('/metrics', getSystemMetrics);

export default router;