import { defineConfig } from "tsup";

const baseConfig = {
  entry: {
    index: "src/index.ts",
  },
  dts: {
    resolve: true,
  },
  sourcemap: true,
  target: "node16",
};

export default defineConfig([
  {
    ...baseConfig,
    format: "esm",
    outDir: "dist",
    clean: true, // clean once
    outExtension: () => ({ js: ".mjs" }),
    dts: { resolve: true }, // emit types with the ESM build
  }
]);