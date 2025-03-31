/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

// Sidebar configuration
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['intro', 'development/installation', 'development/contributing'],
    },
    {
      type: 'category',
      label: 'Frontend',
      items: [
        'frontend/overview',
        'frontend/components',
        {
          type: 'category',
          label: 'Registration',
          items: [
            'frontend/registration/overview',
            'frontend/registration/basic-registration',
            'frontend/registration/payment-registration',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Backend',
      items: [
        'backend/overview',
        'backend/api',
        'backend/serializers',
      ],
    },
  ],
};

module.exports = sidebars;
