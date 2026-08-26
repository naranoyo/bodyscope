// types/health.ts

export type HealthCondition = "excellent" | "good" | "normal" | "poor" | "bad";

export type HealthRecord = {
  id: string;

  date: string;

  time?: string;

  systolicBloodPressure?: number;

  diastolicBloodPressure?: number;

  pulse?: number;

  bodyTemperature?: number;

  sleepHours?: number;

  sleepQuality?: number;

  steps?: number;

  waterIntake?: number;

  condition?: HealthCondition;

  memo?: string;

  createdAt: string;

  updatedAt: string;
};
