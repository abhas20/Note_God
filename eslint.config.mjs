import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:prettier/recommended",
  ),
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "prettier/prettier": [
        "warn",
        {
          endOfLine: "auto",
          singleQuote: true,
          semi: false,
          trailingComma: "all",
          printWidth: 80,
          tabWidth: 2,
        },
      ],
    },
  },
];

export default eslintConfig;
