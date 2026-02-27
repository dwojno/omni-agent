import {
  pgTable,
  text,
  timestamp,
  uuid,
  primaryKey,
  check,
} from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
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

/** LLM-standard message roles: user (human), assistant (agent), system (context). */
export const MESSAGE_ROLES = ['user', 'assistant', 'system'] as const;
export type MessageRole = (typeof MESSAGE_ROLES)[number];

export const message = pgTable(
  'message',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversation.id, { onDelete: 'cascade' }),
    /** Set only for role='user'; null for assistant/system. */
    userId: uuid('user_id').references(() => user.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    role: text('role').notNull(),
    type: text('type').notNull().default('text'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check('message_role_check', sql`${t.role} IN ('user', 'assistant', 'system')`),
    check(
      'message_user_id_by_role',
      sql`(${t.role} = 'user' AND ${t.userId} IS NOT NULL) OR (${t.role} IN ('assistant', 'system') AND ${t.userId} IS NULL)`,
    ),
  ],
);

export type Message = InferSelectModel<typeof message>;

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
  id: uuid('id').defaultRandom().notNull(),
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
  conversationAccesses: many(conversationAccess),
  messages: many(message),
}));

export const teamsRelations = relations(team, ({ many }) => ({
  teamAccesses: many(teamAccess),
  conversationAccesses: many(conversationAccess),
}));

export const conversationsRelations = relations(conversation, ({ many }) => ({
  messages: many(message),
  accesses: many(conversationAccess),
}));

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
  user: one(user, {
    fields: [message.userId],
    references: [user.id],
  }),
}));

export const conversationAccessRelations = relations(conversationAccess, ({ one }) => ({
  conversation: one(conversation, {
    fields: [conversationAccess.conversationId],
    references: [conversation.id],
  }),
  user: one(user, {
    fields: [conversationAccess.userId],
    references: [user.id],
  }),
  team: one(team, {
    fields: [conversationAccess.teamId],
    references: [team.id],
  }),
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
  messageRelations,
  conversationAccessRelations,
} as const;

export type AppSchema = typeof schema;
