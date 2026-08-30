import { describe, expect, it } from "vitest";

describe("public application title", () => {
  it("identifies the hosted application as The Wild Brief", () => {
    expect(process.env.VITE_APP_TITLE).toBe("The Wild Brief");
  });
});
