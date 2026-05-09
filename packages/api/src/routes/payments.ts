import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requireAuth, getUser } from "../middleware/auth.js";
import {
  createStripePaymentIntent,
  handleStripeWebhook,
  createCryptoEscrow,
  releaseCryptoEscrow,
  getPaymentHistory,
  getBalance,
} from "../services/payment-stripe.js";

export const paymentsRouter = new Hono();

// Stripe
paymentsRouter.post("/stripe/create-payment-intent", requireAuth, async (c) => {
  const user = getUser(c);
  const body = await c.req.json() as { taskId: string };
  if (!body.taskId) throw new HTTPException(400, { message: "taskId is required" });

  const result = await createStripePaymentIntent(body.taskId, user.userId);
  return c.json(result);
});

paymentsRouter.post("/stripe/webhook", async (c) => {
  const raw = await c.req.text();
  const signature = c.req.header("stripe-signature");
  if (!signature) throw new HTTPException(400, { message: "Missing stripe-signature header" });

  const result = await handleStripeWebhook(raw, signature);
  return c.json(result);
});

// Crypto
paymentsRouter.post("/crypto/escrow", requireAuth, async (c) => {
  const user = getUser(c);
  const body = await c.req.json() as { taskId: string; txHash: string };
  if (!body.taskId || !body.txHash) throw new HTTPException(400, { message: "taskId and txHash are required" });

  const result = await createCryptoEscrow(body.taskId, body.txHash, user.userId);
  return c.json(result);
});

paymentsRouter.post("/crypto/release", requireAuth, async (c) => {
  const user = getUser(c);
  const body = await c.req.json() as { taskId: string };
  if (!body.taskId) throw new HTTPException(400, { message: "taskId is required" });

  const result = await releaseCryptoEscrow(body.taskId, user.userId);
  return c.json(result);
});

// History & Balance
paymentsRouter.get("/history", requireAuth, async (c) => {
  const user = getUser(c);
  const history = await getPaymentHistory(user.userId);
  return c.json(history);
});

paymentsRouter.get("/balance", requireAuth, async (c) => {
  const user = getUser(c);
  const balance = await getBalance(user.userId);
  return c.json(balance);
});
