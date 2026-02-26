import { Module } from '@nestjs/common';

import { IamFacade } from './facades/iam.facade.js';
import { TeamAccessFacade } from './facades/team-access.facade.js';
import { TeamFacade } from './facades/team.facade.js';
import { UserFacade } from './facades/user.facade.js';
import { TeamAccessRepository } from './repositories/team-access.repository.js';
import { TeamRepository } from './repositories/team.repository.js';
import { UserRepository } from './repositories/user.repository.js';

@Module({
  imports: [],
  providers: [
    UserRepository,
    TeamRepository,
    TeamAccessRepository,
    UserFacade,
    TeamFacade,
    TeamAccessFacade,
    IamFacade,
  ],
  exports: [IamFacade],
})
export class IamModule { }
