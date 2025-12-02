import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';
import Button from '../components/ui/Button/Button';

const features = [
  {
    title: 'Instant Build Setup',
    description: 'Get your build environment up and running in seconds with our one-click setup process.',
    icon: '🚀'
  },
  {
    title: 'Cross-Platform Support',
    description: 'Build your projects seamlessly across macOS, Linux, and Windows with consistent results.',
    icon: '💻'
  },
  {
    title: 'Smart Caching',
    description: 'Optimize build times with intelligent caching that learns from your build patterns.',
    icon: '⚡'
  },
  {
    title: 'Real-Time Monitoring',
    description: 'Track build progress and performance metrics in real-time with our intuitive dashboard.',
    icon: '📊'
  },
  {
    title: 'Team Collaboration',
    description: 'Share build configurations and collaborate with your team in real-time.',
    icon: '👥'
  },
];

const testimonials = [
  {
    quote: "BaseBuild has transformed how we handle our build process. What used to take hours now takes minutes.",
    name: "Sarah Chen",
    title: "CTO at TechFlow",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    quote: "The smart caching feature alone has saved us countless development hours. It is a game-changer.",
    name: "Michael Rodriguez",
    title: "Lead Developer at BuildX",
    avatar: "https://i.pravatar.cc/150?img=2"
  },
  {
    quote: "Finally, a build tool that just works. The cross-platform support is flawless.",
    name: "Emma Thompson",
    title: "DevOps Engineer at CloudScale",
    avatar: "https://i.pravatar.cc/150?img=3"
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    features: [
      'Up to 100 builds/month',
      'Basic caching',
      'Community support',
      '1 concurrent build',
      'Basic analytics'
    ]
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    popular: true,
    features: [
      'Unlimited builds',
      'Smart caching',
      'Priority support',
      '5 concurrent builds',
      'Advanced analytics',
      'Custom workflows',
      'Team collaboration'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Unlimited concurrent builds',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment',
      'SSO & advanced security'
    ]
  }
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>Build Better. Build Faster.</h1>
            <p className={styles.subtitle}>
              The modern build tool that streamlines your development workflow and supercharges your team&apos;s productivity.
            </p>
            <Link to="/signup">
              <button className={styles.ctaButton}>Start Building for Free</button>
            </Link>
          </div>
          <div className={styles.heroImage}>
            {/* Add hero image here */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Why Choose BaseBuild?</h2>
        <div className={`${styles.featuresGrid} features-container`}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className={styles.pricing}>
        <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
        <div className={styles.pricingGrid}>
          {pricingPlans.map((plan, index) => (
            <div key={index} className={`${styles.pricingCard} ${plan.popular ? styles.popular : ''}`}>
              {plan.popular && <span className={styles.popularBadge}>Most Popular</span>}
              <div className={styles.pricingHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.price}>{plan.price}<span className={styles.period}>{plan.period}</span></div>
              </div>
              <ul className={styles.featureList}>
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className={styles.featureItem}>{feature}</li>
                ))}
              </ul>
              <Link to="/signup">
                <Button label={plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonials}>
        <h2 className={styles.sectionTitle}>What Our Users Say</h2>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <p className={styles.quote}>{testimonial.quote}</p>
              <div className={styles.author}>
                <img src={testimonial.avatar} alt={testimonial.name} className={styles.authorAvatar} />
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{testimonial.name}</div>
                  <div className={styles.authorTitle}>{testimonial.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
