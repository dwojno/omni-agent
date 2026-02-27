"use server";

/** Simulated assistant response with markdown. Replace with real LLM/API call. */
const SAMPLE_RESPONSE =
  "Here's a quick **summary** with some *formatting*:\n\n- First point\n- Second point\n- Third point\n\nAnd a `code` snippet:\n\n```\nconst example = true;\n```\n\nThat's it!";

export async function sendMessage(userContent: string): Promise<{
  assistantContent: string;
}> {
  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 400));
  return { assistantContent: SAMPLE_RESPONSE };
}
