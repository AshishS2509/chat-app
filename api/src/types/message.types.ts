import z from "zod";

export const messagesById = z.object({ id: z.string() });
