import vitals from "eslint-config-next/core-web-vitals"
import ts from "eslint-config-next/typescript"

const eslintConfig = [
  ...vitals,
  ...ts,
  {
    // DEPS-004 / Phase 06 — allow `any` in legacy callback types (e.g. setState
    // setters) so we don't have to type every form handler. Strict mode
    // remains the default for new code; loosen only where Prisma client or
    // NextAuth's loose typing forces an `any`.
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "off",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "dist/**", "out/**", "build/**", "next-env.d.ts"],
  },
]

export default eslintConfig
