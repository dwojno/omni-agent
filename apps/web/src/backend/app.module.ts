import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module.js';
import { DatabaseDrizzleModule } from './db/database-drizzle.module.js';
import { IamModule } from './iam/iam.module.js';
import { ClsModule } from 'nestjs-cls';
import { ConversationModule } from './conversation/conversation.module.js';

@Module({
  imports: [
    ConfigModule,
    DatabaseDrizzleModule.forRoot(),
    ClsModule.forRoot({
      global: true,
    }),
    IamModule,
    ConversationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
