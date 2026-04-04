import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();
  
  // ==================== HEALTH CHECK (hidden from Swagger) ==================== 
  app.getHttpAdapter().get('/health', (req, res) => { 
    res.json({ status: 'OK', service: 'order' }); 
  });

  // ==================== SWAGGER ====================
  const config = new DocumentBuilder()
    .setTitle('Order Service API')
    .setDescription('Order management for Sportshop')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  app.getHttpAdapter().get('/api-docs/json', (req, res) => {
    res.json(document);
  });
  SwaggerModule.setup('api-docs', app, document);
  
  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`🚀 Order service running on port ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
}
bootstrap();
