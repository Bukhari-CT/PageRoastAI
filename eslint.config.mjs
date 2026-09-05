import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Deliberately minimal: Next's recommended rules plus its TypeScript rules.
 * The goal is catching genuine errors (unused symbols, bad hooks, broken
 * imports), not enforcing a formatting opinion across the repository.
 */
const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "tsconfig.tsbuildinfo",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Surfaced as warnings so genuinely-unused code is visible without
      // failing the build on an intentionally-unused function argument.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Off deliberately. These three flag the existing Domain-layer idiom
      // (an `interface X` merged with `class X`) and the generic repository
      // signatures in src/Domain. Satisfying them means rewriting the domain
      // model, which is a larger design decision than a lint baseline should
      // force. Revisit when that layer is next touched.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
      "@typescript-eslint/no-empty-object-type": "off",

      // Warnings, not errors. These React Compiler rules fire on the standard
      // mount-guard / media-query-sync idiom used by the vendored shadcn
      // primitives (carousel, sidebar, use-mobile) and by the theme toggle.
      // Satisfying them means restructuring those components around
      // useSyncExternalStore, with real hydration risk — worth doing, but as a
      // deliberate change rather than a precondition for having any linting.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
];

export default config;
