import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticateWithGitHub, authenticateWithWallet, getUserById } from "../services/auth.js";
import { requireAuth, getUser } from "../middleware/auth.js";

export const authRouter = new Hono();

authRouter.post("/github", async (c) => {
  const { code } = await c.req.json() as { code: string };
  if (!code) throw new HTTPException(400, { message: "Missing 'code' in request body" });

  const result = await authenticateWithGitHub(code);
  return c.json(result);
});

authRouter.post("/wallet", async (c) => {
  const { walletAddress, signature, message } = await c.req.json() as {
    walletAddress: string;
    signature: string;
    message: string;
  };
  if (!walletAddress || !signature || !message) {
    throw new HTTPException(400, { message: "Missing required fields: walletAddress, signature, message" });
  }

  const result = await authenticateWithWallet(walletAddress, signature, message);
  return c.json(result);
});

authRouter.get("/me", requireAuth, async (c) => {
  const user = getUser(c);
  const userDTO = await getUserById(user.userId);
  if (!userDTO) throw new HTTPException(404, { message: "User not found" });
  return c.json(userDTO);
});
