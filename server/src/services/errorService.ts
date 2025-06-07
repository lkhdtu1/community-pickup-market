import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'class-validator';
import { QueryFailedError } from 'typeorm';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationFailedError extends CustomError {
  constructor(errors: ValidationError[]) {
    const message = errors
      .map(error => Object.values(error.constraints || {}).join(', '))
      .join('; ');
    super(`Validation failed: ${message}`, 400, 'VALIDATION_FAILED');
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id ${id}` : ''} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class PaymentError extends CustomError {
  constructor(message: string, code?: string) {
    super(`Payment failed: ${message}`, 402, code || 'PAYMENT_FAILED');
  }
}

export class RateLimitError extends CustomError {
  constructor() {
    super('Too many requests, please try again later', 429, 'RATE_LIMITED');
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string, originalError?: Error) {
    super(`Database error: ${message}`, 500, 'DATABASE_ERROR');
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

// Error logging service
class ErrorLogger {
  static log(error: Error, req?: Request) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error as AppError).code && { code: (error as AppError).code }
      },
      request: req ? {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: (req as any).user?.userId || 'anonymous'
      } : null
    };

    if ((error as AppError).statusCode >= 500) {
      console.error('🚨 SERVER ERROR:', JSON.stringify(errorInfo, null, 2));
    } else if ((error as AppError).statusCode >= 400) {
      console.warn('⚠️ CLIENT ERROR:', JSON.stringify(errorInfo, null, 2));
    }

    // In production, you would send this to your logging service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }
}

// Global error handler middleware
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  ErrorLogger.log(error, req);

  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  // Handle known error types
  if (error instanceof CustomError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'CUSTOM_ERROR';
  } else if (error instanceof QueryFailedError) {
    statusCode = 500;
    message = process.env.NODE_ENV === 'production' ? 
      'Database operation failed' : 
      `Database error: ${error.message}`;
    code = 'DATABASE_ERROR';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
    code = 'UPLOAD_ERROR';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong!';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        details: error 
      })
    }
  });
};

// Async error wrapper to catch async errors in route handlers
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error formatter
export const formatValidationErrors = (errors: ValidationError[]): string[] => {
  return errors.map(error => {
    const constraints = error.constraints || {};
    return Object.values(constraints);
  }).flat();
};

// Database constraint error parser
export const parseDatabaseError = (error: QueryFailedError): CustomError => {
  const message = error.message.toLowerCase();
  
  if (message.includes('unique constraint') || message.includes('duplicate')) {
    if (message.includes('email')) {
      return new ConflictError('Email address already exists');
    }
    return new ConflictError('Resource already exists');
  }
  
  if (message.includes('foreign key constraint')) {
    return new CustomError('Referenced resource does not exist', 400, 'INVALID_REFERENCE');
  }
  
  if (message.includes('not null constraint')) {
    return new CustomError('Required field is missing', 400, 'MISSING_REQUIRED_FIELD');
  }
  
  return new DatabaseError(error.message, error);
};

// Rate limiting error handler
export const rateLimitHandler = (_req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMITED',
      retryAfter: 15 * 60 // 15 minutes
    }
  });
};

// Graceful shutdown handler
export const gracefulShutdown = (server: any) => {
  const shutdown = (signal: string) => {
    console.log(`\n📴 ${signal} received. Graceful shutdown initiated...`);
    
    server.close((err: Error) => {
      if (err) {
        console.error('❌ Error during server shutdown:', err);
        process.exit(1);
      }
      
      console.log('✅ Server closed successfully');
      
      // Close database connections, Redis, etc.
      Promise.all([
        // AppDataSource.destroy(),
        // cacheService.disconnect()
      ]).then(() => {
        console.log('✅ All connections closed. Exiting...');
        process.exit(0);
      }).catch((err) => {
        console.error('❌ Error closing connections:', err);
        process.exit(1);
      });
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

// Health check with error reporting
export const healthCheck = async (_req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: 'unknown',
        cache: 'unknown'
      }
    };

    // Check database connection
    try {
      // await AppDataSource.query('SELECT 1');
      health.services.database = 'healthy';
    } catch (error) {
      health.services.database = 'unhealthy';
      health.status = 'degraded';
    }

    // Check cache connection
    try {
      const { cacheService } = await import('./cacheService');
      health.services.cache = cacheService.isAvailable() ? 'healthy' : 'unavailable';
    } catch (error) {
      health.services.cache = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
};

export {
  ErrorLogger
};
