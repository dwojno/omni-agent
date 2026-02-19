import 'server-only';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { AppService } from './app.service.js';

export async function bootstrapBackend() {
  const app = await NestFactory.createApplicationContext(
    AppModule,
  );

  return {
    close: () => app.close(),
    appService: app.get(AppService, { strict: false })
  }

}
