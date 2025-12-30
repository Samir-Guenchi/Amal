import { LucideIcon } from 'lucide-react';

// Multilingual text type
export type LocalizedText = {
  en: string;
  ar: string;
  fr: string;
  dz: string;
};

// Category types
export type CategoryId = 'emergency' | 'centers' | 'education' | 'family';

export interface Category {
  id: CategoryId;
  icon: LucideIcon;
  label: LocalizedText;
}

// Emergency contact type
export interface EmergencyContact {
  name: LocalizedText;
  number: string;
  description: LocalizedText;
  primary: boolean;
}

// Treatment center type
export interface TreatmentCenter {
  name: LocalizedText;
  type: LocalizedText;
  location: LocalizedText;
}

// Education topic type
export interface EducationTopic {
  icon: LucideIcon;
  title: LocalizedText;
  description: LocalizedText;
}

// FAQ type
export interface FAQ {
  question: LocalizedText;
  answer: LocalizedText;
}
