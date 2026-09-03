// eslint.config.js

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  globalIgnores(["dist", "build", "coverage", "node_modules"]),

  // --- 1. FRONTEND CONFIG (VITE & REACT) ---
  {
    files: ["**/*.{js,jsx}"],
    ignores: ["apps/**/backend/**/*.js"], // Don't run browser rules on backend files
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: "latest", // Set it uniformly here
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },

  // --- 2. EXPRESS BACKENDS (NODE) ---
  {
    files: ["apps/**/backend/**/*.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest", // Set it uniformly here
      globals: {
        ...globals.node,
      },
      parserOptions: {
        sourceType: "module",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  eslintConfigPrettier,
]);
