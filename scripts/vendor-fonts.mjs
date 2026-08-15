#!/usr/bin/env node
/**
 * Vendor self-hosted fonts into assets/fonts/.
 * - Pretendard Variable dynamic-subset from npm package `pretendard`
 * - Fraunces + Noto Serif KR (unicode-range) from Google Fonts CSS
 *
 * Usage: node scripts/vendor-fonts.mjs
 * Requires network on first run. Commits the generated assets.
 */
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

async function ensurePretendard() {
  const out = join(root, "assets/fonts/pretendard");
  await mkdir(join(out, "woff2-dynamic-subset"), { recursive: true });
  let pkgRoot;
  try {
    pkgRoot = dirname(require.resolve("pretendard/package.json"));
  } catch {
    console.log("Installing pretendard@1.3.9 (dev)…");
    execSync("npm install --no-save pretendard@1.3.9", { cwd: root, stdio: "inherit" });
    pkgRoot = dirname(require.resolve("pretendard/package.json"));
  }
  const srcCss = join(pkgRoot, "dist/web/variable/pretendardvariable-dynamic-subset.css");
  const srcWoff = join(pkgRoot, "dist/web/variable/woff2-dynamic-subset");
  await writeFile(join(out, "pretendardvariable-dynamic-subset.css"), await readFile(srcCss));
  await cp(srcWoff, join(out, "woff2-dynamic-subset"), { recursive: true });
  try {
    await writeFile(join(out, "LICENSE.txt"), await readFile(join(pkgRoot, "dist/LICENSE.txt")));
  } catch { /* optional */ }
  console.log("Pretendard Variable dynamic-subset → assets/fonts/pretendard/");
}

async function ensureDisplay() {
  const out = join(root, "assets/fonts/display");
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  const gf =
    "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500..800;1,9..144,500..600&family=Noto+Serif+KR:wght@500..800&display=swap";
  const res = await fetch(gf, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`Google Fonts CSS ${res.status}`);
  const raw = await res.text();

  const faces = [];
  for (const m of raw.matchAll(/@font-face\s*\{/g)) {
    const start = m.index;
    let i = start + m[0].length;
    let depth = 1;
    while (i < raw.length && depth) {
      if (raw[i] === "{") depth++;
      else if (raw[i] === "}") depth--;
      i++;
    }
    const block = raw.slice(start, i);
    const pre = raw.slice(Math.max(0, start - 80), start);
    const cm = pre.match(/\/\*\s*([^*]+?)\s*\*\/\s*$/);
    faces.push({ label: cm ? cm[1].trim().toLowerCase() : "", block });
  }

  const localName = (u) => {
    const h = createHash("sha1").update(u).digest("hex").slice(0, 10);
    return (u.toLowerCase().includes("fraunces") ? "fraunces-" : "noto-serif-kr-") + h + ".woff2";
  };

  const needed = new Map();
  const kept = [];
  for (const { label, block } of faces) {
    const fam = block.match(/font-family:\s*'([^']+)'/)?.[1] || "";
    if (fam === "Fraunces" && label !== "latin" && label !== "latin-ext") continue;
    let next = block;
    for (const u of block.match(/url\((https:\/\/[^)]+\.woff2)\)/g) || []) {
      const url = u.slice(4, -1);
      needed.set(url, localName(url));
    }
    next = next.replace(/url\((https:\/\/[^)]+\.woff2)\)/g, (_, url) => `url(./${needed.get(url)})`);
    kept.push((label ? `/* ${label} */\n` : "") + next);
  }

  for (const [url, fname] of needed) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`font download ${fname} ${r.status}`);
    await writeFile(join(out, fname), Buffer.from(await r.arrayBuffer()));
  }
  await writeFile(join(out, "fonts.css"), kept.join("\n\n") + "\n");
  await writeFile(
    join(out, "NOTICE.txt"),
    "Fraunces and Noto Serif KR from Google Fonts; redistributed under OFL. Self-hosted unicode-range subsets.\n"
  );
  console.log(`Display fonts → assets/fonts/display/ (${needed.size} woff2)`);
}

await ensurePretendard();
await ensureDisplay();
console.log("Done.");
