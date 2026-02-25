import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module.js';
import { DatabaseDrizzleModule } from './db/database-drizzle.module.js';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ConfigModule,
    DatabaseDrizzleModule.forRoot(),
    ClsModule.forRoot({
      global: true,
    })],
  controllers: [],
  providers: [],
})
export class AppModule { }
