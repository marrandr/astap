import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {SwaggerModule, DocumentBuilder} from "@nestjs/swagger"
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true,
      forbidNonWhitelisted:true,
      transform:true,
      transformOptions:{enableImplicitConversion:true}
    })
  )
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  const config = new DocumentBuilder()
  .setTitle("ERP HONEY")
  .setDescription('API complète Hamarino')
    .setVersion('2.0')
    .addBearerAuth()
    .build()
    ;
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
  await app.listen(process.env.PORT ?? 3000);
  console.log('Server running on http://localhost:3001');
  console.log('Swagger docs on http://localhost:3001/api');
}
bootstrap();
