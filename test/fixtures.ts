export const mockManifest: Record<string, unknown> = {
  tool_id: "mol-mass-converter",
  title: "Molecular Mass Converter",
  execution_mode: "sync",
  examples: [
    {
      name: "dsdna_od1_1000bp",
      input: {
        mode: "converter",
        molecule_type: "dsDNA",
        anchor_field: "od260",
        anchor_value: 1,
        length_bp: 1000,
      },
    },
  ],
};

export const mockRunResponse: Record<string, unknown> = {
  run_id: "run_test123",
  status: "completed",
  result: {
    mode: "converter",
    fields: {
      ng_per_uL: 50,
      nM: 76.9,
    },
    warnings: [],
  },
  error: null,
  result_url: "https://tools.pepkio.com/api/tools/v1/runs/run_test123",
  permalink: "https://tools.pepkio.com/r/run_test123",
};
