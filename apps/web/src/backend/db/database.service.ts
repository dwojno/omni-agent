import { Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';

import type { DrizzleDb } from './database-drizzle.module.js';
import { InjectDrizzle } from './utils/index.js';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectDrizzle()
    private readonly db: DrizzleDb,
  ) {}

  public async isHealthy(): Promise<boolean> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Runs callback with all checks disabled (like foreign key constraint check)
   * https://stackoverflow.com/a/49584660
   */
  public async runWithoutChecks<T>(cb: () => Promise<T>) {
    await this.db.execute(sql`SET session_replication_role = 'replica'`);
    const result = await cb();
    await this.db.execute(sql`SET session_replication_role = 'origin'`);
    return result;
  }

  public getConnection(): DrizzleDb {
    return this.db;
  }
}
