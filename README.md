# Pepkio Molecular Mass Converter

Node.js ESM library and CLI that runs OD₂₆₀, mass, molar, batch, and purity conversions for dsDNA, ssDNA, ssRNA, and protein through the Pepkio Molecular Mass Converter REST API from scripts, apps, and CI.

# What It Does

Spectrophotometer and NanoDrop workflows need consistent answers when converting OD₂₆₀ to ng/µL and nM, translating protein mg/mL to µM, interpreting A260/A280 purity, or processing multi-sample instrument exports. Re-implementing extinction coefficients, length-based factors, and batch parsing in every Node.js script is slow and error-prone.

This package calls the same Pepkio Tools engine as the hosted [Molecular Mass Converter](https://www.pepkio.com/tools/mol-mass-converter) web calculator. Send manifest-defined inputs for one of three `mode` values (`converter`, `batch`, `purity`); receive structured `fields`, optional `warnings`, `coefficient_source`, and shareable run permalinks.

Programmatic runs require a network connection and a Pepkio API key. Calculator logic is hosted remotely; the client is not an offline conversion library.

# Features

- Three API modes: `converter` (bidirectional anchor-field conversion), `batch` (NanoDrop CSV up to 96 rows), `purity` (A260/A280 and optional A230 interpretation)
- Molecule types: dsDNA, ssDNA, ssRNA, protein
- Optional `sequence` for nearest-neighbor extinction; `length_bp` or `mw_kda` for nucleic acids and protein respectively
- Manifest examples: `dsdna_od1_1000bp`, `bsa_1mg_ml`, `purity_dsdna_clean`, `batch_three_rows`
- Manifest helpers: `getManifest`, `listExamples`, `getExampleInput`
- `run`, `getRun`, and `waitForRun` for sync execution
- CLI: `pepkio-mol-mass-converter manifest` and `run`
- Configurable via `PEPKIO_API_KEY` and `PEPKIO_API_BASE_URL`

# Installation

```bash
npm install pepkio-mol-mass-converter
```

Requires Node.js 18 or newer.

# Configuration

Set an API key with **tools:run** scope before calling `run()`:

```bash
export PEPKIO_API_KEY="your-key"
```

Create a key at [Pepkio API keys](https://www.pepkio.com/account/api-keys).

Optional overrides:

| Variable | Purpose |
|----------|---------|
| `PEPKIO_API_KEY` | Production API key (required for `run`) |
| `LOCAL_PEPKIO_API_KEY` | Local dev key when `PEPKIO_API_BASE_URL` points to `tools.localtest.me` |
| `PEPKIO_API_BASE_URL` | API host (default `https://tools.pepkio.com`) |

# Quick Example

```typescript
import { PepkioClient } from "pepkio-mol-mass-converter";

const client = new PepkioClient({ apiKey: process.env.PEPKIO_API_KEY });

const input = await client.getExampleInput("dsdna_od1_1000bp");
const result = await client.run(input);

console.log(result.result?.mode);    // "converter"
console.log(result.result?.fields);  // e.g. { ng_per_uL: 50, nM: 76.9 }
console.log(result.permalink);       // shareable link to the web analysis
```

Manifest inspection does not require an API key.

# CLI

```bash
npx pepkio-mol-mass-converter manifest --examples
npx pepkio-mol-mass-converter run --example dsdna_od1_1000bp
```

Pass `--base-url` and `--api-key` to override environment defaults.

# Typical Use Cases

- Convert OD₂₆₀ to ng/µL and nM for dsDNA library fragments (`dsdna_od1_1000bp`)
- Translate mg/mL protein stocks to µM for assay design (`bsa_1mg_ml`)
- Batch-process NanoDrop exports for NGS library QC (`batch_three_rows`)
- Flag A260/A280 purity issues before PCR or sequencing (`purity_dsdna_clean`)
- Sequence-aware extinction for GC-rich or AT-rich templates via optional `sequence`

# Scientific Background

Converter mode uses `anchor_field` + `anchor_value` bidirectionally across related units. Nucleic acids accept `length_bp` or optional `sequence` for nearest-neighbor extinction. Protein requires `mw_kda`. Batch mode parses `csv_text` with `default_length_bp` or `default_mw_kda` fallbacks. Purity mode returns ratio and flag fields from `a260`, `a280`, and optional `a230`.

# Web Application

For researchers who prefer a graphical interface, an interactive web version is available.

Web Application: https://www.pepkio.com/tools/mol-mass-converter

The web interface adds paste-with-units input, sequence extinction badges, batch mode for up to 96 NanoDrop rows, a Purity tab with plain-language warnings, a Dilution Advisor, CSV export, and browser calculation history.

# Documentation and Resources

GitHub Repository: https://github.com/pepkio/pepkio-mol-mass-converter-js

Web Application: https://www.pepkio.com/tools/mol-mass-converter

# About Pepkio

Pepkio (https://www.pepkio.com/) develops software tools and bioinformatics solutions for life science researchers, including laboratory calculators and analysis services (https://www.pepkio.com/cro).
