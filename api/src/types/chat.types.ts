import z from "zod";

export const chatByIdSchema = z.object({ id: z.string() });

export type TChatById = z.infer<typeof chatByIdSchema>;
