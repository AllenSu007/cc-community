import { PrismaClient, TaskStatus } from "@prisma/client";
import { HTTPException } from "hono/http-exception";
import type { TaskDTO } from "@cc-community/shared";

const prisma = new PrismaClient();

function toTaskDTO(t: {
  id: string; creatorId: string; assigneeId: string | null;
  title: string; description: string; rewardAmount: number;
  rewardCurrency: string; paymentMethod: string; status: TaskStatus;
  createdAt: Date; updatedAt: Date; completedAt: Date | null;
  creator: any; assignee: any;
}): TaskDTO {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    rewardAmount: t.rewardAmount,
    rewardCurrency: t.rewardCurrency,
    paymentMethod: t.paymentMethod,
    status: t.status as any,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    completedAt: t.completedAt?.toISOString() ?? null,
    creator: {
      id: t.creator.id, username: t.creator.username,
      displayName: t.creator.displayName, bio: t.creator.bio,
      githubId: t.creator.githubId, walletAddress: t.creator.walletAddress,
      createdAt: t.creator.createdAt.toISOString(),
    },
    assignee: t.assignee ? {
      id: t.assignee.id, username: t.assignee.username,
      displayName: t.assignee.displayName, bio: t.assignee.bio,
      githubId: t.assignee.githubId, walletAddress: t.assignee.walletAddress,
      createdAt: t.assignee.createdAt.toISOString(),
    } : null,
  };
}

export async function createTask(params: {
  creatorId: string; title: string; description: string;
  rewardAmount: number; rewardCurrency: string; paymentMethod: string;
}) {
  const task = await prisma.task.create({
    data: params,
    include: { creator: true, assignee: true },
  });
  return toTaskDTO(task);
}

export async function listTasks(params: { status?: TaskStatus; page: number; limit: number; userId?: string }) {
  const where: any = {};
  if (params.status) where.status = params.status;

  const tasks = await prisma.task.findMany({
    where,
    include: { creator: true, assignee: true },
    orderBy: { createdAt: "desc" },
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  });
  return tasks.map(toTaskDTO);
}

export async function getTaskById(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: { creator: true, assignee: true },
  });
  return task ? toTaskDTO(task) : null;
}

export async function assignTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new HTTPException(404, { message: "Task not found" });
  if (task.status !== TaskStatus.OPEN) throw new HTTPException(400, { message: "Task is not open for assignment" });
  if (task.creatorId === userId) throw new HTTPException(400, { message: "Cannot assign your own task" });

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId: userId, status: TaskStatus.ASSIGNED },
    include: { creator: true, assignee: true },
  });
  return toTaskDTO(updated);
}

export async function submitTask(taskId: string, userId: string, proof?: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new HTTPException(404, { message: "Task not found" });
  if (task.assigneeId !== userId) throw new HTTPException(403, { message: "Only the assignee can submit" });
  if (task.status !== TaskStatus.ASSIGNED) throw new HTTPException(400, { message: "Task is not in ASSIGNED status" });

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: TaskStatus.SUBMITTED },
    include: { creator: true, assignee: true },
  });
  return toTaskDTO(updated);
}

export async function completeTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new HTTPException(404, { message: "Task not found" });
  if (task.creatorId !== userId) throw new HTTPException(403, { message: "Only the creator can mark as complete" });
  if (task.status !== TaskStatus.SUBMITTED) throw new HTTPException(400, { message: "Task is not in SUBMITTED status" });

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: TaskStatus.COMPLETED, completedAt: new Date() },
    include: { creator: true, assignee: true },
  });
  return toTaskDTO(updated);
}

export async function cancelTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new HTTPException(404, { message: "Task not found" });
  if (task.creatorId !== userId) throw new HTTPException(403, { message: "Only the creator can cancel" });
  if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED) {
    throw new HTTPException(400, { message: "Task is already finished" });
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: TaskStatus.CANCELLED },
    include: { creator: true, assignee: true },
  });
  return toTaskDTO(updated);
}
