"use client";

import { useUser } from "@clerk/nextjs";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export function ChatHeader() {
  const { user } = useUser();
  const displayName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "You";

  return (
    <header className="flex items-center justify-between gap-4 py-3 px-4 md:px-6 border-b border-dark-border bg-dark-bg/95 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-dark-card border border-dark-border shrink-0">
          <Bot className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm font-medium text-white truncate">Agent</span>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-gray-400 truncate max-w-[120px] md:max-w-[180px]">
          {displayName}
        </span>
        <Avatar className="w-8 h-8 rounded-full border border-dark-border shrink-0">
          <AvatarImage src={user?.imageUrl} alt={displayName} />
          <AvatarFallback className="bg-dark-card text-gray-400 text-xs">
            {getInitials(user)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
