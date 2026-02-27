"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getErrorPayload, toErrorSearchParams } from "@/lib/error";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    const payload = getErrorPayload(error);
    router.replace(`/error?${toErrorSearchParams(payload)}`);
  }, [error, router]);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6">
      <p className="text-gray-400 text-sm">Redirecting to error page...</p>
    </div>
  );
}
