import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { addSubscriber, getAllSubscribers, deleteAllSubscribers } from "./db";
import { ENV } from "./_core/env";
import { TRPCError } from "@trpc/server";

// Checks the password on every single call, with no session or cookie.
// This means the owner password must be re-entered every time the
// subscriber panel is opened, by design.
function assertOwnerPassword(password: string) {
  if (!ENV.ownerPassword || password !== ENV.ownerPassword) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect password" });
  }
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
  }),

  subscribers: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const result = await addSubscriber(input.email);
        return result;
      }),

    list: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        assertOwnerPassword(input.password);
        return await getAllSubscribers();
      }),

    exportCsv: publicProcedure
      .input(z.object({ password: z.string() }))
      .query(async ({ input }) => {
        assertOwnerPassword(input.password);
        const subscribers = await getAllSubscribers();
        const csvContent = "Email\n" + subscribers.map((s) => s.email).join("\n");
        return { csv: csvContent, filename: "subscribers.csv" };
      }),

    clearAll: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        assertOwnerPassword(input.password);
        return await deleteAllSubscribers();
      }),
  }),
});

export type AppRouter = typeof appRouter;
