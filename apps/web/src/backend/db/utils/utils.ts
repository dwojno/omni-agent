import { Inject } from '@nestjs/common';
import {
  type Generated,
  type JSONColumnType,
  Kysely,
  type SelectQueryBuilder,
  Transaction,
} from 'kysely';
import { ClsService } from 'nestjs-cls';

import { isNotNullable } from '../../common/functions.js';
import { KYSELY_POOL } from '../const.js';
import type { TransactionHooks } from './hook-manager.js';

export const InjectKysely = (): ParameterDecorator => Inject(KYSELY_POOL);

/**
 * Table definition usually contains "Generated" field,
 * but the result from query is stripped of that.
 * So to not create new type just use Entity<TableMatch> or something,
 * that will strip that as well.
 */
export type Entity<T> = {
  [K in keyof T]: T[K] extends JSONColumnType<infer R> ? R : T[K] extends Generated<infer R> ? R : T[K];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DbAsyncStorage<T extends Transaction<any> = Transaction<any>> = {
  transaction?: T;
  transactionId?: string;
  hooks?: TransactionHooks;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Repository<T extends Kysely<any>> {
  constructor(
    @InjectKysely()
    protected db: T,
    protected clsService: ClsService<DbAsyncStorage<Transaction<T>>>,
  ) { }

  protected getTransaction(): T {
    return this.clsService.get('transaction') ?? this.db;
  }
}

export function withPagination<DB, TB extends keyof DB, O>(params: {
  query: SelectQueryBuilder<DB, TB, O>;
  offset?: number;
  limit?: number;
}) {
  const { offset, limit } = params;
  let query = params.query;

  if (isNotNullable(offset)) {
    query = query.offset(offset);
  }
  if (isNotNullable(limit)) {
    query = query.limit(limit);
  }

  return query;
}
