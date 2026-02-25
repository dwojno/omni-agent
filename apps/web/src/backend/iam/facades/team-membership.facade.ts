import { Injectable } from '@nestjs/common';

import { TeamMembershipRepository } from '../repositories/team-membership.repository.js';
import type { TeamMembership } from '../repositories/team-membership.repository.js';

@Injectable()
export class TeamMembershipFacade {
  constructor(private readonly repo: TeamMembershipRepository) {}

  async addUserToTeam(params: {
    userId: string;
    teamId: string;
    role?: string;
  }): Promise<TeamMembership> {
    return this.repo.addUserToTeam(params);
  }

  async removeUserFromTeam(userId: string, teamId: string): Promise<boolean> {
    return this.repo.removeUserFromTeam(userId, teamId);
  }

  async findByUserAndTeam(userId: string, teamId: string): Promise<TeamMembership | null> {
    return this.repo.findByUserAndTeam(userId, teamId);
  }

  async findTeamsByUserId(userId: string): Promise<TeamMembership[]> {
    return this.repo.findTeamsByUserId(userId);
  }

  async findUsersByTeamId(teamId: string): Promise<TeamMembership[]> {
    return this.repo.findUsersByTeamId(teamId);
  }

  async setRole(params: {
    userId: string;
    teamId: string;
    role: string | null;
  }): Promise<TeamMembership | null> {
    return this.repo.setRole(params);
  }
}
