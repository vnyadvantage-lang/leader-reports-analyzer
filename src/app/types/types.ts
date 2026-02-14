export interface Leader {
  name: string;
  score: number;
}

export interface LeaderReport {
  title: string;
  date: string;
  leaders: Leader[];
  additionalMetrics?: Record<string, number | string>;
}

export interface ComparisonData {
  leaders: {
    name: string;
    values: (number | null)[];
  }[];
  metrics: {
    name: string;
    values: (number | string | null)[];
  }[];
}
