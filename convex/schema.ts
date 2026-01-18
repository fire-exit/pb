import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  pastes: defineTable({
    shortId: v.string(),
    content: v.string(),
    language: v.string(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_shortId", ["shortId"])
    .index("by_expiresAt", ["expiresAt"]),
});
