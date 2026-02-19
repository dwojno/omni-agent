import z from "zod";

export const envConfigSchema = z.object({
  databaseUrl: z.string()
})

export type EnvConfigPayload = z.infer<typeof envConfigSchema>;
