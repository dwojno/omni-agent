import {
  Global,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  Kysely,
  Transaction,
} from 'kysely';
import { ClsService } from 'nestjs-cls';

import type { TransactionHooks } from './hook-manager.js';
import { HookManager } from './hook-manager.js';
import {
  type DbAsyncStorage,
  InjectKysely,
} from './utils.js';

@Injectable()
@Global()
export class TransactionManager {
  constructor(
    @InjectKysely()
    private db: Kysely<unknown>,
    private clsService: ClsService<DbAsyncStorage>,
  ) { }

  public async withTransaction<T>(cb: () => Promise<T>, opt?: { reuse: boolean }): Promise<T> {
    if (opt?.reuse && this.isInTransaction()) {
      return cb();
    }

    const hookManager = new HookManager();
    const result = await this.db.transaction().execute(async (tx) => {
      return await this.clsService.run(async () => {
        this.saveTransactionInStore(tx, hookManager);

        return await cb();
      });
    });
    await hookManager.executeAfterCommitCallbacks();

    return result;
  }

  public isInTransaction(): boolean {
    return Boolean(this.clsService.get('transaction'));
  }

  public getTransaction(): Kysely<unknown> {
    return this.clsService.get('transaction') ?? this.db;
  }

  public onAfterTransactionCommit(callback: Parameters<TransactionHooks['onAfterCommit']>[0]) {
    const hooks = this.clsService.get('hooks');
    if (hooks === undefined) {
      throw new Error('Transaction hooks are not set!');
    }
    hooks.onAfterCommit(callback);
  }

  private saveTransactionInStore(tx: Transaction<unknown>, hooks: TransactionHooks) {
    this.clsService.set('transaction', tx);
    this.clsService.set('hooks', hooks);
    this.clsService.set('transactionId', randomUUID());
  }
}
