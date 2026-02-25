import {
  Global,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ClsService } from 'nestjs-cls';

import type { DrizzleDb } from '../database-drizzle.module.js';
import type { TransactionHooks } from './hook-manager.js';
import { HookManager } from './hook-manager.js';
import {
  type DbAsyncStorage,
  InjectDrizzle,
} from './utils.js';

@Injectable()
@Global()
export class TransactionManager {
  constructor(
    @InjectDrizzle()
    private db: DrizzleDb,
    private clsService: ClsService<DbAsyncStorage<DrizzleDb>>,
  ) {}

  public async withTransaction<T>(cb: () => Promise<T>, opt?: { reuse: boolean }): Promise<T> {
    if (opt?.reuse && this.isInTransaction()) {
      return cb();
    }

    const hookManager = new HookManager();
    const result = await this.db.transaction(async (tx) => {
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

  public getTransaction(): DrizzleDb {
    return this.clsService.get('transaction') ?? this.db;
  }

  public onAfterTransactionCommit(callback: Parameters<TransactionHooks['onAfterCommit']>[0]) {
    const hooks = this.clsService.get('hooks');
    if (hooks === undefined) {
      throw new Error('Transaction hooks are not set!');
    }
    hooks.onAfterCommit(callback);
  }

  private saveTransactionInStore(tx: DrizzleDb, hooks: TransactionHooks) {
    this.clsService.set('transaction', tx);
    this.clsService.set('hooks', hooks);
    this.clsService.set('transactionId', randomUUID());
  }
}
