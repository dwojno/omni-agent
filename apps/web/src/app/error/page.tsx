import { ErrorView } from "@/components/error/ErrorView";
import { parseErrorSearchParams } from "@/lib/error";

type ErrorPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const resolved = await searchParams;
  const payload = parseErrorSearchParams(resolved);
  return (
    <ErrorView
      title={payload.title}
      message={payload.message}
      issues={payload.issues}
    />
  );
}
