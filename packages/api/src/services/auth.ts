import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { verifyMessage } from "ethers";
import { getJwtSecret } from "../middleware/auth.js";
import type { UserDTO } from "@cc-community/shared";

const prisma = new PrismaClient();

function toUserDTO(user: { id: string; username: string; displayName: string | null; bio: string | null; githubId: string | null; walletAddress: string | null; createdAt: Date }): UserDTO {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    githubId: user.githubId,
    walletAddress: user.walletAddress,
    createdAt: user.createdAt.toISOString(),
  };
}

function generateToken(userId: string, username: string): string {
  return jwt.sign({ userId, username }, getJwtSecret(), { expiresIn: "7d" });
}

export async function authenticateWithGitHub(code: string) {
  const GITHUB_CLIENT_ID = process.env["GITHUB_CLIENT_ID"];
  const GITHUB_CLIENT_SECRET = process.env["GITHUB_CLIENT_SECRET"];

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    throw new Error("GitHub OAuth not configured");
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
  if (!tokenData.access_token) {
    throw new Error(`GitHub OAuth failed: ${tokenData.error}`);
  }

  // Fetch user info
  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const githubUser = await userRes.json() as { id: number; login: string; name: string | null; bio: string | null };

  // Upsert user
  const user = await prisma.user.upsert({
    where: { githubId: String(githubUser.id) },
    update: { username: githubUser.login, displayName: githubUser.name },
    create: {
      githubId: String(githubUser.id),
      username: githubUser.login,
      displayName: githubUser.name,
      bio: githubUser.bio,
    },
  });

  return {
    token: generateToken(user.id, user.username),
    user: toUserDTO(user),
  };
}

export async function authenticateWithWallet(walletAddress: string, signature: string, message: string) {
  // Verify the signature matches the wallet address
  const recoveredAddress = verifyMessage(message, signature);

  if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error("Invalid wallet signature");
  }

  // Upsert user by wallet address
  const user = await prisma.user.upsert({
    where: { walletAddress: walletAddress.toLowerCase() },
    update: {},
    create: {
      walletAddress: walletAddress.toLowerCase(),
      username: `wallet-${walletAddress.slice(2, 10).toLowerCase()}`,
    },
  });

  return {
    token: generateToken(user.id, user.username),
    user: toUserDTO(user),
  };
}

export async function getUserById(id: string): Promise<UserDTO | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toUserDTO(user) : null;
}
