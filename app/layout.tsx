import type { Metadata } from "next";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";

// Force dynamic rendering so env vars are read at runtime, not build time
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pastebin",
  description: "Team pastebin for sharing code snippets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use CONVEX_URL (server-only) which is read at runtime
  const convexUrl = process.env.CONVEX_URL!;

  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100">
        <ConvexClientProvider convexUrl={convexUrl}>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
