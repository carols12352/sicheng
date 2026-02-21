#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";

async function loadLocalEnv() {
  const envFiles = [".env.local", ".env"];

  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    try {
      const content = await readFile(filePath, "utf8");
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
          continue;
        }
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex <= 0) {
          continue;
        }
        const key = trimmed.slice(0, eqIndex).trim();
        let value = trimmed.slice(eqIndex + 1).trim();
        if (
          (value.startsWith("\"") && value.endsWith("\"")) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (key && process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch {
      // Ignore missing env files.
    }
  }
}

function parseArgs(argv) {
  const args = {
    all: false,
    urls: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--all") {
      args.all = true;
      continue;
    }
    if (token === "--url") {
      const value = argv[i + 1];
      if (value) {
        args.urls.push(...value.split(",").map((item) => item.trim()).filter(Boolean));
        i += 1;
      }
    }
  }

  return args;
}

function parseSitemapUrls(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches
    .map((match) => match[1]?.trim())
    .filter(Boolean);
}

function chunk(values, size) {
  const output = [];
  for (let i = 0; i < values.length; i += size) {
    output.push(values.slice(i, i + size));
  }
  return output;
}

async function fetchSitemapUrls(siteUrl) {
  const sitemapUrl = new URL("/sitemap.xml", siteUrl).toString();
  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
  }
  const xml = await response.text();
  return parseSitemapUrls(xml);
}

async function submitBatch({ endpoint, host, key, keyLocation, urls }) {
  const payload = {
    host,
    key,
    keyLocation,
    urlList: urls,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`IndexNow rejected batch: ${response.status} ${response.statusText}\n${body}`);
  }
}

async function main() {
  await loadLocalEnv();

  const args = parseArgs(process.argv.slice(2));
  const endpoint = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sicheng.dev";
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    throw new Error("Missing INDEXNOW_KEY.");
  }

  const host = process.env.INDEXNOW_HOST || new URL(siteUrl).host;
  const keyLocation =
    process.env.INDEXNOW_KEY_LOCATION ||
    new URL(`/${key}.txt`, siteUrl).toString();

  const collected = new Set(args.urls);
  if (args.all || collected.size === 0) {
    const sitemapUrls = await fetchSitemapUrls(siteUrl);
    sitemapUrls.forEach((url) => collected.add(url));
  }

  const urls = [...collected].filter((url) => {
    try {
      return new URL(url).host === host;
    } catch {
      return false;
    }
  });

  if (urls.length === 0) {
    throw new Error("No valid URLs to submit.");
  }

  const batches = chunk(urls, 10000);
  for (const batch of batches) {
    await submitBatch({ endpoint, host, key, keyLocation, urls: batch });
  }

  console.log(`IndexNow submitted ${urls.length} URLs in ${batches.length} batch(es).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
