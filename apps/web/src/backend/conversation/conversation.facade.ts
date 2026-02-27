import { Injectable } from "@nestjs/common";
import { Conversation, ConversationAccess, ConversationInsert, ConversationRepository } from "./repositories/conversation.repository";
import { Message, MessageInsert, MessageRepository } from "./repositories/message.repository";

@Injectable()
export class ConversationFacade {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
  ) { }

  async createConversation(data: ConversationInsert): Promise<Conversation> {
    return this.conversationRepository.create(data);
  }

  async findConversationById(id: string): Promise<Conversation | null> {
    return this.conversationRepository.findById(id);
  }

  async findMessagesByConversationId(conversationId: string, options: { limit: number, offset: number, sort: 'asc' | 'desc' } = { limit: 10, offset: 0, sort: 'asc' }): Promise<Message[]> {
    return this.messageRepository.findByConversationId(conversationId, {
      limit: options.limit,
      offset: options.offset,
      sort: options.sort,
    });
  }

  async createMessage(data: MessageInsert): Promise<Message> {
    return this.messageRepository.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async deleteMessage(id: string): Promise<boolean> {
    return this.messageRepository.delete(id);
  }

  async updateMessage(id: string, data: Partial<Omit<MessageInsert, 'id'>>): Promise<Message | null> {
    return this.messageRepository.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }

  async addUserToConversation(conversationId: string, userId: string): Promise<ConversationAccess> {
    return this.conversationRepository.addAccess(conversationId, { userId, role: 'user' });
  }

  async removeUserFromConversation(conversationId: string, userId: string): Promise<boolean> {
    return this.conversationRepository.removeAccess(conversationId, userId);
  }

  async addTeamToConversation(conversationId: string, teamId: string): Promise<ConversationAccess> {
    return this.conversationRepository.addAccess(conversationId, { teamId, role: 'team' });
  }

  async removeTeamFromConversation(conversationId: string, teamId: string): Promise<boolean> {
    return this.conversationRepository.removeAccess(conversationId, teamId);
  }
}
