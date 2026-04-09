// ─── StepForm 타입 정의 ────────────────────────────────────────────────────────

export type ChildInfo = {
  age: string;
  homeLanguage: string;
  parentKorean: string;
};

export type KoreanLevel = {
  level: string; // 'zero' | 'alpha' | 'listen' | 'speak' | 'read'
  exposure: string[];
};

export type Schedule = {
  country: string;
  countryOther: string;
  city: string;
  utcOffset: number | null;
  isManual: boolean;
  timeBlocks: string[]; // 'morning' | 'afternoon' | 'evening'
  kstSummary: string;
  frequency: string;
  teacherPrefs: string[];
};

export type Contact = {
  parentName: string;
  childName: string;
  email: string;
  childGender: string;
  referralSource: string;
};

export type FormData = {
  child: ChildInfo;
  koreanLevel: KoreanLevel;
  goals: string[];
  schedule: Schedule;
  contact: Contact;
};

export const initialFormData: FormData = {
  child: {
    age: '',
    homeLanguage: '',
    parentKorean: '',
  },
  koreanLevel: {
    level: '',
    exposure: [],
  },
  goals: [],
  schedule: {
    country: '',
    countryOther: '',
    city: '',
    utcOffset: null,
    isManual: false,
    timeBlocks: [],
    kstSummary: '',
    frequency: '',
    teacherPrefs: [],
  },
  contact: {
    parentName: '',
    childName: '',
    email: '',
    childGender: '',
    referralSource: '',
  },
};

// ─── 공통 Step Props ────────────────────────────────────────────────────────────

export type StepProps<T = void> = {
  formData: FormData;
  onNext: () => void;
  onBack?: () => void;
} & (T extends void ? object : { onUpdate: T });

export type SectionUpdater = <K extends keyof Omit<FormData, 'goals'>>(
  section: K,
  value: Partial<FormData[K]>
) => void;
