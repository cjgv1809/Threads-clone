import * as z from "zod";

export const threadSchema = z.object({
  thread: z.string().min(1, { message: "Thread cannot be empty" }),
  accountId: z.string(),
});

export const commentSchema = z.object({
  thread: z.string().min(1, { message: "Comment cannot be empty" }),
});
