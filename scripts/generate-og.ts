import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import matter from "gray-matter";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { createElement } from "react";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "og");
mkdirSync(OUT_DIR, { recursive: true });

// Load Inter font for satori
const interFontPath = join(ROOT, "node_modules", "@fontsource", "inter", "files", "inter-latin-700-normal.woff");
let fontBuffer: Buffer;
try {
  fontBuffer = readFileSync(interFontPath);
} catch {
  // Fallback: use a system font path
  console.warn("Inter font not found via @fontsource, using fallback");
  fontBuffer = Buffer.alloc(0);
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

async function generateOg(slug: string, title: string, description: string, tags: string[], readingTime: number, author: string) {
  const tag = tags[0] ?? "";

  const svg = await satori(
    createElement("div", {
      style: {
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        background: "#1E1E1E",
        padding: "56px 64px",
        position: "relative",
      },
    },
      // Green radial glow (top right)
      createElement("div", {
        style: {
          position: "absolute",
          top: 0,
          right: 0,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,255,159,0.08) 0%, transparent 70%)",
        },
      }),
      // Wordmark
      createElement("div", {
        style: { display: "flex", alignItems: "center", gap: 6, marginBottom: "auto" },
      },
        createElement("span", { style: { color: "#FFFFFF", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" } }, "CX"),
        createElement("span", { style: { color: "#00FF9F", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" } }, "LINUX"),
      ),
      // Title
      createElement("div", {
        style: {
          color: "#FFFFFF",
          fontSize: title.length > 50 ? 54 : 68,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          maxWidth: 960,
          marginBottom: 20,
        },
      }, truncate(title, 80)),
      // Description
      createElement("div", {
        style: {
          color: "#9CA3AF",
          fontSize: 20,
          lineHeight: 1.5,
          maxWidth: 880,
          marginBottom: 40,
        },
      }, truncate(description, 120)),
      // Footer row
      createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 24,
        },
      },
        createElement("div", {
          style: { display: "flex", alignItems: "center", gap: 16, color: "#6B7280", fontSize: 16 },
        },
          createElement("span", {}, author),
          createElement("span", {}, "·"),
          createElement("span", {}, `${readingTime} min read`),
        ),
        tag && createElement("div", {
          style: {
            background: "rgba(0,255,159,0.1)",
            border: "1px solid rgba(0,255,159,0.3)",
            borderRadius: 6,
            padding: "6px 14px",
            color: "#00FF9F",
            fontSize: 13,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          },
        }, tag),
      ),
      // Bottom accent bar
      createElement("div", {
        style: {
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 200,
          height: 4,
          background: "#00FF9F",
          borderRadius: "0 2px 0 0",
        },
      }),
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontBuffer.length > 0 ? [{ name: "Inter", data: fontBuffer, weight: 700, style: "normal" }] : [],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const png = resvg.render().asPng();
  writeFileSync(join(OUT_DIR, `${slug}.png`), png);
  console.log(`✓ /public/og/${slug}.png`);
}

async function main() {
  const files = await glob(join(ROOT, "content", "blog", "*.mdx"));
  for (const file of files) {
    const src = readFileSync(file, "utf-8");
    const { data } = matter(src);
    if (data.draft) continue;

    const slug = file.replace(/^.*\/([^/]+)\.mdx$/, "$1");
    const words = src.replace(/---[\s\S]*?---/, "").trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    await generateOg(slug, data.title ?? slug, data.description ?? "", data.tags ?? [], readingTime, "CX Linux Team");
  }
  console.log("OG images generated.");
}

main().catch(console.error);
