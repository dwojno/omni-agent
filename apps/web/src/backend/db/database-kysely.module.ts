import type {
  DynamicModule,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  Global,
  Module,
} from '@nestjs/common';
import {
  Kysely,
  PostgresDialect,
} from 'kysely';
import pg from 'pg';

import { ConfigFacade } from '../config/config.facade'
import { KYSELY_POOL } from './const.js';
import { DatabaseService } from './database.service.js';
import {
  InjectKysely,
  TransactionManager,
} from './utils/index.js';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Database {
}

const { Pool } = pg;

@Module({})
@Global()
export class DatabaseKyselyModule implements OnApplicationShutdown {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseKyselyModule,
      imports: [],
      providers: [
        {
          provide: KYSELY_POOL,
          inject: [ConfigFacade],
          useFactory: (configFacade: ConfigFacade) => {
            const db = new Kysely<Database>({
              dialect: new PostgresDialect({
                pool: new Pool({
                  connectionString: configFacade.config.databaseUrl,
                  max: 120,
                }),
              }),
            });

            return db;
          },
        },
        DatabaseService,
        TransactionManager,
      ],
      exports: [KYSELY_POOL, TransactionManager, DatabaseService],
    };
  }

  constructor(
    @InjectKysely()
    private readonly db: Kysely<unknown>,
  ) {
  }

  /** Connection to DB should quit as last resource */
  public async onApplicationShutdown() {
    await this.db.destroy();
  }
}
