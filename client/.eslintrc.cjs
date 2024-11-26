module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    "cypress/globals": true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:cypress/recommended",
  ],
  ignorePatterns: ["dist", "node_modules", ".eslintrc.cjs"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["react-refresh", "cypress"],
  rules: {
    "no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "React", // Ignore React in imports
      },
    ],
    "react-refresh/only-export-components": [
      "warn",
      {
        allowConstantExport: true,
      },
    ],
    "react/prop-types": "error",
    "react/react-in-jsx-scope": "off",
  },
};
