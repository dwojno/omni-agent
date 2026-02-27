"use client";

import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "@/backend/shared";

export type MessageListProps = {
  messages: Message[];
  /** Id of the message currently being streamed (last assistant message) */
  streamingMessageId?: string | null;
  /** Current streamed text for the message being streamed */
  streamingContent?: string;
};

export function MessageList({
  messages,
  streamingMessageId,
  streamingContent = "",
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamingContent]);

  if (messages.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 py-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isStreaming={streamingMessageId === msg.id}
          streamingContent={
            streamingMessageId === msg.id ? streamingContent : undefined
          }
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
