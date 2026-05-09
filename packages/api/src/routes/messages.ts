import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requireAuth, getUser } from "../middleware/auth.js";
import { sendMessage, getInbox, getPublicFeed } from "../services/message.js";

export const messagesRouter = new Hono();

messagesRouter.post("/", requireAuth, async (c) => {
  const user = getUser(c);
  const body = await c.req.json() as { content: string; receiverId?: string; isPublic?: boolean };
  if (!body.content?.trim()) throw new HTTPException(400, { message: "Content is required" });

  const message = await sendMessage({
    senderId: user.userId,
    content: body.content.trim(),
    receiverId: body.receiverId,
    isPublic: body.isPublic ?? !body.receiverId,
  });
  return c.json(message, 201);
});

messagesRouter.get("/inbox", requireAuth, async (c) => {
  const user = getUser(c);
  const messages = await getInbox(user.userId);
  return c.json(messages);
});

messagesRouter.get("/feed", requireAuth, async (c) => {
  const page = parseInt(c.req.query("page") ?? "1", 10);
  const limit = parseInt(c.req.query("limit") ?? "50", 10);
  const messages = await getPublicFeed(page, limit);
  return c.json(messages);
});
