import { defineConfig } from "cypress";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(
  "Cypress config is being loaded with baseUrl:",
  "http://localhost:3001"
);

const viteConfig = {
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3001",
    video: false,
    env: {
      CYPRESS_TEST_MODE: true
    },
    setupNodeEvents(on, config) {
      // Ensure environment variables are available for e2e tests
      config.env = {
        ...config.env,
        CYPRESS_TEST_MODE: true
      };
      return config;
    },
    // Reduce logging noise
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 0
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig,
    },
    env: {
      CYPRESS_TEST_MODE: false
    }
  },
});
