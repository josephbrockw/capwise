import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Multiple Frontend Options',
    Svg: require('../../static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Choose from Next.js (with App Router), React (with Vite), or React Native
        for mobile. Each includes a comprehensive component library and theming system.
      </>
    ),
  },
  {
    title: 'Django API Backend',
    Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Production-ready Django REST API with authentication, email verification,
        JWT tokens, password reset, and Stripe payment integration.
      </>
    ),
  },
  {
    title: 'Developer Tooling',
    Svg: require('../../static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        BB CLI tool for common tasks, Docker Compose for services, automated setup
        script, and comprehensive environment configuration.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
