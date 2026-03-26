import { z } from "zod";

const MessageParamsSchema = z.object({
  chatId: z.string(),
  receiverId: z.string(),
  text: z.string(),
  id: z.string(),
});

export type TMessageParams = z.infer<typeof MessageParamsSchema>;

const ChatParamsSchema = z.object({
  email: z.email(),
});

export type TChatParams = z.infer<typeof ChatParamsSchema>;

export const MessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("SEND_MESSAGE"),
    data: MessageParamsSchema,
  }),
  z.object({
    type: z.literal("NEW_CHAT"),
    data: ChatParamsSchema,
  }),
]);

export type TMessage = z.infer<typeof MessageSchema>;
