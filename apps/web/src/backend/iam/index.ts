export { IamFacade } from './facades/iam.facade.js';
export { IamModule } from './iam.module.js';

// Public types (re-export from repositories for API consumers)
export type { User, UserInsert } from './repositories/user.repository.js';
export type { Team, TeamInsert } from './repositories/team.repository.js';
export type {
  TeamMembership,
  TeamMembershipInsert,
} from './repositories/team-access.repository.js';
