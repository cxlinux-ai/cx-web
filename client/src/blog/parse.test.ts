import { describe, expect, it, vi } from "vitest";
import { getAllPosts, getPostBySlug } from "./parse";

describe("blog parse", () => {
  it("includes ai-command-line-tools-linux with valid frontmatter", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const post = await getPostBySlug("ai-command-line-tools-linux");

    expect(post).toBeDefined();
    expect(post?.frontmatter.title).toContain("AI Command-Line Tools");
    expect(post?.frontmatter.publishedAt).toBe("2026-07-26");
    expect(
      errorSpy.mock.calls.some((call) =>
        String(call[0]).includes("ai-command-line-tools-linux")
      )
    ).toBe(false);

    const posts = await getAllPosts();
    expect(posts.some((p) => p.slug === "ai-command-line-tools-linux")).toBe(true);

    errorSpy.mockRestore();
  });
});
