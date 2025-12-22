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
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['intro', 'development/installation', 'development/cli-tool', 'development/contributing'],
    },
    {
      type: 'category',
      label: 'Services',
      items: [
        {
          type: 'category',
          label: 'Django API',
          items: [
            'services/django/overview',
            'services/django/api',
            'services/django/serializers',
          ],
        },
        {
          type: 'category',
          label: 'Next.js',
          items: [
            'services/next/overview',
            'services/next/theming',
            {
              type: 'category',
              label: 'Components',
              items: [
                'services/next/components/ui',
                'services/next/components/feedback',
                'services/next/components/data-display',
                'services/next/components/navigation',
                'services/next/components/forms',
                'services/next/components/layout',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'React',
          items: [
            'services/react/overview',
            'services/react/components',
          ],
        },
        {
          type: 'category',
          label: 'Mobile',
          items: [
            'services/mobile/overview',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'DevOps',
      items: [
        'devops/environment-variables',
      ],
    },
  ],
};

module.exports = sidebars;
