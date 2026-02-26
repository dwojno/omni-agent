import { InjectDrizzle, Repository } from "@/backend/db";
import type { DrizzleDb, Entity, InsertEntity } from "@/backend/db";
import { conversation, conversationAccess } from "@/backend/db/schema";
import { Injectable } from "@nestjs/common";
import { and, eq, or } from "drizzle-orm";
import { ClsService } from "nestjs-cls";

export type Conversation = Entity<typeof conversation>;
export type ConversationInsert = InsertEntity<typeof conversation>;

export type ConversationAccess = Entity<typeof conversationAccess>;
export type ConversationAccessInsert = InsertEntity<typeof conversationAccess>;

@Injectable()
export class ConversationRepository extends Repository {
  constructor(
    @InjectDrizzle() db: DrizzleDb,
    clsService: ClsService,
  ) {
    super(db, clsService);
  }

  async create(data: ConversationInsert): Promise<Conversation> {
    const tx = this.getTransaction();
    const [row] = await tx.insert(conversation).values(data).returning();
    return row;
  }

  async findById(id: string): Promise<Conversation | null> {
    const tx = this.getTransaction();
    const [row] = await tx.select().from(conversation).where(eq(conversation.id, id)).limit(1);
    return row ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const tx = this.getTransaction();
    const result = await tx.delete(conversation).where(eq(conversation.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async update(id: string, data: Partial<Omit<ConversationInsert, 'id'>>): Promise<Conversation | null> {
    const tx = this.getTransaction();
    const [row] = await tx.update(conversation).set({ ...data, updatedAt: new Date() }).where(eq(conversation.id, id)).returning();
    return row ?? null;
  }

  async addAccess(conversationId: string, access: ({ userId: string } | { teamId: string }) & { role: string }): Promise<ConversationAccess> {
    const tx = this.getTransaction();
    const values =
      "userId" in access
        ? { conversationId, userId: access.userId, teamId: null, role: access.role }
        : { conversationId, userId: null, teamId: access.teamId, role: access.role };
    const [row] = await tx.insert(conversationAccess).values(values).returning();
    return row;
  }

  async removeAccess(conversationId: string, participantId: string): Promise<boolean> {
    const tx = this.getTransaction();
    const result = await tx.delete(conversationAccess).where(
      and(
        eq(conversationAccess.conversationId, conversationId),
        or(
          eq(conversationAccess.userId, participantId),
          eq(conversationAccess.teamId, participantId),
        ),
      ),
    );
    return (result.rowCount ?? 0) > 0;
  }

}
