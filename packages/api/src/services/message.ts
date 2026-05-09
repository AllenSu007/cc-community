import { PrismaClient } from "@prisma/client";
import type { MessageDTO } from "@cc-community/shared";

const prisma = new PrismaClient();

function toMessageDTO(msg: {
  id: string;
  senderId: string;
  receiverId: string | null;
  content: string;
  isPublic: boolean;
  createdAt: Date;
  sender: { id: string; username: string; displayName: string | null; bio: string | null; githubId: string | null; walletAddress: string | null; createdAt: Date };
  receiver: { id: string; username: string; displayName: string | null; bio: string | null; githubId: string | null; walletAddress: string | null; createdAt: Date } | null;
}): MessageDTO {
  return {
    id: msg.id,
    content: msg.content,
    isPublic: msg.isPublic,
    createdAt: msg.createdAt.toISOString(),
    sender: {
      id: msg.sender.id,
      username: msg.sender.username,
      displayName: msg.sender.displayName,
      bio: msg.sender.bio,
      githubId: msg.sender.githubId,
      walletAddress: msg.sender.walletAddress,
      createdAt: msg.sender.createdAt.toISOString(),
    },
    receiver: msg.receiver
      ? {
          id: msg.receiver.id,
          username: msg.receiver.username,
          displayName: msg.receiver.displayName,
          bio: msg.receiver.bio,
          githubId: msg.receiver.githubId,
          walletAddress: msg.receiver.walletAddress,
          createdAt: msg.receiver.createdAt.toISOString(),
        }
      : null,
  };
}

export async function sendMessage(params: {
  senderId: string;
  content: string;
  receiverId?: string;
  isPublic: boolean;
}) {
  const msg = await prisma.message.create({
    data: {
      senderId: params.senderId,
      content: params.content,
      receiverId: params.receiverId ?? null,
      isPublic: params.isPublic,
    },
    include: { sender: true, receiver: true },
  });
  return toMessageDTO(msg);
}

export async function getInbox(userId: string) {
  const msgs = await prisma.message.findMany({
    where: { receiverId: userId },
    include: { sender: true, receiver: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return msgs.map(toMessageDTO);
}

export async function getPublicFeed(page: number, limit: number) {
  const msgs = await prisma.message.findMany({
    where: { isPublic: true },
    include: { sender: true, receiver: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  return msgs.map(toMessageDTO);
}
