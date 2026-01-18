import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    shortId: v.string(),
    content: v.string(),
    language: v.string(),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("pastes", {
      shortId: args.shortId,
      content: args.content,
      language: args.language,
      expiresAt: args.expiresAt,
    });
    return id;
  },
});

export const getByShortId = query({
  args: { shortId: v.string() },
  handler: async (ctx, args) => {
    const paste = await ctx.db
      .query("pastes")
      .withIndex("by_shortId", (q) => q.eq("shortId", args.shortId))
      .first();
    return paste;
  },
});

export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("pastes")
      .withIndex("by_expiresAt")
      .filter((q) =>
        q.and(
          q.neq(q.field("expiresAt"), undefined),
          q.lt(q.field("expiresAt"), now)
        )
      )
      .collect();

    for (const paste of expired) {
      await ctx.db.delete(paste._id);
    }

    return { deleted: expired.length };
  },
});
