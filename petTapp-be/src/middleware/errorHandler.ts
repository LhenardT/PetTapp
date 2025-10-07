import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodIssue } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

export const errorHandler = (
  error: AppError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors: ValidationErrorDetail[] = error.issues.map((err: ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));

    console.error('Validation Error:', {
      path: req.path,
      method: req.method,
      errors: validationErrors
    });

    res.status(422).json({
      error: 'Validation failed',
      message: 'Invalid input data',
      details: validationErrors
    });
    return;
  }

  // Handle custom app errors
  const statusCode = (error as AppError).statusCode || 500;
  const message = error.message || 'Internal Server Error';

  console.error('Error:', {
    statusCode,
    message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : message,
    message: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};

export const createError = (message: string, statusCode = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};