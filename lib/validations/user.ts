import * as z from "zod";

export const userSchema = z.object({
  profile_photo: z.string().url().min(1),
  name: z.string().min(1, { message: "Name cannot be empty" }).max(30),
  username: z.string().min(1, { message: "Username cannot be empty" }).max(30),
  bio: z.string().min(1, { message: "Bio cannot be empty" }).max(255),
});
