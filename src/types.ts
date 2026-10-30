// SPDX-License-Identifier: MIT
/** Typed API request/response models (from manifest input/output schemas). */

import { z } from "zod";

import { PepkioAPIError } from "./errors.js";

export const MolMassConverterToolInputSchema = z
  .object({
    mode: z.string(),
    molecule_type: z.string(),
    anchor_field: z.string().optional(),
    anchor_value: z.number().optional(),
    length_bp: z.number().int().optional(),
    mw_kda: z.number().optional(),
    sequence: z.string().optional(),
    pathlength_cm: z.number().optional(),
    csv_text: z.string().optional(),
    default_length_bp: z.number().int().optional(),
    default_mw_kda: z.number().optional(),
    a260: z.number().optional(),
    a280: z.number().optional(),
    a230: z.number().optional(),
    dilution: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export type MolMassConverterToolInput = z.infer<typeof MolMassConverterToolInputSchema>;

export const MolMassConverterToolOutputSchema = z
  .object({
    mode: z.string().optional(),
    fields: z.record(z.string(), z.unknown()).optional(),
    warnings: z.array(z.unknown()).optional(),
    coefficient_source: z.string().optional(),
    error: z.string().optional(),
  })
  .passthrough();

export type MolMassConverterToolOutput = z.infer<typeof MolMassConverterToolOutputSchema>;

export const RunResultSchema = z
  .object({
    run_id: z.string(),
    status: z.string(),
    result: z.record(z.string(), z.unknown()).nullable().optional(),
    error: z
      .object({
        code: z.string().optional(),
        message: z.string().optional(),
        details: z.record(z.string(), z.unknown()).optional(),
      })
      .nullable()
      .optional(),
    result_url: z.string().nullable().optional(),
    permalink: z.string().nullable().optional(),
    duration_ms: z.number().nullable().optional(),
  })
  .passthrough();

export type RunResult = z.infer<typeof RunResultSchema>;

export function parseRunResponse(data: Record<string, unknown>): RunResult {
  return RunResultSchema.parse(data);
}

export function raiseForError(result: RunResult): void {
  if (!result.error) {
    return;
  }
  const err = result.error;
  throw new PepkioAPIError(err.message ?? "Tool run failed", {
    code: err.code,
    responseBody: {
      run_id: result.run_id,
      status: result.status,
      error: result.error,
    },
  });
}
