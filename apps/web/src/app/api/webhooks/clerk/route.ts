import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextResponse } from "next/server";
import { backend } from "@/backend/index";

type ClerkEmailAddress = { id: string; email_address?: string; email?: string };
type ClerkUserPayload = {
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
  first_name?: string | null;
  last_name?: string | null;
};

function getEmailAndName(data: ClerkUserPayload): { email: string; name: string } | null {
  const emails = data.email_addresses ?? [];
  const primaryId = data.primary_email_address_id;
  const primary = primaryId
    ? emails.find((e) => e.id === primaryId)
    : emails[0];
  const email = primary?.email_address ?? (primary as { email?: string })?.email;
  if (!email) return null;
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || email;
  return { email, name };
}

export async function POST(request: Request) {
  try {
    const evt = await verifyWebhook(request as Parameters<typeof verifyWebhook>[0]);
    const type = evt.type;
    const data = evt.data as ClerkUserPayload;

    if (type !== "user.created" && type !== "user.updated") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const payload = getEmailAndName(data);
    if (!payload) {
      return NextResponse.json(
        { error: "No email in webhook payload" },
        { status: 400 }
      );
    }

    const existingUser = await backend.iamFacade.users.findByEmail(payload.email);

    if (!existingUser) {
      await backend.iamFacade.users.create({
        email: payload.email,
        name: payload.name,
      });
    }

    if (existingUser && existingUser.name !== payload.name) {
      await backend.iamFacade.users.update(existingUser.id, {
        name: payload.name,
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Clerk webhook error:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }
}
