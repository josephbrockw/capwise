const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'BaseBuild Documentation',
  tagline: 'A modern full-stack application template with Django, Next.js, React, and React Native',
  url: 'https://basebuild-docs.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'josephbrockw', // Usually your GitHub org/user name.
  projectName: 'basebuild', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/josephbrockw/basebuild/edit/main/docs/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/josephbrockw/basebuild/edit/main/docs/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'BaseBuild',
        logo: {
          alt: 'BaseBuild Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'dropdown',
            label: 'Getting Started',
            position: 'left',
            items: [
              {
                label: 'Introduction',
                to: '/docs/intro',
              },
              {
                label: 'Installation',
                to: '/docs/development/installation',
              },
              {
                label: 'CLI Tool',
                to: '/docs/development/cli-tool',
              },
              {
                label: 'Contributing',
                to: '/docs/development/contributing',
              },
            ],
          },
          {
            type: 'dropdown',
            label: 'Services',
            position: 'left',
            items: [
              {
                label: 'Django API',
                to: '/docs/services/django/overview',
              },
              {
                label: 'Next.js',
                to: '/docs/services/next/overview',
              },
              {
                label: 'React',
                to: '/docs/services/react/overview',
              },
              {
                label: 'Mobile (React Native)',
                to: '/docs/services/mobile/overview',
              },
            ],
          },
          {
            type: 'dropdown',
            label: 'DevOps',
            position: 'left',
            items: [
              {
                label: 'Environment Variables',
                to: '/docs/devops/environment-variables',
              },
            ],
          },
          {to: '/blog', label: 'Updates', position: 'left'},
          {
            href: 'https://github.com/josephbrockw/basebuild',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Getting Started',
            items: [
              {
                label: 'Introduction',
                to: '/docs/intro',
              },
              {
                label: 'Installation',
                to: '/docs/development/installation',
              },
              {
                label: 'CLI Tool',
                to: '/docs/development/cli-tool',
              },
            ],
          },
          {
            title: 'Services',
            items: [
              {
                label: 'Django API',
                to: '/docs/services/django/overview',
              },
              {
                label: 'Next.js',
                to: '/docs/services/next/overview',
              },
              {
                label: 'React',
                to: '/docs/services/react/overview',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Updates',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/josephbrockw/basebuild',
              },
            ],
          },
        ],
        copyright: `Copyright ${new Date().getFullYear()} BaseBuild. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['python', 'bash', 'css', 'jsx'],
      },
    }),
});
