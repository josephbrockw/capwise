const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'BaseBuild Documentation',
  tagline: 'Documentation for the BaseBuild project',
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
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Documentation',
          },
          {
            type: 'dropdown',
            label: 'Components',
            position: 'left',
            items: [
              {
                label: 'Frontend',
                to: '/docs/frontend/overview',
              },
              {
                label: 'Backend',
                to: '/docs/backend/overview',
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
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/intro',
              },
              {
                label: 'Frontend',
                to: '/docs/frontend/overview',
              },
              {
                label: 'Backend',
                to: '/docs/backend/overview',
              },
            ],
          },
          {
            title: 'Development',
            items: [
              {
                label: 'Installation',
                to: '/docs/development/installation',
              },
              {
                label: 'Contributing',
                to: '/docs/development/contributing',
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
