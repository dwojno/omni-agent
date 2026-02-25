import type {
  DynamicModule,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  Global,
  Module,
} from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { ConfigFacade } from '../config/config.facade.js';
import { DRIZZLE_DB, DRIZZLE_CONNECTION } from './const.js';
import { schema, type AppSchema } from './schema.js';
import { DatabaseService } from './database.service.js';
import {
  TransactionManager,
} from './utils/index.js';

const { Pool } = pg;

/** Schema-typed DB: use for full type safety (db.select(), db.query.*, etc.). */
export type DrizzleDb = NodePgDatabase<AppSchema>;

@Module({})
@Global()
export class DatabaseDrizzleModule implements OnApplicationShutdown {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseDrizzleModule,
      imports: [],
      providers: [
        {
          provide: DRIZZLE_CONNECTION,
          useFactory: (configFacade: ConfigFacade) => {
            const pool = new Pool({
              connectionString: configFacade.config.databaseUrl,
              max: 120,
            });
            const db = drizzle({ client: pool }, { schema }) as DrizzleDb;
            return { pool, db };
          },
          inject: [ConfigFacade],
        },
        {
          provide: DRIZZLE_DB,
          useFactory: (conn: { pool: pg.Pool; db: DrizzleDb }) => conn.db,
          inject: [DRIZZLE_CONNECTION],
        },
        DatabaseService,
        TransactionManager,
      ],
      exports: [DRIZZLE_DB, TransactionManager, DatabaseService],
    };
  }

  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly conn: { pool: pg.Pool; db: DrizzleDb },
  ) {}

  /** Connection to DB should quit as last resource */
  public async onApplicationShutdown() {
    await this.conn.pool.end();
  }
}
