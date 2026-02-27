import { Plus, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileText as FilePdf } from "lucide-react";

const CONTEXT_SOURCES = [
  { name: "Q3_Marketing_Strategy.pdf", meta: "Updated 2h ago • 2.4MB", icon: "pdf" as const },
  { name: "Meeting_Notes_July.docx", meta: "Updated yesterday • 450KB", icon: "docx" as const },
  { name: "Budget_Allocation_v2.xlsx", meta: "Updated 3d ago • 1.1MB", icon: "xlsx" as const },
];

export function RightSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-80 flex-shrink-0 border-l border-dark-border bg-dark-sidebar overflow-hidden sticky top-0 h-screen">
      <div className="flex flex-col h-full min-h-0">
        <div className="px-4 py-3 border-b border-dark-border shrink-0">
          <h2 className="text-sm font-semibold text-pastel-blue">Details</h2>
        </div>
        <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">
                Context Sources
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-card text-gray-500 border border-dark-border">
                {CONTEXT_SOURCES.length}
              </span>
            </div>
            <ul className="space-y-2">
              {CONTEXT_SOURCES.map((file) => (
                <li
                  key={file.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-dark-card border border-dark-border hover:border-pastel-blue/40 transition-colors"
                >
                  {file.icon === "pdf" && <FilePdf className="w-5 h-5 text-gray-400 shrink-0" />}
                  {file.icon === "docx" && <FileText className="w-5 h-5 text-gray-400 shrink-0" />}
                  {file.icon === "xlsx" && <BarChart3 className="w-5 h-5 text-gray-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 bg-dark-card border-dark-border text-white hover:text-pastel-blue hover:bg-pastel-blue/15 hover:border-pastel-blue/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Context Source
            </Button>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Token Usage
            </h3>
            <div className="p-3 rounded-lg bg-dark-card border border-dark-border">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>14.5k / 20k</span>
              </div>
              <div className="h-2 rounded-full bg-dark-input overflow-hidden">
                <div
                  className="h-full rounded-full bg-pastel-blue/60"
                  style={{ width: "72.5%" }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Reset in 12d</p>
              <Button
                className="w-full mt-3 bg-dark-card hover:bg-pastel-blue/10 hover:border-pastel-blue/30 text-gray-300 hover:text-pastel-blue border border-dark-border"
                variant="outline"
                size="sm"
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
