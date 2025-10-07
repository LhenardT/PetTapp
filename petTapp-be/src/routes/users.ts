import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  deleteAccount,
  changePassword,
  updateNotificationPreferences,
  updateLocationPreferences
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { requireAnyRole } from '../middleware/roleAuth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: User ID
 *             email:
 *               type: string
 *               format: email
 *               example: "john@example.com"
 *             firstName:
 *               type: string
 *               example: "John"
 *             middleName:
 *               type: string
 *               example: "Michael"
 *             lastName:
 *               type: string
 *               example: "Doe"
 *             suffix:
 *               type: string
 *               example: "Jr."
 *             role:
 *               type: string
 *               enum: [pet-owner, business-owner, admin]
 *               example: "pet-owner"
 *             isActive:
 *               type: boolean
 *               example: true
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *         profile:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             userId:
 *               type: string
 *             contactNumber:
 *               type: string
 *               pattern: '^(\+63|0)[0-9]{10}$'
 *               example: "+639123456789"
 *             profilePicture:
 *               type: string
 *               description: URL to profile picture
 *               example: "https://example.com/avatar.jpg"
 *             preferences:
 *               type: object
 *               properties:
 *                 notifications:
 *                   $ref: '#/components/schemas/NotificationPreferences'
 *                 location:
 *                   $ref: '#/components/schemas/LocationPreferences'
 *             lastLoginAt:
 *               type: string
 *               format: date-time
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *     NotificationPreferences:
 *       type: object
 *       properties:
 *         email:
 *           type: boolean
 *           default: true
 *           example: true
 *         sms:
 *           type: boolean
 *           default: false
 *           example: false
 *         push:
 *           type: boolean
 *           default: true
 *           example: true
 *     LocationPreferences:
 *       type: object
 *       properties:
 *         allowLocationAccess:
 *           type: boolean
 *           default: false
 *           example: true
 *         defaultSearchRadius:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           description: Default search radius in kilometers
 *           example: 15
 *     ProfileUpdateRequest:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *               maxLength: 50
 *               example: "John"
 *             middleName:
 *               type: string
 *               maxLength: 50
 *               example: "Michael"
 *             lastName:
 *               type: string
 *               maxLength: 50
 *               example: "Doe"
 *             suffix:
 *               type: string
 *               maxLength: 10
 *               example: "Jr."
 *             email:
 *               type: string
 *               format: email
 *               example: "john.doe@example.com"
 *         profile:
 *           type: object
 *           properties:
 *             contactNumber:
 *               type: string
 *               pattern: '^(\+63|0)[0-9]{10}$'
 *               example: "+639123456789"
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: "currentPassword123!"
 *         newPassword:
 *           type: string
 *           minLength: 8
 *           pattern: '^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$'
 *           description: 'Must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character'
 *           example: "newPassword123!"
 */

router.use(authenticate);
router.use(requireAnyRole);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     description: |
 *       Retrieves the complete profile information for the authenticated user.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ✅ Can view own profile only
 *       - 🏢 **Business Owner**: ✅ Can view own profile only
 *       - 👑 **Admin**: ✅ Can view own profile only
 *
 *       **🔒 Access Level:** Self-profile access only
 *       **📊 Data Included:** User info, profile details, preferences, emergency contacts
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     description: |
 *       Updates user profile information with validation.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ✅ Can update own profile only
 *       - 🏢 **Business Owner**: ✅ Can update own profile only
 *       - 👑 **Admin**: ✅ Can update own profile only
 *
 *       **🔒 Access Level:** Self-profile modification only
 *       **⚙️ Updatable Fields:** Name (firstName, middleName, lastName, suffix), email, contact number
 *       **📸 Profile Picture:** Use separate file upload endpoint for profile pictures
 *       **📍 Addresses:** Use separate addresses endpoint for managing multiple addresses
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication required
 */
router.put('/profile', updateProfile);

/**
 * @swagger
 * /users/account:
 *   delete:
 *     summary: Delete user account
 *     description: |
 *       Soft deletes the user account by setting isActive to false.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ✅ Can delete own account only
 *       - 🏢 **Business Owner**: ✅ Can delete own account only
 *       - 👑 **Admin**: ✅ Can delete own account only
 *
 *       **⚠️ Warning:** This action cannot be undone
 *       **📄 Side Effects:** Associated pets, businesses, and bookings will be deactivated
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully
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
 *                   example: "Account deactivated successfully"
 *       401:
 *         description: Authentication required
 */
router.delete('/account', authenticate, deleteAccount);

/**
 * @swagger
 * /users/change-password:
 *   patch:
 *     summary: Change user password
 *     description: |
 *       Changes the user's password with security verification.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ✅ Can change own password only
 *       - 🏢 **Business Owner**: ✅ Can change own password only
 *       - 👑 **Admin**: ✅ Can change own password only
 *
 *       **🔒 Security Requirements:**
 *       - Must provide current password for verification
 *       - New password must meet strength requirements
 *       - All user sessions will be invalidated after password change
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: "Password changed successfully"
 *       400:
 *         description: Current password is incorrect or validation error
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
 *                   example: "Current password is incorrect"
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.patch('/change-password', changePassword);

/**
 * @swagger
 * /users/notifications:
 *   patch:
 *     summary: Update notification preferences
 *     description: |
 *       Updates user's notification preferences for different channels.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ✅ Can update own notification preferences
 *       - 🏢 **Business Owner**: ✅ Can update own notification preferences
 *       - 👑 **Admin**: ✅ Can update own notification preferences
 *
 *       **📧 Notification Types:** Email, SMS, Push notifications
 *       **⚙️ Preferences:** Enable/disable each notification type independently
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 $ref: '#/components/schemas/NotificationPreferences'
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
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
 *                   example: "Notification preferences updated successfully"
 *                 data:
 *                   type: object
 *                   description: Updated user profile with new preferences
 *       401:
 *         description: Authentication required
 */
router.patch('/notifications', updateNotificationPreferences);

/**
 * @swagger
 * /users/location-preferences:
 *   patch:
 *     summary: Update location preferences
 *     description: |
 *       Updates user's location-based preferences and search settings.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ✅ Can update own location preferences
 *       - 🏢 **Business Owner**: ✅ Can update own location preferences
 *       - 👑 **Admin**: ✅ Can update own location preferences
 *
 *       **📍 Location Settings:**
 *       - Location access permission (enable/disable GPS)
 *       - Default search radius (1-100 km)
 *       - Privacy controls for location sharing
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 $ref: '#/components/schemas/LocationPreferences'
 *     responses:
 *       200:
 *         description: Location preferences updated successfully
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
 *                   example: "Location preferences updated successfully"
 *                 data:
 *                   type: object
 *                   description: Updated user profile with new preferences
 *       401:
 *         description: Authentication required
 */
router.patch('/location-preferences', updateLocationPreferences);

export default router;