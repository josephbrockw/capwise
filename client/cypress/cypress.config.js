const { defineConfig } = require("cypress");

console.log('Cypress config is being loaded with baseUrl:', 'http://localhost:3001');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  }
});
