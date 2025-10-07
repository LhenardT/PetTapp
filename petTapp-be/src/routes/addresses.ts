import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as addressController from '../controllers/addressController';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Address ID
 *         userId:
 *           type: string
 *           description: User ID
 *         label:
 *           type: string
 *           description: Address label (e.g., Home, Work)
 *           maxLength: 50
 *         street:
 *           type: string
 *           description: Street address
 *           maxLength: 200
 *         city:
 *           type: string
 *           description: City
 *           maxLength: 100
 *         state:
 *           type: string
 *           description: State/Province
 *           maxLength: 100
 *         zipCode:
 *           type: string
 *           description: ZIP/Postal code
 *           maxLength: 20
*         country:
 *           type: string
 *           description: Country
 *           default: Philippines
 *         latitude:
 *           type: number
 *           description: Latitude coordinate for map integration
 *           minimum: -90
 *           maximum: 90
 *         longitude:
 *           type: number
 *           description: Longitude coordinate for map integration
 *           minimum: -180
 *           maximum: 180
 *         isDefault:
 *           type: boolean
 *           description: Whether this is the default address
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - label
 *         - street
 *         - city
 *         - state
 *         - zipCode
 *         - country
 *
 *     AddressCreateRequest:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *           example: Home
 *         street:
 *           type: string
 *           example: 123 Main Street, Apartment 4B
 *         city:
 *           type: string
 *           example: Quezon City
 *         state:
 *           type: string
 *           example: Metro Manila
 *         zipCode:
 *           type: string
 *           example: "1100"
*         country:
 *           type: string
 *           example: Philippines
 *         latitude:
 *           type: number
 *           example: 14.5995
 *           description: Latitude for map integration (e.g., 14.5995 for Quezon City)
 *         longitude:
 *           type: number
 *           example: 120.9842
 *           description: Longitude for map integration (e.g., 120.9842 for Quezon City)
 *         isDefault:
 *           type: boolean
 *           example: false
 *       required:
 *         - label
 *         - street
 *         - city
 *         - state
 *         - zipCode
 *         - country
 *
 *     AddressUpdateRequest:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *         street:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         zipCode:
 *           type: string
*         country:
 *           type: string
 *         latitude:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         longitude:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         isDefault:
 *           type: boolean
 */

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Get all addresses for the authenticated user
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
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
 *                     $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, addressController.getAddresses);

/**
 * @swagger
 * /addresses/{id}:
 *   get:
 *     summary: Get a specific address by ID
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, addressController.getAddressById);

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressCreateRequest'
 *     responses:
 *       201:
 *         description: Address created successfully
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
 *                   example: Address created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, addressController.createAddress);

/**
 * @swagger
 * /addresses/{id}:
 *   put:
 *     summary: Update an existing address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressUpdateRequest'
 *     responses:
 *       200:
 *         description: Address updated successfully
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
 *                   example: Address updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticate, addressController.updateAddress);

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
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
 *                   example: Address deleted successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticate, addressController.deleteAddress);

/**
 * @swagger
 * /addresses/{id}/set-default:
 *   patch:
 *     summary: Set an address as default
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Default address updated successfully
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
 *                   example: Default address updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/set-default', authenticate, addressController.setDefaultAddress);

export default router;
