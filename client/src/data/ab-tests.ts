import type { ABTestConfig } from '@/lib/ab-testing';

export const homeHeroTest: ABTestConfig = {
  testId: 'home_hero',
  variants: [
    {
      id: 'control',
      weight: 50,
      content: {
        headline: 'The AI Layer for Linux',
        subheadline: 'Execute any task through natural language. Automation, security, DevOps - one command away.',
      },
    },
    {
      id: 'variant_b',
      weight: 50,
      content: {
        headline: 'AI-Native Linux for Developers',
        subheadline: 'Transform how you work with Linux. Natural language commands, instant automation, intelligent assistance.',
      },
    },
  ],
  metrics: ['ctr', 'scroll_depth', 'dwell_time', 'bounce_rate'],
  status: 'active',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-03-01'),
};

export const homeCtaTest: ABTestConfig = {
  testId: 'home_cta',
  variants: [
    {
      id: 'control',
      weight: 50,
      content: {
        primary_cta: 'Try Cortex Now',
        secondary_cta: 'View on GitHub',
      },
    },
    {
      id: 'variant_b',
      weight: 50,
      content: {
        primary_cta: 'Get Started Free',
        secondary_cta: 'Explore on GitHub',
      },
    },
  ],
  metrics: ['ctr', 'conversion_rate', 'click_through'],
  status: 'active',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-03-01'),
};

export const hackathonCtaTest: ABTestConfig = {
  testId: 'hackathon_cta',
  variants: [
    {
      id: 'control',
      weight: 50,
      content: {
        cta_text: 'Join IDEathon',
        cta_subtext: 'Phase 1 is open for submissions',
      },
    },
    {
      id: 'variant_b',
      weight: 50,
      content: {
        cta_text: 'Submit Your Idea',
        cta_subtext: 'Win up to $1,500 in prizes',
      },
    },
  ],
  metrics: ['ctr', 'registration_rate', 'conversion'],
  status: 'active',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-05-18'),
};

export const heroSubheadlineTest: ABTestConfig = {
  testId: 'hero_subheadline',
  variants: [
    {
      id: 'control',
      weight: 33,
      content: {
        subheadline: 'Linux that understands you. Execute any task with natural language.',
      },
    },
    {
      id: 'variant_b',
      weight: 33,
      content: {
        subheadline: 'Stop memorizing commands. Start describing what you want.',
      },
    },
    {
      id: 'variant_c',
      weight: 34,
      content: {
        subheadline: 'The operating system that speaks your language.',
      },
    },
  ],
  metrics: ['ctr', 'scroll_depth', 'engagement_time'],
  status: 'active',
  startDate: new Date('2026-01-01'),
};

export const pricingCtaTest: ABTestConfig = {
  testId: 'pricing_cta',
  variants: [
    {
      id: 'control',
      weight: 50,
      content: {
        free_tier_cta: 'Download Free',
        paid_tier_cta: 'Start Trial',
      },
    },
    {
      id: 'variant_b',
      weight: 50,
      content: {
        free_tier_cta: 'Get Started',
        paid_tier_cta: 'Try Pro Free',
      },
    },
  ],
  metrics: ['ctr', 'trial_conversion', 'plan_selection'],
  status: 'paused',
  startDate: new Date('2026-02-01'),
};

export const defaultABTests: ABTestConfig[] = [
  homeHeroTest,
  homeCtaTest,
  hackathonCtaTest,
  heroSubheadlineTest,
  pricingCtaTest,
];

export function getTestById(testId: string): ABTestConfig | undefined {
  return defaultABTests.find(test => test.testId === testId);
}

export function getActiveTests(): ABTestConfig[] {
  const now = new Date();
  return defaultABTests.filter(test => {
    if (test.status !== 'active') return false;
    if (now < test.startDate) return false;
    if (test.endDate && now > test.endDate) return false;
    return true;
  });
}
