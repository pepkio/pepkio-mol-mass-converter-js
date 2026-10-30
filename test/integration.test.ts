/** Integration tests against live Pepkio Tools API. */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { describe, expect, it } from "vitest";

import { PepkioClient } from "../src/client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load monorepo .env for local integration runs (never log keys).
const monorepoEnv = resolve(__dirname, "../../../.env");
if (existsSync(monorepoEnv)) {
  loadEnv({ path: monorepoEnv });
}

const packageEnv = resolve(__dirname, "../.env");
if (existsSync(packageEnv)) {
  loadEnv({ path: packageEnv });
}

const allEnvironments = [
  { name: "local", baseUrl: "https://tools.localtest.me" },
  { name: "production", baseUrl: "https://tools.pepkio.com" },
] as const;

const requestedBase = process.env.PEPKIO_API_BASE_URL?.replace(/\/$/, "");
const environments = requestedBase
  ? allEnvironments.filter((env) => env.baseUrl === requestedBase)
  : allEnvironments;

const EXPECTED_EXAMPLES = [
  "dsdna_od1_1000bp",
  "bsa_1mg_ml",
  "purity_dsdna_clean",
  "batch_three_rows",
] as const;

function apiKeyFor(baseUrl: string): string | undefined {
  if (baseUrl.includes("localtest.me")) {
    return process.env.LOCAL_PEPKIO_API_KEY ?? process.env.PEPKIO_API_KEY;
  }
  return process.env.PEPKIO_API_KEY;
}

function clientFor(env: (typeof environments)[number]): PepkioClient | null {
  const apiKey = apiKeyFor(env.baseUrl);
  if (!apiKey) {
    return null;
  }
  return new PepkioClient({ apiKey, baseUrl: env.baseUrl });
}

describe.each(environments)("$name integration", (env) => {
  const client = clientFor(env);
  const maybeIt = client ? it : it.skip;

  maybeIt("fetches manifest", async () => {
    const manifest = await client!.getManifest({ refresh: true });
    expect(manifest.tool_id).toBe("mol-mass-converter");
    const names = await client!.listExamples();
    for (const expected of EXPECTED_EXAMPLES) {
      expect(names).toContain(expected);
    }
  });

  maybeIt("runs dsdna_od1_1000bp example", async () => {
    const input = await client!.getExampleInput("dsdna_od1_1000bp");
    const result = await client!.run(input);
    expect(result.status).toBe("completed");
    expect(result.run_id).toBeTruthy();
    expect(result.permalink).toBeTruthy();
    expect(result.result).toBeTruthy();
    expect(result.result?.mode).toBe("converter");
    const fields = result.result?.fields as Record<string, unknown> | undefined;
    expect(fields).toBeTruthy();
    expect(typeof fields?.ng_per_uL).toBe("number");
    expect(typeof fields?.nM).toBe("number");
    expect(result.error).toBeNull();
  });

  maybeIt("runs bsa_1mg_ml example", async () => {
    const input = await client!.getExampleInput("bsa_1mg_ml");
    const result = await client!.run(input);
    expect(result.status).toBe("completed");
    expect(result.result?.mode).toBe("converter");
    const fields = result.result?.fields as Record<string, unknown> | undefined;
    expect(typeof fields?.uM).toBe("number");
    expect(Number(fields?.uM)).toBeGreaterThan(0);
  });

  maybeIt("runs purity_dsdna_clean example", async () => {
    const input = await client!.getExampleInput("purity_dsdna_clean");
    const result = await client!.run(input);
    expect(result.status).toBe("completed");
    expect(result.result?.mode).toBe("purity");
    const resultBody = result.result as Record<string, unknown>;
    expect(
      resultBody.ratio_260_280 !== undefined || resultBody.flag_260_280 !== undefined,
    ).toBe(true);
  });

  maybeIt("runs batch_three_rows example", async () => {
    const input = await client!.getExampleInput("batch_three_rows");
    const result = await client!.run(input);
    expect(result.status).toBe("completed");
    expect(result.result?.mode).toBe("batch");
    const resultBody = result.result as Record<string, unknown>;
    expect(resultBody.has_errors).toBe(false);
  });
});
