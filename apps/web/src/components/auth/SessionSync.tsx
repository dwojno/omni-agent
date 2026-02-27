"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * When the user is signed in, calls GET /api/auth/sync once so the backend
 * has the current user's email and name (create or update). This runs on
 * "session check" (when Clerk has loaded the user) and complements the
 * Clerk webhook for user.created / user.updated.
 */
export function SessionSync() {
  const { isLoaded, isSignedIn } = useUser();
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || synced.current) return;
    synced.current = true;
    fetch("/api/auth/sync", { method: "GET", credentials: "include" }).catch(
      () => {}
    );
  }, [isLoaded, isSignedIn]);

  return null;
}
