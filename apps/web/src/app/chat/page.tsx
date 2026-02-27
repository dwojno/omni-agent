import {
  Plus,
  Bell,
  BarChart3,
  FileText,
  X,
  Search,
  Calendar,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { RightSidebar } from "@/components/chat/RightSidebar";
import { ChatInput } from "@/components/chat/ChatInput";
import { sendMessage as sendMessageAction } from "../actions/chat/actions";

const SUGGESTION_CARDS = [
  { icon: PenLine, title: "Draft Content", description: "Create blog posts or emails." },
  { icon: BarChart3, title: "Analyze Data", description: "Insights from spreadsheets." },
  { icon: FileText, title: "Summarize Docs", description: "Key points from PDFs." },
  { icon: Calendar, title: "Schedule Meeting", description: "Coordinate team calendars." },
];

export default function ChatPage() {
  return (
    <>
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-dark-bg relative min-w-0">
        <header className="hidden md:flex items-center gap-4 px-6 py-4 bg-dark-bg/80 backdrop-blur-md z-30 sticky top-0 border-b border-dark-border">
          <div className="flex-1 flex items-center gap-2 min-w-0 max-w-2xl">
            <Search className="w-5 h-5 text-gray-500 shrink-0" />
            <input
              type="search"
              placeholder="Search conversations, documents, or actions..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none min-w-0"
            />
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-card text-gray-500 border border-dark-border">
              ⌘K
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-pastel-blue hover:bg-pastel-blue/10 h-8 w-8 shrink-0"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-pastel-blue hover:bg-pastel-blue/10 rounded-full relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-pastel-blue rounded-full border-2 border-dark-bg" />
            </Button>
            <Button
              className="gap-2 bg-pastel-blue/15 hover:bg-pastel-blue/25 text-pastel-blue hover:text-pastel-blue border border-pastel-blue/30 px-4 py-2 rounded-xl font-medium"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth chat-scroll">
            <div className="max-w-4xl mx-auto mt-8 md:mt-16 flex flex-col items-center">
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                  Welcome back, there!
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                  I&apos;m ready to help you with your team documents and
                  tasks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-12">
                {SUGGESTION_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                  <button
                    key={card.title}
                    type="button"
                    className={cn(
                      "group text-left p-6 rounded-2xl bg-dark-card border border-dark-border",
                      "hover:border-pastel-blue/40 hover:bg-pastel-blue/10 transition-all duration-200"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-dark-input text-gray-400 group-hover:text-pastel-blue transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-400">{card.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
        </div>

        <ChatInput onSubmit={sendMessageAction} />
      </main>

      <RightSidebar />
    </>
  );
}
