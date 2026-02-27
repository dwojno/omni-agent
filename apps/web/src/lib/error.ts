import { ZodError } from "zod";

/** Shape of a single Zod issue for display (path + message). */
export type ErrorIssue = { path: (string | number)[]; message: string };

/** Normalized error payload for the generic error page. */
export type ErrorPayload = {
  message: string;
  title?: string;
  issues?: ErrorIssue[];
};

/**
 * Turns any thrown value (Error, ZodError, or unknown) into a display payload.
 * Use when catching errors before redirecting to /error.
 */
export function getErrorPayload(error: unknown): ErrorPayload {
  if (error instanceof ZodError) {
    const issues: ErrorIssue[] = error.issues.map((i) => ({
      path: i.path.map((key) =>
        typeof key === "symbol" ? String(key) : key,
      ) as (string | number)[],
      message: i.message,
    }));
    const firstMessage = issues[0]?.message ?? error.message;
    return {
      message: firstMessage,
      title: "Validation error",
      issues,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: "An unexpected error occurred." };
}

/**
 * Builds search params for the /error page from an error payload.
 * Use with redirect: redirect(`/error?${toErrorSearchParams(payload)}`)
 * or with getErrorPayload: redirect(`/error?${toErrorSearchParams(getErrorPayload(e))}`)
 */
export function toErrorSearchParams(payload: ErrorPayload): string {
  const params = new URLSearchParams();
  params.set("message", payload.message);
  if (payload.title) params.set("title", payload.title);
  if (payload.issues?.length) {
    params.set("issues", JSON.stringify(payload.issues));
  }
  return params.toString();
}

/**
 * Parses search params from the /error page into a payload.
 * Handles issues as JSON string; invalid or missing values are ignored.
 */
export function parseErrorSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): ErrorPayload {
  const message =
    typeof searchParams.message === "string"
      ? searchParams.message
      : Array.isArray(searchParams.message)
        ? searchParams.message[0]
        : undefined;
  const title =
    typeof searchParams.title === "string"
      ? searchParams.title
      : Array.isArray(searchParams.title)
        ? searchParams.title[0]
        : undefined;
  let issues: ErrorIssue[] | undefined;
  const rawIssues = searchParams.issues;
  const issuesStr =
    typeof rawIssues === "string"
      ? rawIssues
      : Array.isArray(rawIssues)
        ? rawIssues[0]
        : undefined;
  if (issuesStr) {
    try {
      const parsed = JSON.parse(issuesStr) as unknown;
      if (Array.isArray(parsed)) {
        issues = parsed.filter(
          (i): i is ErrorIssue =>
            Array.isArray((i as ErrorIssue).path) &&
            typeof (i as ErrorIssue).message === "string",
        );
      }
    } catch {
      // ignore invalid JSON
    }
  }
  return {
    message: message ?? "An unexpected error occurred.",
    title,
    issues,
  };
}
