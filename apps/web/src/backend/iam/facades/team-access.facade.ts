import { Injectable } from '@nestjs/common';

import { TeamAccessRepository } from '../repositories/team-access.repository.js';
import type { TeamAccess } from '../repositories/team-access.repository.js';

@Injectable()
export class TeamAccessFacade {
  constructor(private readonly repo: TeamAccessRepository) { }

  async addUserToTeam(params: {
    userId: string;
    teamId: string;
    role?: string;
  }): Promise<TeamAccess> {
    return this.repo.addUserToTeam(params);
  }

  async removeUserFromTeam(userId: string, teamId: string): Promise<boolean> {
    return this.repo.removeUserFromTeam(userId, teamId);
  }

  async findByUserAndTeam(userId: string, teamId: string): Promise<TeamAccess | null> {
    return this.repo.findByUserAndTeam(userId, teamId);
  }

  async findTeamsByUserId(userId: string): Promise<TeamAccess[]> {
    return this.repo.findTeamsByUserId(userId);
  }

  async findUsersByTeamId(teamId: string): Promise<TeamAccess[]> {
    return this.repo.findUsersByTeamId(teamId);
  }

  async setRole(params: {
    userId: string;
    teamId: string;
    role: string | null;
  }): Promise<TeamAccess | null> {
    return this.repo.setRole(params);
  }
}
