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

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3001",
    video: false,
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: {
        plugins: [react()],
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src')
          }
        }
      },
    },
  },
});
