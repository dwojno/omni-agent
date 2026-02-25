import { Module } from '@nestjs/common';

import { IamFacade } from './facades/iam.facade.js';
import { TeamMembershipFacade } from './facades/team-membership.facade.js';
import { TeamsFacade } from './facades/teams.facade.js';
import { UsersFacade } from './facades/users.facade.js';
import { TeamMembershipRepository } from './repositories/team-membership.repository.js';
import { TeamsRepository } from './repositories/teams.repository.js';
import { UsersRepository } from './repositories/users.repository.js';

@Module({
  imports: [],
  providers: [
    UsersRepository,
    TeamsRepository,
    TeamMembershipRepository,
    UsersFacade,
    TeamsFacade,
    TeamMembershipFacade,
    IamFacade,
  ],
  exports: [IamFacade],
})
export class IamModule {}
