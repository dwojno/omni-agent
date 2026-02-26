import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';

import type { DrizzleDb } from '../../db/database-drizzle.module.js';
import { user } from '../../db/schema.js';
import type { Entity, InsertEntity } from '../../db/utils/index.js';
import { InjectDrizzle, Repository } from '../../db/utils/index.js';

export type User = Entity<typeof user>;
export type UserInsert = InsertEntity<typeof user>;

@Injectable()
export class UserRepository extends Repository {
  constructor(
    @InjectDrizzle() db: DrizzleDb,
    clsService: ClsService,
  ) {
    super(db, clsService);
  }

  async create(data: UserInsert): Promise<User> {
    const tx = this.getTransaction();
    const [row] = await tx.insert(user).values(data).returning();
    return row as User;
  }

  async findById(id: string): Promise<User | null> {
    const tx = this.getTransaction();
    const [row] = await tx.select().from(user).where(eq(user.id, id)).limit(1);
    return row ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const tx = this.getTransaction();
    const [row] = await tx.select().from(user).where(eq(user.email, email)).limit(1);
    return row ?? null;
  }

  async update(id: string, data: Partial<Omit<UserInsert, 'id'>>): Promise<User | null> {
    const tx = this.getTransaction();
    const [row] = await tx
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();
    return row ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const tx = this.getTransaction();
    const result = await tx.delete(user).where(eq(user.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}
