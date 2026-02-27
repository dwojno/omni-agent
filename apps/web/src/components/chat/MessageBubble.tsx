"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUser } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "@/backend/shared";

const markdownClasses = {
  p: "mb-3 last:mb-0",
  ul: "list-disc pl-5 mb-3 space-y-1",
  ol: "list-decimal pl-5 mb-3 space-y-1",
  li: "text-gray-300",
  code: "px-1.5 py-0.5 rounded bg-dark-input text-gray-300 font-mono text-sm",
  pre: "p-4 rounded-xl bg-dark-input border border-dark-border overflow-x-auto mb-3",
  "pre code": "p-0 bg-transparent text-gray-300",
  blockquote: "border-l-4 border-gray-600 pl-4 my-3 text-gray-400 italic",
  a: "text-pastel-blue hover:text-pastel-blue-soft hover:underline",
  h1: "text-xl font-bold mb-2 mt-4 first:mt-0",
  h2: "text-lg font-bold mb-2 mt-3 first:mt-0",
  h3: "text-base font-semibold mb-1 mt-2",
  strong: "font-semibold text-white",
  hr: "my-4 border-dark-border",
};

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className={markdownClasses.p}>{children}</p>,
        ul: ({ children }) => <ul className={markdownClasses.ul}>{children}</ul>,
        ol: ({ children }) => <ol className={markdownClasses.ol}>{children}</ol>,
        li: ({ children }) => <li className={markdownClasses.li}>{children}</li>,
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className={markdownClasses.code} {...props}>
                {children}
              </code>
            );
          }
          return (
            <code className={markdownClasses["pre code"]} {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className={markdownClasses.pre}>{children}</pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className={markdownClasses.blockquote}>
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={markdownClasses.a}
          >
            {children}
          </a>
        ),
        h1: ({ children }) => <h1 className={markdownClasses.h1}>{children}</h1>,
        h2: ({ children }) => <h2 className={markdownClasses.h2}>{children}</h2>,
        h3: ({ children }) => <h3 className={markdownClasses.h3}>{children}</h3>,
        strong: ({ children }) => (
          <strong className={markdownClasses.strong}>{children}</strong>
        ),
        hr: () => <hr className={markdownClasses.hr} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

type MessageBubbleProps = {
  message: Message;
  /** When true, show streaming content and a typing cursor after it */
  isStreaming?: boolean;
  /** Current streamed text (parsed as markdown on the fly) */
  streamingContent?: string;
};

function getInitials(
  user:
    | {
        firstName?: string | null;
        lastName?: string | null;
        primaryEmailAddress?: { emailAddress: string } | null;
      }
    | null
    | undefined
) {
  if (!user) return "?";
  const { firstName, lastName, primaryEmailAddress } = user;
  if (firstName && lastName)
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (lastName) return lastName.slice(0, 2).toUpperCase();
  const email = primaryEmailAddress?.emailAddress;
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

export function MessageBubble({
  message,
  isStreaming,
  streamingContent,
}: MessageBubbleProps) {
  const { user } = useUser();
  const isUser = message.role === "user";
  const isAgent = message.role === "assistant" || message.role === "system";
  const displayContent =
    isStreaming && streamingContent !== undefined
      ? streamingContent
      : message.content;
  const displayName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "You";

  return (
    <div
      className={cn(
        "flex w-full max-w-4xl mx-auto flex-col gap-1.5",
        isUser ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 shrink-0",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {isUser ? (
          <>
            <span className="text-sm font-medium text-gray-300">{displayName}</span>
            <Avatar className="w-9 h-9 rounded-full border border-dark-border">
              <AvatarImage src={user?.imageUrl} alt={displayName} />
              <AvatarFallback className="bg-dark-card text-gray-400 text-sm">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-dark-card border border-dark-border">
              <Sparkles className="w-5 h-5 text-pastel-blue" />
            </div>
            <span className="text-sm font-medium text-gray-300">
              {message.role === "system" ? "System" : "Agent"}
            </span>
          </>
        )}
      </div>
      {isUser ? (
        <div className="rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[75%] bg-pastel-blue/15 text-white border border-pastel-blue/25">
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      ) : isAgent ? (
        <div className="w-full text-gray-200">
          <div className="text-sm prose prose-invert prose-sm max-w-none">
            {displayContent ? (
              <MarkdownContent content={displayContent} />
            ) : (
              <span className="text-gray-500">Thinking...</span>
            )}
            {isStreaming && (
              <span
                className="inline-block w-px h-4 ml-0.5 bg-gray-400 align-middle animate-stream-cursor"
                aria-hidden
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
