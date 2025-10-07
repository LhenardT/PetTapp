import { Router } from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  addBookingRating
} from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';
import { requireAnyRole, requirePetOwnerOrAdmin } from '../middleware/roleAuth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - petOwnerId
 *         - businessId
 *         - serviceId
 *         - petId
 *         - appointmentDateTime
 *         - duration
 *         - totalAmount
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the booking
 *         petOwnerId:
 *           type: string
 *           description: ID of the pet owner
 *         businessId:
 *           type: string
 *           description: ID of the business
 *         serviceId:
 *           type: string
 *           description: ID of the service being booked
 *         petId:
 *           type: string
 *           description: ID of the pet
 *         appointmentDateTime:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00.000Z"
 *         duration:
 *           type: number
 *           minimum: 15
 *           description: Duration in minutes
 *           example: 60
 *         status:
 *           type: string
 *           enum: [pending, confirmed, in-progress, completed, cancelled, no-show]
 *           default: pending
 *           example: "pending"
 *         totalAmount:
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
 *               default: "PHP"
 *               example: "PHP"
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, refunded, failed]
 *           default: pending
 *           example: "pending"
 *         paymentMethod:
 *           type: string
 *           enum: [cash, gcash, credit-card, debit-card]
 *           example: "gcash"
 *         notes:
 *           type: string
 *           maxLength: 500
 *           example: "Please call when you arrive"
 *         specialRequests:
 *           type: string
 *           maxLength: 300
 *           example: "Pet is nervous around loud noises"
 *         cancellationReason:
 *           type: string
 *           maxLength: 200
 *           example: "Emergency came up"
 *         rating:
 *           type: object
 *           properties:
 *             score:
 *               type: number
 *               minimum: 1
 *               maximum: 5
 *               example: 4
 *             review:
 *               type: string
 *               maxLength: 500
 *               example: "Great service, very professional staff"
 *             reviewDate:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     BookingInput:
 *       type: object
 *       required:
 *         - serviceId
 *         - petId
 *         - appointmentDateTime
 *       properties:
 *         serviceId:
 *           type: string
 *           description: ID of the service being booked
 *           example: "507f1f77bcf86cd799439011"
 *         petId:
 *           type: string
 *           description: ID of the pet
 *           example: "507f1f77bcf86cd799439012"
 *         appointmentDateTime:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00.000Z"
 *         notes:
 *           type: string
 *           maxLength: 500
 *           example: "Please call when you arrive"
 *         specialRequests:
 *           type: string
 *           maxLength: 300
 *           example: "Pet is nervous around loud noises"
 *         paymentMethod:
 *           type: string
 *           enum: [cash, gcash, credit-card, debit-card]
 *           example: "gcash"
 *     BookingStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, confirmed, in-progress, completed, cancelled, no-show]
 *           example: "confirmed"
 *         cancellationReason:
 *           type: string
 *           maxLength: 200
 *           description: Required when status is 'cancelled'
 *           example: "Emergency came up"
 *     BookingRating:
 *       type: object
 *       required:
 *         - score
 *       properties:
 *         score:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 4
 *         review:
 *           type: string
 *           maxLength: 500
 *           example: "Great service, very professional staff"
 */

router.use(authenticate);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     description: |
 *       Creates a new booking for a service with availability validation.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ✅ Can create bookings for own pets only
 *       - 🏢 **Business Owner**: ❌ No access
 *       - 👑 **Admin**: ✅ Can create bookings for any user
 *
 *       **🔒 Restrictions:**
 *       - Pet owners can only book services for pets they own
 *       - Admins can create bookings for any user by specifying petOwnerId
 *       - System validates service availability and time slot conflicts
 *       - Service must be active and from a verified business
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingInput'
 *     responses:
 *       201:
 *         description: Booking created successfully
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
 *                   example: "Booking created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error or time slot already booked
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
 *                   example: "Time slot already booked"
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied - can only book for own pets
 *       404:
 *         description: Service or pet not found
 */
router.post('/', requirePetOwnerOrAdmin, createBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get bookings
 *     description: |
 *       Retrieves bookings with role-based filtering.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ✅ Can view own bookings only
 *       - 🏢 **Business Owner**: ✅ Can view bookings for own businesses only
 *       - 👑 **Admin**: ✅ Can view all bookings in the system
 *
 *       **📊 Data Filtering:**
 *       - Pet owners: Only bookings where they are the pet owner
 *       - Business owners: Only bookings for their registered businesses
 *       - Admins: All bookings with optional filtering by businessId/petOwnerId
 *     tags: [Bookings]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, in-progress, completed, cancelled, no-show]
 *         description: Filter by booking status
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: string
 *         description: Filter by business ID (admin only)
 *       - in: query
 *         name: petOwnerId
 *         schema:
 *           type: string
 *         description: Filter by pet owner ID (admin only)
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
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
 *                     $ref: '#/components/schemas/Booking'
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
router.get('/', requireAnyRole, getBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     description: |
 *       Retrieves a specific booking by ID with detailed information.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ✅ Can view own bookings only
 *       - 🏢 **Business Owner**: ✅ Can view bookings for own businesses only
 *       - 👑 **Admin**: ✅ Can view any booking
 *
 *       **🔒 Access Control:**
 *       - Pet owners: Only if they are the booking owner
 *       - Business owners: Only if booking is for their business
 *       - Admins: Unrestricted access to any booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Booking not found
 */
router.get('/:id', requireAnyRole, getBookingById);

/**
 * @swagger
 * /bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     description: |
 *       Updates the status of a booking with role-based permissions.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: 🔒 Limited access - Can only cancel own bookings
 *       - 🏢 **Business Owner**: ✅ Can update bookings for own businesses (confirm, in-progress, completed, no-show)
 *       - 👑 **Admin**: ✅ Full access - Can update any booking to any status
 *
 *       **🔒 Status Transitions:**
 *       - Pet owners: pending → cancelled only
 *       - Business owners: pending → confirmed → in-progress → completed/no-show
 *       - Admins: Any status to any status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingStatusUpdate'
 *     responses:
 *       200:
 *         description: Booking status updated successfully
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
 *                   example: "Booking status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid status or insufficient permissions for status change
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Booking not found
 */
router.patch('/:id/status', requireAnyRole, updateBookingStatus);

/**
 * @swagger
 * /bookings/{id}/rating:
 *   patch:
 *     summary: Add rating and review to booking
 *     description: |
 *       Adds a rating and review to a completed booking.
 *
 *       **👥 Role Access:**
 *       - 🐕 **Pet Owner**: ✅ Can rate own completed bookings only
 *       - 🏢 **Business Owner**: ❌ No access
 *       - 👑 **Admin**: ✅ Can add ratings for any user (testing/moderation purposes)
 *
 *       **🔒 Restrictions:**
 *       - Pet owners can only rate bookings where they are the owner
 *       - Booking must be in 'completed' status to be rated
 *       - Each booking can only be rated once
 *       - Rating updates business average rating and review count
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingRating'
 *     responses:
 *       200:
 *         description: Rating added successfully
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
 *                   example: "Rating added successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Can only rate completed bookings
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied - can only rate own bookings
 *       404:
 *         description: Booking not found
 */
router.patch('/:id/rating', requirePetOwnerOrAdmin, addBookingRating);

export default router;