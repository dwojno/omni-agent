import { Injectable } from '@nestjs/common';
import {
  Kysely,
  sql,
} from 'kysely';

import { InjectKysely } from './utils/index.js';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectKysely()
    private readonly db: Kysely<unknown>,
  ) { }

  public async isHealthy(): Promise<boolean> {
    try {
      await sql`SELECT 1`.execute(this.db);
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
    await sql`SET session_replication_role = 'replica'`.execute(this.db);
    const result = await cb();
    await sql`SET session_replication_role = 'origin'`.execute(this.db);
    return result;
  }

  public getConnection() {
    return this.db;
  }
}
