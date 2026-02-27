"use client";

import { useRef, useEffect, useState } from "react";
import { Paperclip, AtSign, Globe, Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatInputProps = {
  onSubmit?: (value: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const resize = () => {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    };
    ta.addEventListener("input", resize);
    return () => ta.removeEventListener("input", resize);
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit?.(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-t from-dark-bg via-dark-bg to-transparent">
      <div className="max-w-4xl mx-auto relative">
        <div className="relative bg-dark-input border border-dark-border rounded-xl shadow-lg focus-within:ring-1 focus-within:ring-pastel-blue/50 focus-within:border-pastel-blue/50 transition-all duration-200">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-4 pr-12 rounded-xl focus:outline-none resize-none min-h-[60px] max-h-[200px] disabled:opacity-60"
            placeholder="Ask anything about your documents...."
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-pastel-blue hover:bg-pastel-blue/15 rounded-lg h-8 w-8"
                title="Voice input"
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-pastel-blue hover:bg-pastel-blue/15 rounded-lg h-8 w-8"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-pastel-blue hover:bg-pastel-blue/15 rounded-lg h-8 w-8"
                title="Commands"
              >
                <AtSign className="w-4 h-4" />
              </Button>
              <div className="h-4 w-px bg-gray-700 mx-1" />
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 py-1 h-8 text-xs text-gray-400 hover:text-pastel-blue hover:bg-pastel-blue/15 rounded-md"
              >
                <Globe className="w-3 h-3" />
                Web Search
              </Button>
            </div>
            <Button
              type="button"
              size="icon"
              onClick={handleSubmit}
              disabled={disabled || !value.trim()}
              className="w-8 h-8 bg-pastel-blue/25 hover:bg-pastel-blue/35 text-pastel-blue rounded-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-center mt-3 text-xs text-gray-600">
          Omni Agent can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
}
