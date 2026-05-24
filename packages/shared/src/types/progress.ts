export type LogType = 'DAILY_CHECKIN' | 'CRAVING' | 'RELAPSE' | 'MILESTONE';
export type SubstanceType = 'CIGARETTE' | 'VAPE';

export interface ProgressLogDTO {
  id: string;
  date: string;
  type: LogType;
  cravingLevel: number | null;
  mood: number | null;
  notes: string | null;
  cigarettesSmoked: number;
  usedTobacco?: boolean;
  substanceType?: SubstanceType | null;
}

export interface DashboardData {
  daysWithoutSmoking: number;
  moneySaved: number;
  cigarettesAvoided: number;
  healthImprovements: HealthImprovement[];
  recentLogs: ProgressLogDTO[];
  streak: number;
  points: number;
}

export interface HealthImprovement {
  title: string;
  description: string;
  timeRequired: number;
  achieved: boolean;
  progress: number;
}

export interface CheckinInput {
  mood: number;
  cravingLevel: number;
  cigarettesSmoked: number;
  notes?: string;
  usedTobacco: boolean;
  substanceType?: SubstanceType;
}

export interface CravingInput {
  cravingLevel: number;
  notes?: string;
}
