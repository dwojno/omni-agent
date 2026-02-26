import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';

import type { DrizzleDb } from '../../db/database-drizzle.module.js';
import { team } from '../../db/schema.js';
import type { Entity, InsertEntity } from '../../db/utils/index.js';
import { InjectDrizzle, Repository } from '../../db/utils/index.js';

export type Team = Entity<typeof team>;
export type TeamInsert = InsertEntity<typeof team>;

@Injectable()
export class TeamRepository extends Repository {
  constructor(
    @InjectDrizzle() db: DrizzleDb,
    clsService: ClsService,
  ) {
    super(db, clsService);
  }

  async create(data: TeamInsert): Promise<Team> {
    const tx = this.getTransaction();
    const [row] = await tx.insert(team).values(data).returning();
    return row as Team;
  }

  async findById(id: string): Promise<Team | null> {
    const tx = this.getTransaction();
    const [row] = await tx.select().from(team).where(eq(team.id, id)).limit(1);
    return row ?? null;
  }

  async update(id: string, data: Partial<Omit<TeamInsert, 'id'>>): Promise<Team | null> {
    const tx = this.getTransaction();
    const [row] = await tx
      .update(team)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(team.id, id))
      .returning();
    return row ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const tx = this.getTransaction();
    const result = await tx.delete(team).where(eq(team.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}
