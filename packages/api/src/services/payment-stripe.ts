import { PrismaClient, PaymentStatus } from "@prisma/client";
import { HTTPException } from "hono/http-exception";

const prisma = new PrismaClient();

const STRIPE_SECRET_KEY = process.env["STRIPE_SECRET_KEY"] ?? "";
const STRIPE_WEBHOOK_SECRET = process.env["STRIPE_WEBHOOK_SECRET"] ?? "";

function getStripe() {
  const Stripe = await_import_stripe();
  return Stripe;
}

let _stripe: any = null;
async function await_import_stripe() {
  if (!_stripe) {
    const { default: Stripe } = await import("stripe");
    _stripe = new Stripe(STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export async function createStripePaymentIntent(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new HTTPException(404, { message: "Task not found" });
  if (task.creatorId !== userId) throw new HTTPException(403, { message: "Only the task creator can fund" });
  if (task.paymentMethod !== "stripe") throw new HTTPException(400, { message: "Task is not configured for Stripe" });

  const stripe = await await_import_stripe();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(task.rewardAmount * 100), // cents
    currency: "usd",
    metadata: { taskId },
    automatic_payment_methods: { enabled: true },
  });

  // Save payment record
  await prisma.payment.create({
    data: {
      taskId,
      fromUserId: userId,
      amount: task.rewardAmount,
      currency: "USD",
      method: "stripe",
      status: PaymentStatus.PENDING,
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  return { clientSecret: paymentIntent.client_secret };
}

export async function handleStripeWebhook(rawBody: string, signature: string) {
  const stripe = await await_import_stripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new HTTPException(400, { message: "Invalid webhook signature" });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as any;
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: intent.id },
      data: { status: PaymentStatus.COMPLETED, completedAt: new Date() },
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as any;
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: intent.id },
      data: { status: PaymentStatus.FAILED },
    });
  }

  return { received: true };
}

export async function createCryptoEscrow(taskId: string, txHash: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new HTTPException(404, { message: "Task not found" });
  if (task.creatorId !== userId) throw new HTTPException(403, { message: "Only the task creator can fund" });
  if (task.paymentMethod !== "crypto") throw new HTTPException(400, { message: "Task is not configured for crypto" });

  await prisma.payment.create({
    data: {
      taskId,
      fromUserId: userId,
      amount: task.rewardAmount,
      currency: task.rewardCurrency,
      method: "crypto",
      status: PaymentStatus.ESCROW,
      cryptoTxHash: txHash,
    },
  });

  return { status: "escrowed" };
}

export async function releaseCryptoEscrow(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new HTTPException(404, { message: "Task not found" });
  if (task.creatorId !== userId) throw new HTTPException(403, { message: "Only the task creator can release" });

  const payment = await prisma.payment.findFirst({
    where: { taskId, method: "crypto", status: PaymentStatus.ESCROW },
  });
  if (!payment) throw new HTTPException(404, { message: "No escrow payment found" });

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      toUserId: task.assigneeId,
      status: PaymentStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  return { status: "released" };
}

export async function getPaymentHistory(userId: string) {
  return prisma.payment.findMany({
    where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getBalance(userId: string) {
  // For crypto: we'd query the wallet balance via RPC
  // For Stripe: we'd query connect account balance
  // For now return a placeholder structure
  return {
    stripe: 0,
    crypto: 0,
  };
}
