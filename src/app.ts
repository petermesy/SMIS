import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use(
  rateLimit({
    windowMs: config.rateLimitWindow * 60 * 1000,
    max: config.rateLimitMax,
  })
);

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'SMIS API',
      version: '1.0.0',
      description: 'School Management Information System API',
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:4000'],
  credentials: true // if you use cookies/auth
}));

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.use(errorHandler);

export default app;
