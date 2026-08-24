export type ProviderMode = "live" | "fixture" | "unavailable";

export type ApiReceipt = {
  provider: "xano" | "nutrient" | "serpapi" | "perfect";
  operation: string;
  mode: ProviderMode;
  status: "success" | "blocked" | "pending";
  resourceId?: string;
  durationMs?: number;
  timestamp: string;
};

export type ExtractionResult = {
  workflowId?: number;
  productName: string;
  category: string;
  shade: string;
  claims: Array<{
    field: string;
    value: string;
    confidence: number;
    source: string;
    page: number;
    status: "verified" | "conflict";
  }>;
  receipts: ApiReceipt[];
};

export type TryOnResult = {
  resultUrl: string;
  sourceImageUrl: string;
  templateId: string;
  templateTitle: string;
  receipts: ApiReceipt[];
};

const API_BASE = (import.meta.env.VITE_XANO_API_BASE ?? "").replace(/\/$/, "");
export const fixtureMode = import.meta.env.VITE_FIXTURE_MODE !== "false" || !API_BASE;
let activeWorkflowId: number | null = null;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function receipt(provider: ApiReceipt["provider"], operation: string, mode: ProviderMode): ApiReceipt {
  return {
    provider,
    operation,
    mode,
    status: "success",
    resourceId: `${provider}_${crypto.randomUUID().slice(0, 8)}`,
    durationMs: mode === "live" ? undefined : 240 + Math.floor(Math.random() * 180),
    timestamp: new Date().toISOString(),
  };
}

async function xanoRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE) throw new Error("Xano API base URL is not configured.");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 45_000);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    if (!response.ok) throw new Error(`Xano request failed with ${response.status}.`);
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function extractDossier(): Promise<ExtractionResult> {
  if (!fixtureMode) {
    const result = await xanoRequest<ExtractionResult>("/brandproof/extract", {
      method: "POST",
      body: JSON.stringify({ dossier: "luma-veil-demo" }),
    });
    if (!result.workflowId) throw new Error("Xano did not return a workflow ID.");
    activeWorkflowId = result.workflowId;
    return result;
  }
  await wait(850);
  return {
    productName: "Luma Veil Skin Tint",
    category: "Complexion / SPF",
    shade: "Sunlit 04",
    claims: [
      { field: "Finish", value: "Natural satin", confidence: 0.98, source: "Product specification", page: 1, status: "verified" },
      { field: "Coverage", value: "Light, buildable", confidence: 0.96, source: "Product specification", page: 1, status: "verified" },
      { field: "SPF", value: "SPF 50", confidence: 0.99, source: "Marketing sheet", page: 2, status: "conflict" },
      { field: "SPF", value: "SPF 30", confidence: 0.97, source: "Laboratory certificate", page: 3, status: "conflict" },
      { field: "Fragrance", value: "Fragrance free", confidence: 0.94, source: "Product specification", page: 1, status: "verified" },
    ],
    receipts: [
      receipt("xano", "workflow.start", "fixture"),
      receipt("nutrient", "document.extract", "fixture"),
    ],
  };
}

export async function resolveConflict(approvedSpf: number): Promise<ApiReceipt> {
  if (!fixtureMode) {
    if (!activeWorkflowId) throw new Error("Start the Xano workflow before recording a review.");
    return xanoRequest<ApiReceipt>("/brandproof/review", {
      method: "POST",
      body: JSON.stringify({ workflowId: activeWorkflowId, field: "spf", approvedValue: approvedSpf, reason: "Lab certificate governs public claim" }),
    });
  }
  await wait(450);
  return receipt("xano", "review.resolve", "fixture");
}

export async function scanMarket(): Promise<{ insights: string[]; receipts: ApiReceipt[] }> {
  if (!fixtureMode) {
    if (!activeWorkflowId) throw new Error("Start the Xano workflow before scanning the market.");
    return xanoRequest("/brandproof/market-scan", { method: "POST", body: JSON.stringify({ workflowId: activeWorkflowId }) });
  }
  await wait(700);
  return {
    insights: [
      "Comparable skin tints cluster between $34–$46.",
      "Two current listings use “Luma” in adjacent beauty categories.",
      "Fragrance-free is prominent in 7 of the first 10 structured results.",
    ],
    receipts: [
      receipt("xano", "agent.market_scan", "fixture"),
      receipt("serpapi", "google_shopping.search", "fixture"),
    ],
  };
}

export async function configureTryOn(): Promise<TryOnResult> {
  if (!fixtureMode) {
    if (!activeWorkflowId) throw new Error("Start the Xano workflow before configuring try-on.");
    return xanoRequest("/brandproof/try-on", { method: "POST", body: JSON.stringify({ workflowId: activeWorkflowId }) });
  }
  await wait(650);
  return {
    resultUrl: "./perfect-demo-face.jpg",
    sourceImageUrl: "./perfect-demo-face.jpg",
    templateId: "fixture-neutral-look",
    templateTitle: "Fixture neutral look",
    receipts: [
      receipt("xano", "experience.configure", "fixture"),
      receipt("perfect", "look_vto.task", "fixture"),
    ],
  };
}
