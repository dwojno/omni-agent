import { Injectable } from '@nestjs/common';

import { TeamFacade } from './team.facade.js';
import { UserFacade } from './user.facade.js';
import { TeamAccessFacade } from './team-access.facade.js';

@Injectable()
export class IamFacade {
  constructor(
    public readonly users: UserFacade,
    public readonly teams: TeamFacade,
    public readonly teamAccess: TeamAccessFacade,
  ) { }
}
