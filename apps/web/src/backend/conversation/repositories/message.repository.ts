import { InjectDrizzle, Repository } from '@/backend/db'
import type { DrizzleDb, Entity, InsertEntity } from '@/backend/db'
import { message } from '@/backend/db/schema'
import { desc, eq } from 'drizzle-orm'
import { ClsService } from 'nestjs-cls'

export type Message = Entity<typeof message>
export type MessageInsert = InsertEntity<typeof message>

export class MessageRepository extends Repository {
  constructor(@InjectDrizzle() db: DrizzleDb, clsService: ClsService) {
    super(db, clsService)
  }

  async create(data: MessageInsert): Promise<Message> {
    const tx = this.getTransaction()
    const [row] = await tx.insert(message).values(data).returning()
    return row
  }

  async findById(id: string): Promise<Message | null> {
    const tx = this.getTransaction()
    const [row] = await tx
      .select()
      .from(message)
      .where(eq(message.id, id))
      .limit(1)
    return row ?? null
  }

  async delete(id: string): Promise<boolean> {
    const tx = this.getTransaction()
    const result = await tx.delete(message).where(eq(message.id, id))
    return (result.rowCount ?? 0) > 0
  }

  async update(
    id: string,
    data: Partial<Omit<MessageInsert, 'id'>>,
  ): Promise<Message | null> {
    const tx = this.getTransaction()
    const [row] = await tx
      .update(message)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(message.id, id))
      .returning()
    return row ?? null
  }

  async findByConversationId(
    conversationId: string,
    options: { limit: number; offset: number; sort: 'asc' | 'desc' } = {
      limit: 10,
      offset: 0,
      sort: 'asc',
    },
  ): Promise<Message[]> {
    const tx = this.getTransaction()
    const rows = await tx
      .select()
      .from(message)
      .where(eq(message.conversationId, conversationId))
      .orderBy(
        options.sort === 'asc' ? message.createdAt : desc(message.createdAt),
      )
      .limit(options.limit)
      .offset(options.offset)

    return rows;
  }
}
