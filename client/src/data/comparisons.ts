// Comparison data types for A/B testing

export interface ABVariant {
  id: string;
  name: string;
  weight: number;
}

export interface ABExperiment {
  variants: ABVariant[];
}

export interface ComparisonData {
  id: string;
  slug: string;
  title: string;
  description: string;
  experiment: ABExperiment;
}
