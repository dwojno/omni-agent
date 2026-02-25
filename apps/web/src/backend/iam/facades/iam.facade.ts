import { Injectable } from '@nestjs/common';

import { TeamMembershipFacade } from './team-membership.facade.js';
import { TeamsFacade } from './teams.facade.js';
import { UsersFacade } from './users.facade.js';

@Injectable()
export class IamFacade {
  constructor(
    public readonly users: UsersFacade,
    public readonly teams: TeamsFacade,
    public readonly teamMembership: TeamMembershipFacade,
  ) {}
}
