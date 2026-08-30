import { COOKIE_NAME, OWNER_SESSION_COOKIE } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { addSubscriber, getAllSubscribers, deleteAllSubscribers } from "./db";
import { ENV } from "./_core/env";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// Derives a stable token from the owner password + JWT secret, without ever
// storing the plain password in a cookie. Recomputed on every request, so no
// server-side session store is needed.
function ownerSessionToken(): string {
  return crypto
    .createHmac("sha256", ENV.cookieSecret || "insecure-fallback-secret")
    .update(ENV.ownerPassword)
    .digest("hex");
}

function isOwnerAuthenticated(ctx: { req: { headers: { cookie?: string } } }): boolean {
  if (!ENV.ownerPassword) return false;
  const cookies = ctx.req.headers.cookie ?? "";
  const match = cookies
    .split(";")
    .map(c => c.trim())
    .find(c => c.startsWith(`${OWNER_SESSION_COOKIE}=`));
  if (!match) return false;
  const value = match.slice(OWNER_SESSION_COOKIE.length + 1);
  return value === ownerSessionToken();
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    ownerStatus: publicProcedure.query(({ ctx }) => ({
      isOwner: isOwnerAuthenticated(ctx),
    })),

    ownerLogin: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(({ ctx, input }) => {
        if (!ENV.ownerPassword || input.password !== ENV.ownerPassword) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect password" });
        }
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(OWNER_SESSION_COOKIE, ownerSessionToken(), {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        });
        return { success: true } as const;
      }),

    ownerLogout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(OWNER_SESSION_COOKIE, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  subscribers: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const result = await addSubscriber(input.email);
        return result;
      }),
    
    list: publicProcedure.query(async ({ ctx }) => {
      // Only the owner (password-authenticated) can list subscribers
      if (!isOwnerAuthenticated(ctx)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
      }
      return await getAllSubscribers();
    }),
    
    exportCsv: publicProcedure.query(async ({ ctx }) => {
      // Only the owner (password-authenticated) can export subscribers
      if (!isOwnerAuthenticated(ctx)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
      }
      const subscribers = await getAllSubscribers();
      const csvContent = "Email\n" + subscribers.map((s) => s.email).join("\n");
      return { csv: csvContent, filename: "subscribers.csv" };
    }),
    
    clearAll: publicProcedure.mutation(async ({ ctx }) => {
      // Only the owner (password-authenticated) can clear all subscribers
      if (!isOwnerAuthenticated(ctx)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
      }
      return await deleteAllSubscribers();
    }),
  }),
});

export type AppRouter = typeof appRouter;
