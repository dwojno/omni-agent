import {
  CloudUpload,
  FolderOpen,
  MoreVertical,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText as FilePdf } from "lucide-react";

export default function DocumentsView() {
  return (
    <Tabs defaultValue="my-docs" className="flex-1 flex flex-col min-h-0">
      <TabsList className="w-full rounded-none border-b border-dark-border bg-dark-card/30 p-0 h-auto min-h-0">
        <TabsTrigger
          value="my-docs"
          className="flex-1 py-3 rounded-none border-b-2 border-transparent bg-transparent text-gray-400 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-pastel-blue data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500"
        >
          My Documents
        </TabsTrigger>
        <TabsTrigger
          value="team"
          className="flex-1 py-3 rounded-none border-b-2 border-transparent bg-transparent text-gray-400 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-pastel-blue data-[state=inactive]:text-gray-500"
        >
          Team Shared
        </TabsTrigger>
      </TabsList>
      <TabsContent value="my-docs" className="flex-1 overflow-hidden flex flex-col mt-0">
        <div className="p-4">
          <div className="border-2 border-dashed border-dark-border rounded-xl p-6 text-center hover:border-pastel-blue/40 hover:bg-pastel-blue/10 transition-all cursor-pointer group">
            <div className="w-10 h-10 bg-dark-card rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:text-pastel-blue transition-colors">
              <CloudUpload className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-300 font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOCX, TXT up to 10MB
            </p>
          </div>
        </div>
        <ScrollArea className="flex-1 px-4 pb-4 chat-scroll">
          <div className="flex justify-between items-center mb-3 mt-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase">
              Recent Files
            </h3>
            <button
              type="button"
              className="text-xs text-pastel-blue hover:text-pastel-blue-soft"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center p-3 bg-dark-card border border-dark-border rounded-lg hover:border-pastel-blue/40 cursor-pointer transition-all group">
              <FolderOpen className="w-5 h-5 text-gray-400 group-hover:text-pastel-blue mr-3 shrink-0 transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">
                  Q3 Marketing Assets
                </p>
                <p className="text-xs text-gray-500">
                  4 files • Updated 2h ago
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-gray-500 hover:text-pastel-blue"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center p-3 bg-dark-card border border-dark-border rounded-lg hover:border-pastel-blue/40 cursor-pointer transition-all group">
              <FilePdf className="w-5 h-5 text-gray-400 group-hover:text-pastel-blue mr-3 shrink-0 transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">
                  Q3 User Research.pdf
                </p>
                <p className="text-xs text-gray-500">2.4 MB • Personal</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-gray-500 hover:text-pastel-blue"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center p-3 bg-dark-card border border-dark-border rounded-lg hover:border-pastel-blue/40 cursor-pointer transition-all group">
              <FileText className="w-5 h-5 text-gray-400 group-hover:text-pastel-blue mr-3 shrink-0 transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">
                  Project Scope v2.docx
                </p>
                <p className="text-xs text-gray-500">
                  1.1 MB • Team Shared
                </p>
              </div>
              <Avatar className="w-5 h-5 rounded-full border border-dark-card shrink-0 mr-2">
                <AvatarImage src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" />
                <AvatarFallback>PS</AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-gray-500 hover:text-pastel-blue"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="team" className="flex-1 mt-0 p-4">
        <p className="text-sm text-gray-400">Team shared documents.</p>
      </TabsContent>
    </Tabs>
  );
}
