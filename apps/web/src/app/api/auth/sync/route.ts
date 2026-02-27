import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { backend } from "@/backend/index";

/**
 * GET /api/auth/sync
 * Called when the app checks if the user is still logged in.
 * Ensures the current Clerk user (email + name) exists and is up-to-date in our backend.
 * Complements the Clerk webhook (user.created / user.updated) by syncing on each session check.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const primaryEmail = clerkUser.emailAddresses?.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    ) ?? clerkUser.emailAddresses?.[0];
    const email = primaryEmail?.emailAddress;
    if (!email) {
      return NextResponse.json(
        { error: "No email for user" },
        { status: 400 }
      );
    }

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
      clerkUser.username ||
      email;

    const existingUser = await backend.iamFacade.users.findByEmail(email);

    if (!existingUser) {
      await backend.iamFacade.users.create({ email, name });
    } else if (existingUser.name !== name) {
      await backend.iamFacade.users.update(existingUser.id, { name });
    }

    return NextResponse.json({ ok: true, email });
  } catch (err) {
    console.error("Auth sync error:", err);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
