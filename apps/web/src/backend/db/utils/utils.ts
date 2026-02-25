import { Inject } from '@nestjs/common';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';

import { DRIZZLE_DB } from '../const.js';
import type { DrizzleDb } from '../database-drizzle.module.js';
import type { TransactionHooks } from './hook-manager.js';

export const InjectDrizzle = (): ParameterDecorator => Inject(DRIZZLE_DB);

/** Row type when selecting from a table. Use: Entity<typeof myTable> */
export type Entity<T extends PgTable> = InferSelectModel<T>;

/** Row type when inserting into a table. Use: InsertEntity<typeof myTable> */
export type InsertEntity<T extends PgTable> = InferInsertModel<T>;

/** Re-export for convenience (e.g. partial selects, custom shapes). */
export type { InferSelectModel, InferInsertModel };

export type DbAsyncStorage<T = DrizzleDb> = {
  transaction?: T;
  transactionId?: string;
  hooks?: TransactionHooks;
};

export class Repository {
  constructor(
    @InjectDrizzle()
    protected db: DrizzleDb,
    protected clsService: ClsService<DbAsyncStorage>,
  ) { }

  protected getTransaction(): DrizzleDb {
    return this.clsService.get('transaction') ?? this.db;
  }
}

