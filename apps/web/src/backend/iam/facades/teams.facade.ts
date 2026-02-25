import { Injectable } from '@nestjs/common';

import { TeamsRepository } from '../repositories/teams.repository.js';
import type { Team, TeamInsert } from '../repositories/teams.repository.js';

@Injectable()
export class TeamsFacade {
  constructor(private readonly repo: TeamsRepository) {}

  async create(data: TeamInsert): Promise<Team> {
    return this.repo.create(data);
  }

  async findById(id: string): Promise<Team | null> {
    return this.repo.findById(id);
  }

  async update(id: string, data: Partial<Omit<TeamInsert, 'id'>>): Promise<Team | null> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}
