import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './core/interceptors/response/response.interceptor';
import { getLoggerConfig } from './core/config/logger.config';
// import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: getLoggerConfig().enabled ? getLoggerConfig().levels : false,
  });
  // app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableCors();
  // Apply global interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Unleashed-YMS API')
    .setDescription('Unleashed YMS API description')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
