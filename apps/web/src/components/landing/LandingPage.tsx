import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-gray-200 flex flex-col">
      <header className="border-b border-dark-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-semibold text-white text-lg">Omni Agent</span>
          </div>
          <nav className="flex items-center gap-2">
            <SignInButton mode="modal">
              <Button
                className="bg-dark-card text-white hover:bg-pastel-blue/15 hover:border-pastel-blue/30 rounded-xl border border-dark-border shadow-sm"
              >
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="bg-pastel-blue/15 hover:bg-pastel-blue/25 text-pastel-blue border border-pastel-blue/30">
                Get started
              </Button>
            </SignUpButton>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Conversational AI for your documents and team
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Omni Agent answers questions, analyzes data, and helps your team
            work faster—all from one workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="bg-pastel-blue/15 hover:bg-pastel-blue/25 text-pastel-blue border border-pastel-blue/30 px-8 py-6 text-base font-medium"
              >
                Get started for free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="bg-dark-card text-white hover:bg-pastel-blue/15 hover:border-pastel-blue/30 rounded-xl border border-dark-border shadow-sm px-8 py-6 text-base"
              >
                Sign in
              </Button>
            </SignInButton>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-left">
          {[
            {
              title: "Chat with your docs",
              description:
                "Ask questions and get answers grounded in your uploaded documents.",
            },
            {
              title: "Team workspace",
              description:
                "Share documents and conversations with your team in one place.",
            },
            {
              title: "Actions & automation",
              description:
                "Run analyses, draft summaries, and trigger workflows from chat.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-pastel-blue/40 hover:bg-pastel-blue/5 transition-colors"
            >
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-dark-border py-6 text-center text-sm text-gray-500">
        <p>Omni Agent · Conversational AI Workspace</p>
      </footer>
    </div>
  );
}
