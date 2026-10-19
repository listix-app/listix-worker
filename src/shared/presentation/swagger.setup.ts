import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger';

export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Listix Worker API')
    .setDescription(
      'REST API for the Listix collaborative shopping list service',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Provide the JWT access token received from /api/v1/auth/anonymous or /api/v1/auth/refresh',
      },
      'access-token',
    )
    .addTag('auth', 'Anonymous authentication and session refresh')
    .addTag('lists', 'Shopping list management and synchronization')
    .addTag('items', 'Shopping list item operations')
    .addTag('members', 'List membership and role management')
    .addTag('invites', 'Invitation management and joining lists')
    .addTag('health', 'Service health check')
    .addTag('public-web', 'Public web landing pages')
    .build();
}

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  return SwaggerModule.createDocument(app, buildSwaggerConfig());
}

export function setupSwagger(app: INestApplication): void {
  const document = createSwaggerDocument(app);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Listix Worker API Docs',
  });
}
