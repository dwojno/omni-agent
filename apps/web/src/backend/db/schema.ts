import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const teamMembership = pgTable(
  'team_membership',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    role: text('role'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.teamId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
  teamMemberships: many(teamMembership),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMemberships: many(teamMembership),
}));

export const teamMembershipRelations = relations(teamMembership, ({ one }) => ({
  user: one(users, {
    fields: [teamMembership.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembership.teamId],
    references: [teams.id],
  }),
}));

export const schema = {
  users,
  teams,
  teamMembership,
  usersRelations,
  teamsRelations,
  teamMembershipRelations,
} as const;

export type AppSchema = typeof schema;
