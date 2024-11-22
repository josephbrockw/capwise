import { defineConfig } from 'cypress';
import { defineConfig as defineViteConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cypressVite from 'cypress-vite';

console.log('Cypress config is being loaded with baseUrl:', 'http://localhost:3001');

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    video: false,
    setupNodeEvents(on, config) {
      on('file:preprocessor', cypressVite());
    },
  },
});
