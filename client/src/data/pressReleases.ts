export interface PressRelease {
  slug: string;
  title: string;
  headline: string;
  date: string;
  dateline: string;
  summary: string;
  content: string[];
  quotes?: {
    text: string;
    author: string;
    title: string;
  }[];
  contactInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
  boilerplate?: string;
  tags?: string[];
  image?: string;
}

export const pressReleases: PressRelease[] = [
  {
    slug: "cortex-linux-announces-global-ai-hackathon",
    title: "Cortex Linux Announces Global AI Hackathon",
    headline: "Cortex Linux Announces Global AI Hackathon with $5,350 Prize Pool",
    date: "2026-01-11",
    dateline: "SAN FRANCISCO, CA",
    summary: "Cortex Linux launches a 13-week global hackathon focused on crowdsourcing monetization strategies, offering over $5,350 in prizes for developers and AI enthusiasts worldwide.",
    content: [
      "Content coming soon - paste your press release content here."
    ],
    quotes: [
      {
        text: "Quote coming soon.",
        author: "Cortex Team",
        title: "Cortex Linux"
      }
    ],
    contactInfo: {
      name: "Cortex Linux Media Relations",
      email: "press@cortexlinux.com"
    },
    boilerplate: "Cortex Linux is the AI Layer for Linux - a dynamic, intelligent assistant that can perform unlimited tasks on Linux through natural language commands. From automation scripts to system configuration, data analysis to coding workflows - Cortex handles anything you can do on Linux.",
    tags: ["Hackathon", "AI", "Open Source", "Developer Community"]
  }
];

export function getPressReleaseBySlug(slug: string): PressRelease | undefined {
  return pressReleases.find(pr => pr.slug === slug);
}

export function getRecentPressReleases(count: number = 5): PressRelease[] {
  return [...pressReleases]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}
