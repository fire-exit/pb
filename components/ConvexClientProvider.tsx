"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

interface ConvexClientProviderProps {
  children: ReactNode;
  convexUrl: string;
}

export function ConvexClientProvider({
  children,
  convexUrl,
}: ConvexClientProviderProps) {
  const client = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
