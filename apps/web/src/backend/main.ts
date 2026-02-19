import 'server-only';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { ConfigFacade } from './config/config.facade.js';

export async function bootstrapBackend() {
  const app = await NestFactory.createApplicationContext(
    AppModule,
  );

  app.enableShutdownHooks()

  return {
    close: () => app.close(),
    configFacade: app.get(ConfigFacade),
  }

}
