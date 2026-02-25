import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';

import type { DrizzleDb } from '../../db/database-drizzle.module.js';
import { users } from '../../db/schema.js';
import type { Entity, InsertEntity } from '../../db/utils/index.js';
import { InjectDrizzle, Repository } from '../../db/utils/index.js';

export type User = Entity<typeof users>;
export type UserInsert = InsertEntity<typeof users>;

@Injectable()
export class UsersRepository extends Repository {
  constructor(
    @InjectDrizzle() db: DrizzleDb,
    clsService: ClsService,
  ) {
    super(db, clsService);
  }

  async create(data: UserInsert): Promise<User> {
    const tx = this.getTransaction();
    const [row] = await tx.insert(users).values(data).returning();
    return row as User;
  }

  async findById(id: string): Promise<User | null> {
    const tx = this.getTransaction();
    const [row] = await tx.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const tx = this.getTransaction();
    const [row] = await tx.select().from(users).where(eq(users.email, email)).limit(1);
    return row ?? null;
  }

  async update(id: string, data: Partial<Omit<UserInsert, 'id'>>): Promise<User | null> {
    const tx = this.getTransaction();
    const [row] = await tx
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return row ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const tx = this.getTransaction();
    const result = await tx.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}
