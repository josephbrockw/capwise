import { defineConfig } from "cypress";
import react from "@vitejs/plugin-react";

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
      },
    },
  },
});
