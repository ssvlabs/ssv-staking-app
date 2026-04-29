const { defineConfig, globalIgnores } = require("eslint/config");
const prettier = require("eslint-config-prettier");
const tailwindcss = require("eslint-plugin-tailwindcss");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");

const eslintConfig = defineConfig([
  {
    plugins: {
      tailwindcss,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...tailwindcss.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
    settings: {
      tailwindcss: {
        callees: ["cn", "cva"],
        config: "./tailwind.config.ts",
        classRegex: "^(class(Name)?|tw)$",
      },
    },
  },
  {
    rules: {
      "tailwindcss/no-custom-classname": "off",

      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^err",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  prettier,
  {
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "tailwindcss/no-contradicting-classname": "off"
    }
  },
  globalIgnores([
    "build/**",
    "node_modules/**",
  ]),
]);

module.exports = eslintConfig;
