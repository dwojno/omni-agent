import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';

import type { DrizzleDb } from '../../db/database-drizzle.module.js';
import { teamMembership } from '../../db/schema.js';
import type { Entity, InsertEntity } from '../../db/utils/index.js';
import { InjectDrizzle, Repository } from '../../db/utils/index.js';

export type TeamMembership = Entity<typeof teamMembership>;
export type TeamMembershipInsert = InsertEntity<typeof teamMembership>;

@Injectable()
export class TeamMembershipRepository extends Repository {
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
  }): Promise<TeamMembership> {
    const { userId, teamId, role } = params;
    const tx = this.getTransaction();
    const [row] = await tx
      .insert(teamMembership)
      .values({ userId, teamId, role: role ?? null })
      .returning();
    return row as TeamMembership;
  }

  async removeUserFromTeam(userId: string, teamId: string): Promise<boolean> {
    const tx = this.getTransaction();
    const result = await tx
      .delete(teamMembership)
      .where(and(eq(teamMembership.userId, userId), eq(teamMembership.teamId, teamId)));
    return (result.rowCount ?? 0) > 0;
  }

  async findByUserAndTeam(userId: string, teamId: string): Promise<TeamMembership | null> {
    const tx = this.getTransaction();
    const [row] = await tx
      .select()
      .from(teamMembership)
      .where(and(eq(teamMembership.userId, userId), eq(teamMembership.teamId, teamId)))
      .limit(1);
    return row ?? null;
  }

  async findTeamsByUserId(userId: string): Promise<TeamMembership[]> {
    const tx = this.getTransaction();
    return tx.select().from(teamMembership).where(eq(teamMembership.userId, userId));
  }

  async findUsersByTeamId(teamId: string): Promise<TeamMembership[]> {
    const tx = this.getTransaction();
    return tx.select().from(teamMembership).where(eq(teamMembership.teamId, teamId));
  }

  async setRole(params: {
    userId: string;
    teamId: string;
    role: string | null;
  }): Promise<TeamMembership | null> {
    const { userId, teamId, role } = params;
    const tx = this.getTransaction();
    const [row] = await tx
      .update(teamMembership)
      .set({ role })
      .where(and(eq(teamMembership.userId, userId), eq(teamMembership.teamId, teamId)))
      .returning();
    return row ?? null;
  }
}
