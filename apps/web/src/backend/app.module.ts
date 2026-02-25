import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module.js';
import { DatabaseDrizzleModule } from './db/database-drizzle.module.js';
import { IamModule } from './iam/iam.module.js';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ConfigModule,
    DatabaseDrizzleModule.forRoot(),
    ClsModule.forRoot({
      global: true,
    }),
    IamModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
