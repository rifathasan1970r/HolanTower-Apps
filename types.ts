import { LucideIcon } from 'lucide-react';

export type ViewState = 'HOME' | 'SERVICE_CHARGE' | 'DESCO' | 'CONTACT' | 'MENU' | 'TO_LET' | 'AI_ASSISTANT' | 'EMERGENCY';

export interface MenuItem {
  id: string;
  label: string;
  labelEn: string;
  icon: LucideIcon;
  view: ViewState;
  color?: string;
  description?: string;
  descriptionEn?: string;
  gradient?: string;
}

export interface Notice {
  id: number;
  text: string;
  date: string;
}