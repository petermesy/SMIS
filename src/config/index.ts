import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
  dbUrl: process.env.DATABASE_URL || '',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15'),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
};


console.log('Backend JWT Secret in use:', config.jwtSecret);