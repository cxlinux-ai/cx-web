import { readFileSync } from "node:fs";
import { globSync } from "glob";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const clientSrc = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function readAllSourceFiles(): string[] {
  return globSync("**/*.{ts,tsx}", {
    cwd: clientSrc,
    absolute: true,
    ignore: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
  }).map((file) => readFileSync(file, "utf8"));
}

describe("marketing copy consistency", () => {
  it("does not use deprecated cx license activate in src", () => {
    const combined = readAllSourceFiles().join("\n");
    expect(combined).not.toMatch(/cx license activate/i);
  });

  it("does not use legacy key.gpg apt snippet in src", () => {
    const combined = readAllSourceFiles().join("\n");
    expect(combined).not.toContain("repo.cxlinux.com/key.gpg");
    expect(combined).not.toContain("/etc/apt/keyrings/cxlinux.gpg");
  });
});
