import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const user = pgTable('user', {
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

export const team = pgTable('team', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const conversation = pgTable('conversation', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const message = pgTable('message', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversation.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  role: text('role').notNull(),
  type: text('type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const teamAccess = pgTable(
  'team_access',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    teamId: uuid('team_id')
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),
    role: text('role'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.teamId] })],
);

export const conversationAccess = pgTable('conversation_access', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversation.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .references(() => user.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id')
    .references(() => team.id, { onDelete: 'cascade' }),
  role: text('role'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.conversationId, t.userId, t.teamId] }),
  check('check_access_target', sql`(${t.userId} IS NOT NULL AND ${t.teamId} IS NULL) OR (${t.userId} IS NULL AND ${t.teamId} IS NOT NULL)`),
]);

export const usersRelations = relations(user, ({ many }) => ({
  teamAccesses: many(teamAccess),
  conversations: many(conversation),
}));

export const teamsRelations = relations(team, ({ many }) => ({
  teamAccesses: many(teamAccess),
  conversations: many(conversation),
}));

export const conversationsRelations = relations(conversation, ({ many }) => ({
  messages: many(message),
  accesses: many(conversationAccess),
}));

export const teamAccessRelations = relations(teamAccess, ({ one }) => ({
  user: one(user, {
    fields: [teamAccess.userId],
    references: [user.id],
  }),
  team: one(team, {
    fields: [teamAccess.teamId],
    references: [team.id],
  }),
}));

export const schema = {
  user,
  team,
  teamAccess,
  usersRelations,
  teamsRelations,
  teamAccessRelations,
  conversation,
  message,
  conversationAccess,
  conversationsRelations,
} as const;

export type AppSchema = typeof schema;
