import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { addSubscriber, getAllSubscribers, deleteAllSubscribers } from "./db";
import { ENV } from "./_core/env";
import { TRPCError } from "@trpc/server";

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
    
    list: protectedProcedure.query(async ({ ctx }) => {
      // Only the owner can list subscribers
      if (ctx.user?.openId !== ENV.ownerOpenId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
      }
      return await getAllSubscribers();
    }),
    
    exportCsv: protectedProcedure.query(async ({ ctx }) => {
      // Only the owner can export subscribers
      if (ctx.user?.openId !== ENV.ownerOpenId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
      }
      const subscribers = await getAllSubscribers();
      const csvContent = "Email\n" + subscribers.map((s) => s.email).join("\n");
      return { csv: csvContent, filename: "subscribers.csv" };
    }),
    
    clearAll: protectedProcedure.mutation(async ({ ctx }) => {
      // Only the owner can clear all subscribers
      if (ctx.user?.openId !== ENV.ownerOpenId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' });
      }
      return await deleteAllSubscribers();
    }),
  }),
});

export type AppRouter = typeof appRouter;
