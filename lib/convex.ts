import { ConvexHttpClient } from "convex/browser";

let httpClient: ConvexHttpClient | null = null;
let lastUrl: string | null = null;

export function getConvexHttpClient(): ConvexHttpClient {
  const url = process.env.CONVEX_URL;
  if (!url) {
    throw new Error("CONVEX_URL environment variable is not set");
  }
  // Recreate client if URL changed (shouldn't happen in practice, but handles edge cases)
  if (!httpClient || lastUrl !== url) {
    httpClient = new ConvexHttpClient(url);
    lastUrl = url;
  }
  return httpClient;
}
