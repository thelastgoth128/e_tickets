import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('UNIMA Event Manager API')
    .setDescription('The UNIMA Event Manager API description. \n\n**Note on Authentication:**\nThis specification does not implement actual authentication logic. Access control requirements (e.g., "Buyer only", "Organizer only") are documented in the endpoint descriptions.')
    .setVersion('1.0')
    .addTag('events')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  await app.listen(3004);
}
bootstrap();
