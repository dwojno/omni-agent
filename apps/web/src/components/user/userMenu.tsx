'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronUp } from 'lucide-react'

function getInitials(
  user:
    | {
        firstName?: string | null
        lastName?: string | null
        primaryEmailAddress?: { emailAddress: string } | null
      }
    | null
    | undefined,
) {
  if (!user) return '?'
  const { firstName, lastName, primaryEmailAddress } = user
  if (firstName && lastName)
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  if (firstName) return firstName.slice(0, 2).toUpperCase()
  if (lastName) return lastName.slice(0, 2).toUpperCase()
  const email = primaryEmailAddress?.emailAddress
  if (email) return email.slice(0, 2).toUpperCase()
  return '?'
}

export function UserMenu() {
  const { signOut } = useClerk()
  const { user } = useUser()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-pastel-blue/10 cursor-pointer transition-colors text-left"
        >
          <Avatar className="w-9 h-9 rounded-full border border-gray-600">
            <AvatarImage
              src={user?.imageUrl}
              alt={user?.fullName ?? 'Profile'}
            />
            <AvatarFallback className="bg-dark-card text-white">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {(user?.fullName ??
                [user?.firstName, user?.lastName].filter(Boolean).join(' ')) ||
                'Account'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.primaryEmailAddress?.emailAddress ?? 'Account'}
            </p>
          </div>
          <ChevronUp className="w-3 h-3 text-gray-500 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="top"
        className="w-56 bg-dark-card border-dark-border"
      >
        <DropdownMenuItem className="text-gray-300 focus:bg-dark-bg focus:text-white">
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-300 focus:bg-dark-bg focus:text-white">
          Switch Team
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-dark-border" />
        <DropdownMenuItem
          className="text-red-400 focus:bg-dark-bg focus:text-red-300 cursor-pointer"
          onSelect={() => signOut({ redirectUrl: '/' })}
        >
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
