import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module.js';
import { DatabaseKyselyModule } from './db/database-kysely.module.js';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [ConfigModule, DatabaseKyselyModule.forRoot(), ClsModule.forRoot({
    global: true,
  })],
  controllers: [],
  providers: [],
})
export class AppModule { }
