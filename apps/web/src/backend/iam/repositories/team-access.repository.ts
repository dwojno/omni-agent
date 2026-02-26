import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';

import type { DrizzleDb } from '../../db/database-drizzle.module.js';
import { teamAccess } from '../../db/schema.js';
import type { Entity, InsertEntity } from '../../db/utils/index.js';
import { InjectDrizzle, Repository } from '../../db/utils/index.js';

export type TeamAccess = Entity<typeof teamAccess>;
export type TeamAccessInsert = InsertEntity<typeof teamAccess>;

@Injectable()
export class TeamAccessRepository extends Repository {
  constructor(
    @InjectDrizzle() db: DrizzleDb,
    clsService: ClsService,
  ) {
    super(db, clsService);
  }

  async addUserToTeam(params: {
    userId: string;
    teamId: string;
    role?: string;
  }): Promise<TeamAccess> {
    const { userId, teamId, role } = params;
    const tx = this.getTransaction();
    const [row] = await tx
      .insert(teamAccess)
      .values({ userId, teamId, role: role ?? null })
      .returning();
    return row as TeamAccess;
  }

  async removeUserFromTeam(userId: string, teamId: string): Promise<boolean> {
    const tx = this.getTransaction();
    const result = await tx
      .delete(teamAccess)
      .where(and(eq(teamAccess.userId, userId), eq(teamAccess.teamId, teamId)));
    return (result.rowCount ?? 0) > 0;
  }

  async findByUserAndTeam(userId: string, teamId: string): Promise<TeamAccess | null> {
    const tx = this.getTransaction();
    const [row] = await tx
      .select()
      .from(teamAccess)
      .where(and(eq(teamAccess.userId, userId), eq(teamAccess.teamId, teamId)))
      .limit(1);
    return row ?? null;
  }

  async findTeamsByUserId(userId: string): Promise<TeamAccess[]> {
    const tx = this.getTransaction();
    return tx.select().from(teamAccess).where(eq(teamAccess.userId, userId));
  }

  async findUsersByTeamId(teamId: string): Promise<TeamAccess[]> {
    const tx = this.getTransaction();
    return tx.select().from(teamAccess).where(eq(teamAccess.teamId, teamId));
  }

  async setRole(params: {
    userId: string;
    teamId: string;
    role: string | null;
  }): Promise<TeamAccess | null> {
    const { userId, teamId, role } = params;
    const tx = this.getTransaction();
    const [row] = await tx
      .update(teamAccess)
      .set({ role })
      .where(and(eq(teamAccess.userId, userId), eq(teamAccess.teamId, teamId)))
      .returning();
    return row ?? null;
  }
}
