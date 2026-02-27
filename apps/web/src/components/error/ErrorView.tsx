import Link from "next/link";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ErrorIssue } from "@/lib/error";

type ErrorViewProps = {
  title?: string;
  message?: string | null;
  /** Validation/field errors (e.g. from Zod); shown below the main message */
  issues?: ErrorIssue[] | null;
  showTryAgain?: boolean;
  onTryAgain?: () => void;
};

const DEFAULT_TITLE = "Something went wrong";
const DEFAULT_MESSAGE =
  "An unexpected error occurred. Please go back home or try again.";

function formatIssuePath(path: (string | number)[]): string {
  if (path.length === 0) return "Value";
  return path.join(".");
}

export function ErrorView({
  title = DEFAULT_TITLE,
  message,
  issues,
  showTryAgain = false,
  onTryAgain,
}: ErrorViewProps) {
  const displayMessage = message?.trim() || DEFAULT_MESSAGE;
  const hasIssues = Array.isArray(issues) && issues.length > 0;

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-pastel-blue/10 border border-pastel-blue/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-pastel-blue" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          <p className="text-sm text-gray-400">{displayMessage}</p>
          {hasIssues && (
            <ul className="text-left list-disc list-inside text-sm text-gray-500 space-y-1 mt-3">
              {issues!.map((issue, i) => (
                <li key={i}>
                  <span className="font-medium text-gray-400">
                    {formatIssuePath(issue.path)}:
                  </span>{" "}
                  {issue.message}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="bg-pastel-blue/15 hover:bg-pastel-blue/25 text-pastel-blue border border-pastel-blue/30"
          >
            <Link href="/chat" className="inline-flex items-center gap-2">
              <Home className="w-4 h-4" />
              Go home
            </Link>
          </Button>
          {showTryAgain && onTryAgain && (
            <Button
              variant="outline"
              onClick={onTryAgain}
              className="border-dark-border text-gray-300 hover:bg-dark-card"
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
