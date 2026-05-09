import type {
  AuthResponse,
  GitHubAuthRequest,
  WalletAuthRequest,
  SendMessageRequest,
  MessageDTO,
  CreateTaskRequest,
  TaskDTO,
  TaskStatus,
} from "@cc-community/shared";

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText })) as { message?: string };
      throw new Error(err.message ?? "API request failed");
    }

    return res.json() as Promise<T>;
  }

  // Auth
  authWithGitHub(code: string) {
    return this.request<AuthResponse>("POST", "/api/auth/github", { code } as GitHubAuthRequest);
  }

  authWithWallet(walletAddress: string, signature: string, message: string) {
    return this.request<AuthResponse>("POST", "/api/auth/wallet", { walletAddress, signature, message } as WalletAuthRequest);
  }

  authWithGitHubToken(accessToken: string) {
    return this.request<AuthResponse>("POST", "/api/auth/github/token", { accessToken });
  }

  getMe() {
    return this.request<any>("GET", "/api/auth/me");
  }

  // Messages
  sendMessage(content: string, receiverId?: string, isPublic?: boolean) {
    return this.request<MessageDTO>("POST", "/api/messages", { content, receiverId, isPublic } as SendMessageRequest);
  }

  getInbox() {
    return this.request<MessageDTO[]>("GET", "/api/messages/inbox");
  }

  getFeed(page = 1, limit = 50) {
    return this.request<MessageDTO[]>("GET", `/api/messages/feed?page=${page}&limit=${limit}`);
  }

  // Tasks
  createTask(params: CreateTaskRequest) {
    return this.request<TaskDTO>("POST", "/api/tasks", params);
  }

  listTasks(status?: TaskStatus, page = 1, limit = 20) {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) query.set("status", status);
    return this.request<TaskDTO[]>("GET", `/api/tasks?${query}`);
  }

  getTask(id: string) {
    return this.request<TaskDTO>("GET", `/api/tasks/${id}`);
  }

  assignTask(id: string) {
    return this.request<TaskDTO>("POST", `/api/tasks/${id}/assign`);
  }

  submitTask(id: string, proof?: string) {
    return this.request<TaskDTO>("POST", `/api/tasks/${id}/submit`, { proof });
  }

  completeTask(id: string) {
    return this.request<TaskDTO>("POST", `/api/tasks/${id}/complete`);
  }

  cancelTask(id: string) {
    return this.request<TaskDTO>("POST", `/api/tasks/${id}/cancel`);
  }

  // Payments
  createStripePaymentIntent(taskId: string) {
    return this.request<{ clientSecret: string }>("POST", "/api/payments/stripe/create-payment-intent", { taskId });
  }

  createCryptoEscrow(taskId: string, txHash: string) {
    return this.request<{ status: string }>("POST", "/api/payments/crypto/escrow", { taskId, txHash });
  }

  releaseCryptoEscrow(taskId: string) {
    return this.request<{ status: string }>("POST", "/api/payments/crypto/release", { taskId });
  }

  getPaymentHistory() {
    return this.request<any[]>("GET", "/api/payments/history");
  }

  getBalance() {
    return this.request<{ stripe: number; crypto: number }>("GET", "/api/payments/balance");
  }
}
