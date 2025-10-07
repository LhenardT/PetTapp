import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler';
import { config, isDevelopment } from './config/env';

// Import routes first
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import petRoutes from './routes/pets';
import businessRoutes from './routes/businesses';
import serviceRoutes from './routes/services';
import bookingRoutes from './routes/bookings';
import adminRoutes from './routes/admin';
import fileRoutes from './routes/files';
import addressRoutes from './routes/addresses';

const app = express();

app.use(helmet());

app.use(cors({
  origin: config.CORS_ORIGIN ? config.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(morgan(isDevelopment ? 'dev' : 'combined'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/pets', petRoutes);
app.use('/businesses', businessRoutes);
app.use('/services', serviceRoutes);
app.use('/bookings', bookingRoutes);
app.use('/admin', adminRoutes);
app.use('/api/files', fileRoutes);
app.use('/addresses', addressRoutes);

// Use automatic swagger generation
import { swaggerSpec } from './config/swagger';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: object
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: config.NODE_ENV,
      PORT: config.PORT,
      MONGODB_URI: config.MONGODB_URI,
      MONGODB_NAME: config.MONGODB_NAME,
      API_URL: config.API_URL,
      CORS_ORIGIN: config.CORS_ORIGIN,
      LOG_LEVEL: config.LOG_LEVEL,
      JWT_SECRET: config.JWT_SECRET.substring(0, 4) + '...' // Only show first 4 chars for security
    }
  });
});

app.use(errorHandler);

export default app;