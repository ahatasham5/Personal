import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface DailyLog {
  id?: number;
  date: string;
  title: string;
  category: 'job' | 'company' | 'family';
  time_spent?: number;
  impact_level: 'Low' | 'Med' | 'High';
  notes?: string;
  next_action?: string;
}

export interface Goal {
  id?: number;
  type: 'outcome' | 'weekly';
  title: string;
  target_value?: number;
  current_value?: number;
  status: 'active' | 'completed';
}

export interface Review {
  id?: number;
  type: 'daily' | 'weekly';
  date: string;
  win?: string;
  mistake?: string;
  priority?: string;
  summary?: string;
  losses?: string;
  goal_movement?: string;
  time_waste?: string;
  next_theme?: string;
}

export interface Idea {
  id?: number;
  title: string;
  content: string;
  tags: string;
  created_at: string;
}
