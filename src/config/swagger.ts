
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { githubPatPaths } from '../Swagger/swaggerGithub';
import { authPaths } from '../Swagger/swaggerAuth';


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'env0-lite-backend API',
      version: '1.0.0',
      description: 'API documentation for env0-lite-backend',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    paths: {
      ...githubPatPaths,
      ...authPaths,
    },
  },
  apis: [], // No controller JSDoc scanning needed
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
