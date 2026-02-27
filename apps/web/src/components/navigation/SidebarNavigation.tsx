import Link from "next/link";
import { headers } from "next/headers";
import {
  Layers,
  Plus,
  MessageCircle,
  FolderOpen,
  ChevronDown,
  MessageSquare,
  X,
  Menu,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserMenu } from "../user/userMenu";

const RECENT_CHATS = [
  "Q4 Marketing Strategy",
  "Product Launch Timeline",
  "HR Policy Review",
  "Competitor Analysis",
];

const KNOWLEDGE_BASES = [
  { name: "Marketing Assets" },
  { name: "Product Specs" },
  { name: "Legal Docs" },
];

const navLinkClass =
  "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors";
const navLinkActive = "text-gray-300 bg-dark-card/50";
const navLinkInactive = "text-gray-400 hover:bg-pastel-blue/10 hover:text-pastel-blue";

export async function SidebarNavigation() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isChat = pathname === "/chat";
  const isDocs = pathname === "/docs";

  return (
    <div className="contents">
      {/* Hidden checkbox: checked = sidebar open on mobile. Peer drives overlay + sidebar visibility. */}
      <input
        type="checkbox"
        id="sidebar-open"
        aria-hidden
        className="peer sr-only"
      />

      {/* Overlay: visible only when peer is checked (mobile). Click to close = uncheck. */}
      <label
        htmlFor="sidebar-open"
        role="button"
        aria-label="Close menu"
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity md:hidden",
          "opacity-0 pointer-events-none cursor-default",
          "peer-checked:opacity-100 peer-checked:pointer-events-auto peer-checked:cursor-pointer"
        )}
      />

      {/* Mobile header: menu button toggles checkbox (open on mobile). */}
      <div className="md:hidden flex items-center justify-between p-4 bg-dark-sidebar border-b border-dark-border z-50">
        <Link href="/chat" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-gray-300">
            <Layers className="w-4 h-4" />
          </div>
          <span className="font-semibold text-white text-lg">Omni Agent</span>
        </Link>
        <label
          htmlFor="sidebar-open"
          className="flex items-center justify-center size-10 rounded-md text-gray-400 hover:text-pastel-blue hover:bg-pastel-blue/10 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </label>
      </div>

      {/* Sidebar: closed by default on mobile (-translate-x-full), open when peer checked or on md+. */}
      <aside
        className={cn(
          "flex flex-col w-64 h-full bg-dark-sidebar border-r border-dark-border flex-shrink-0 transition-transform duration-300 z-40",
          "fixed md:relative left-0 top-0 bottom-0",
          "-translate-x-full peer-checked:translate-x-0 md:translate-x-0"
        )}
      >
        <div className="p-4 md:p-6 flex items-center justify-between md:justify-start gap-3 mb-2">
          <Link href="/chat" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-dark-card border border-dark-border flex items-center justify-center text-gray-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-white text-xl tracking-tight block">
                Omni Agent
              </span>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                Enterprise
              </span>
            </div>
          </Link>
          <label
            htmlFor="sidebar-open"
            className="md:hidden flex items-center justify-center size-10 rounded-md text-gray-400 hover:text-pastel-blue hover:bg-pastel-blue/10 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </label>
        </div>

        <div className="px-4 mb-4">
          <button
            type="button"
            className="w-full flex items-center justify-between p-3 rounded-lg bg-dark-card border border-dark-border hover:border-pastel-blue/40 transition-colors text-left"
          >
            <span className="text-sm font-medium text-white truncate">Acme Corp Team</span>
            <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
          </button>
          <p className="text-xs text-gray-500 mt-1 px-1">12 Members</p>
        </div>

        <div className="px-4 mb-4">
          <Button
            className="w-full justify-center gap-2 bg-pastel-blue/10 hover:bg-pastel-blue/20 text-pastel-blue hover:text-pastel-blue border border-pastel-blue/20 hover:border-pastel-blue/40 py-3 px-4 rounded-xl font-medium group"
            variant="outline"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            New chat
          </Button>
        </div>

        <ScrollArea className="flex-1 chat-scroll px-2">
          <nav className="space-y-1 py-2">
            <div className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
              Menu
            </div>
            <Link
              href="/chat"
              className={cn(
                navLinkClass,
                isChat ? navLinkActive : navLinkInactive
              )}
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              Chat
            </Link>
            <Link
              href="/docs"
              className={cn(
                navLinkClass,
                isDocs ? navLinkActive : navLinkInactive
              )}
            >
              <FolderOpen className="w-5 h-5 shrink-0" />
              Documents
            </Link>
            <Link
              href="#"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-pastel-blue/10 hover:text-pastel-blue transition-colors"
            >
              <Zap className="w-5 h-5 shrink-0" />
              Actions
            </Link>

            <div className="mt-6 px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Knowledge Base
            </div>
            <div className="space-y-0.5 min-w-0">
              {KNOWLEDGE_BASES.map((kb) => (
                <button
                  key={kb.name}
                  type="button"
                  className="w-full group flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-pastel-blue/10 hover:text-pastel-blue rounded-lg transition-colors min-w-0 text-left"
                >
                  <span className="w-2 h-2 rounded-full shrink-0 bg-gray-500" />
                  <FolderOpen className="w-4 h-4 shrink-0 opacity-70" />
                  <span className="truncate">{kb.name}</span>
                </button>
              ))}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-pastel-blue/10 hover:text-pastel-blue rounded-lg transition-colors min-w-0"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>New Folder</span>
              </button>
            </div>

            <div className="mt-6 px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
              <span>Recent Chats</span>
              <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-0.5 min-w-0">
              {RECENT_CHATS.map((title) => (
                <Link
                  key={title}
                  href="#"
                  className="group flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-pastel-blue/10 hover:text-pastel-blue rounded-lg transition-colors min-w-0"
                >
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-100" />
                  <span className="truncate">{title}</span>
                </Link>
              ))}
            </div>
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-dark-border space-y-1">
          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-gray-400 hover:bg-pastel-blue/10 hover:text-pastel-blue transition-colors"
          >
            <Settings className="w-5 h-5 shrink-0" />
            Settings
          </Link>
          <div className="pt-1">
            <UserMenu />
          </div>
        </div>
      </aside>
    </div>
  );
}
