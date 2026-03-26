import z from "zod";

export const messagesByIdSchema = z.object({ id: z.string() });

export type TMessagesById = z.infer<typeof messagesByIdSchema>;
