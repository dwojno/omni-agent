export { IamFacade } from './facades/iam.facade.js';
export { IamModule } from './iam.module.js';

// Public types (re-export from repositories for API consumers)
export type { User, UserInsert } from './repositories/users.repository.js';
export type { Team, TeamInsert } from './repositories/teams.repository.js';
export type {
  TeamMembership,
  TeamMembershipInsert,
} from './repositories/team-membership.repository.js';
