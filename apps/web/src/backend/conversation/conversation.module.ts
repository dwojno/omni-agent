import { Module } from "@nestjs/common";
import { ConversationFacade } from "./conversation.facade";
import { ConversationRepository } from "./repositories/conversation.repository";
import { MessageRepository } from "./repositories/message.repository";

@Module({
  imports: [],
  controllers: [],
  providers: [ConversationRepository, MessageRepository, ConversationFacade],
  exports: [ConversationFacade],
})
export class ConversationModule { }
