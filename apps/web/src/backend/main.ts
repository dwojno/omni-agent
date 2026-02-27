import 'server-only';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { ConfigFacade } from './config/config.facade.js';
import { IamFacade } from './iam/facades/iam.facade.js';
import { ConversationFacade } from './conversation/conversation.facade.js';

export async function bootstrapBackend() {
  const app = await NestFactory.createApplicationContext(
    AppModule,
  );

  app.enableShutdownHooks();

  return {
    close: () => app.close(),
    configFacade: app.get(ConfigFacade),
    iamFacade: app.get(IamFacade),
    conversationFacade: app.get(ConversationFacade),
  };
}
