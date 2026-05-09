import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requireAuth, getUser } from "../middleware/auth.js";
import {
  createTask,
  listTasks,
  getTaskById,
  assignTask,
  submitTask,
  completeTask,
  cancelTask,
} from "../services/task.js";

export const tasksRouter = new Hono();

tasksRouter.post("/", requireAuth, async (c) => {
  const user = getUser(c);
  const body = await c.req.json() as {
    title: string;
    description: string;
    rewardAmount: number;
    rewardCurrency?: string;
    paymentMethod?: string;
  };
  if (!body.title?.trim()) throw new HTTPException(400, { message: "Title is required" });
  if (!body.description?.trim()) throw new HTTPException(400, { message: "Description is required" });
  if (!body.rewardAmount || body.rewardAmount <= 0) throw new HTTPException(400, { message: "Reward must be positive" });

  const task = await createTask({
    creatorId: user.userId,
    title: body.title.trim(),
    description: body.description.trim(),
    rewardAmount: body.rewardAmount,
    rewardCurrency: body.rewardCurrency ?? "USD",
    paymentMethod: body.paymentMethod ?? "stripe",
  });
  return c.json(task, 201);
});

tasksRouter.get("/", requireAuth, async (c) => {
  const user = getUser(c);
  const status = c.req.query("status");
  const page = parseInt(c.req.query("page") ?? "1", 10);
  const limit = parseInt(c.req.query("limit") ?? "20", 10);

  const tasks = await listTasks({
    status: status as any,
    page,
    limit,
    userId: user.userId,
  });
  return c.json(tasks);
});

tasksRouter.get("/:id", requireAuth, async (c) => {
  const id = c.req.param("id");
  if (!id) throw new HTTPException(400, { message: "Missing task ID" });
  const task = await getTaskById(id);
  if (!task) throw new HTTPException(404, { message: "Task not found" });
  return c.json(task);
});

tasksRouter.post("/:id/assign", requireAuth, async (c) => {
  const id = c.req.param("id");
  if (!id) throw new HTTPException(400, { message: "Missing task ID" });
  const user = getUser(c);
  const task = await assignTask(id, user.userId);
  return c.json(task);
});

tasksRouter.post("/:id/submit", requireAuth, async (c) => {
  const id = c.req.param("id");
  if (!id) throw new HTTPException(400, { message: "Missing task ID" });
  const user = getUser(c);
  const body = await c.req.json() as { proof?: string };
  const task = await submitTask(id, user.userId, body.proof);
  return c.json(task);
});

tasksRouter.post("/:id/complete", requireAuth, async (c) => {
  const id = c.req.param("id");
  if (!id) throw new HTTPException(400, { message: "Missing task ID" });
  const user = getUser(c);
  const task = await completeTask(id, user.userId);
  return c.json(task);
});

tasksRouter.post("/:id/cancel", requireAuth, async (c) => {
  const id = c.req.param("id");
  if (!id) throw new HTTPException(400, { message: "Missing task ID" });
  const user = getUser(c);
  const task = await cancelTask(id, user.userId);
  return c.json(task);
});
