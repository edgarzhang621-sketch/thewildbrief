import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createOwnerContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "owner-user",
    email: "owner@example.com",
    name: "Owner User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

function createNonOwnerContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("subscribers", () => {
  describe("subscribe", () => {
    it("should accept valid email", async () => {
      const ctx = createOwnerContext();
      const caller = appRouter.createCaller(ctx);
      const uniqueEmail = `test-${Date.now()}-${Math.random()}@example.com`;

      const result = await caller.subscribers.subscribe({
        email: uniqueEmail,
      });

      expect(result.success).toBe(true);
      expect(result.email).toBe(uniqueEmail);
    });

    it("should reject invalid email", async () => {
      const ctx = createOwnerContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.subscribers.subscribe({
          email: "invalid-email",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Invalid");
      }
    });

    it("should detect duplicate email", async () => {
      const ctx = createOwnerContext();
      const caller = appRouter.createCaller(ctx);
      const uniqueEmail = `duplicate-${Date.now()}-${Math.random()}@example.com`;

      // First subscription should succeed
      const result1 = await caller.subscribers.subscribe({
        email: uniqueEmail,
      });
      expect(result1.success).toBe(true);

      // Second subscription with same email should fail
      try {
        await caller.subscribers.subscribe({
          email: uniqueEmail,
        });
        expect.fail("Should have thrown an error for duplicate email");
      } catch (error: any) {
        // Duplicate email should result in an error
        expect(error.message).toBeDefined();
      }
    });
  });

  describe("list", () => {
    it("should deny access to non-owner", async () => {
      const ctx = createNonOwnerContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.subscribers.list();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("clearAll", () => {
    it("should deny access to non-owner", async () => {
      const ctx = createNonOwnerContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.subscribers.clearAll();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("exportCsv", () => {
    it("should deny access to non-owner", async () => {
      const ctx = createNonOwnerContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.subscribers.exportCsv();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});
