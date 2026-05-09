// ── Enums ──
export enum TaskStatus {
  OPEN = "OPEN",
  ASSIGNED = "ASSIGNED",
  SUBMITTED = "SUBMITTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  ESCROW = "ESCROW",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  STRIPE = "stripe",
  CRYPTO = "crypto",
}

export enum RewardCurrency {
  USD = "USD",
  USDC = "USDC",
}

// ── User ──
export interface UserDTO {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  githubId: string | null;
  walletAddress: string | null;
  createdAt: string;
}

// ── Auth ──
export interface AuthResponse {
  token: string;
  user: UserDTO;
}

export interface GitHubAuthRequest {
  code: string;
}

export interface WalletAuthRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

// ── Message ──
export interface SendMessageRequest {
  content: string;
  receiverId?: string;
  isPublic?: boolean;
}

export interface MessageDTO {
  id: string;
  sender: UserDTO;
  receiver: UserDTO | null;
  content: string;
  isPublic: boolean;
  createdAt: string;
}

// ── Task ──
export interface CreateTaskRequest {
  title: string;
  description: string;
  rewardAmount: number;
  rewardCurrency: RewardCurrency;
  paymentMethod: PaymentMethod;
}

export interface TaskDTO {
  id: string;
  creator: UserDTO;
  assignee: UserDTO | null;
  title: string;
  description: string;
  rewardAmount: number;
  rewardCurrency: string;
  paymentMethod: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface TaskListParams {
  status?: TaskStatus;
  creatorId?: string;
  assigneeId?: string;
  page?: number;
  limit?: number;
}

// ── Payment ──
export interface PaymentDTO {
  id: string;
  taskId: string;
  fromUser: UserDTO;
  toUser: UserDTO | null;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  stripePaymentIntentId: string | null;
  cryptoTxHash: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface CreateStripePaymentRequest {
  taskId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCryptoEscrowRequest {
  taskId: string;
  txHash: string;
}

// ── API Error ──
export interface ApiError {
  error: string;
  message: string;
}
