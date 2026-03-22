import z from "zod";

export const chatById = z.object({ id: z.string() });
