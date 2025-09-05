import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Company Management API
 * 
 * A comprehensive REST API for managing companies, users, and authentication
 * Built with NestJS, TypeORM, and MySQL
 * 
 * @author Your Name
 * @version 1.0.0
 */

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    // Create NestJS application instance
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Global validation pipeline for request validation and transformation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,        // Strip properties not defined in DTOs
        transform: true,        // Automatically transform payloads to DTO instances
        forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
        transformOptions: {
          enableImplicitConversion: true, // Enable implicit type conversion
        },
      }),
    );

    // Enable response transformation using class-transformer
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    // Configure CORS for cross-origin requests
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:3002'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      optionsSuccessStatus: 200,
    });

    // Swagger API documentation setup
    const config = new DocumentBuilder()
      .setTitle('Company Management API')
      .setDescription(`
        A comprehensive REST API for managing companies, users, and authentication.
        
        ## Features
        - User authentication and authorization with JWT
        - Company management with hierarchical relationships
        - User profile management
        - Account management
        - Comprehensive API documentation with Swagger
        
        ## Authentication
        Most endpoints require authentication. Use the \`/auth/login\` endpoint to obtain a JWT token,
        then include it in the Authorization header as \`Bearer <token>\`.
      `)
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Users', 'User management operations')
      .addTag('Companies', 'Company management operations')
      .addTag('Accounts', 'Account management operations')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    // Get port from environment or default to 3000
    const port = process.env.PORT || 3000;
    
    // Start the server
    await app.listen(port);
    
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation: http://localhost:${port}/api`);
    logger.log(`🏥 Health Check: http://localhost:${port}/health`);
    
  } catch (error) {
    logger.error('❌ Error starting the application:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap();
