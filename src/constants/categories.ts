import React from 'react';
import {
  Grid,
  FlaskConical,
  Smile,
  Building2,
  Stethoscope,
  Scan,
  Activity,
  Pill,
  Scissors,
  Atom,
  Cross,
  LayoutGrid,
  Eye,
  Baby,
  Thermometer,
  Bone,
  UserRound
} from 'lucide-react';

export interface CategoryMeta {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  text: string;
  borderColor: string;
}

export interface CategoryCardItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  bgLight: string;
  borderLight: string;
  textCol: string;
  iconBg: string;
  badgeBg: string;
}

export const CATEGORY_ITEMS: CategoryCardItem[] = [
  {
    key: '',
    label: 'همه مراکز',
    icon: LayoutGrid,
    gradient: 'from-[#0a4c9a] to-[#1e40af]',
    bgLight: 'bg-blue-50/80 hover:bg-blue-100/70',
    borderLight: 'border-blue-200/90',
    textCol: 'text-[#0a4c9a]',
    iconBg: 'bg-blue-100 text-[#0a4c9a]',
    badgeBg: 'bg-blue-100 text-[#0a4c9a]',
  },
  {
    key: 'داروخانه',
    label: 'داروخانه‌ها',
    icon: Pill,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50/80 hover:bg-emerald-100/70',
    borderLight: 'border-emerald-200/90',
    textCol: 'text-emerald-900',
    iconBg: 'bg-emerald-100 text-emerald-700',
    badgeBg: 'bg-emerald-100 text-emerald-800',
  },
  {
    key: 'دندانپزشکی',
    label: 'دندانپزشکی',
    icon: Smile,
    gradient: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50/80 hover:bg-teal-100/70',
    borderLight: 'border-teal-200/90',
    textCol: 'text-teal-900',
    iconBg: 'bg-teal-100 text-teal-700',
    badgeBg: 'bg-teal-100 text-teal-800',
  },
  {
    key: 'آزمایشگاه',
    label: 'آزمایشگاه‌ها',
    icon: FlaskConical,
    gradient: 'from-indigo-500 to-blue-600',
    bgLight: 'bg-indigo-50/80 hover:bg-indigo-100/70',
    borderLight: 'border-indigo-200/90',
    textCol: 'text-indigo-900',
    iconBg: 'bg-indigo-100 text-indigo-700',
    badgeBg: 'bg-indigo-100 text-indigo-800',
  },
  {
    key: 'بیمارستان',
    label: 'بیمارستان‌ها',
    icon: Building2,
    gradient: 'from-blue-700 to-indigo-800',
    bgLight: 'bg-blue-50/80 hover:bg-blue-100/70',
    borderLight: 'border-blue-200/90',
    textCol: 'text-blue-900',
    iconBg: 'bg-blue-100 text-blue-700',
    badgeBg: 'bg-blue-100 text-blue-800',
  },
  {
    key: 'تصویربرداری',
    label: 'تصویربرداری',
    icon: Scan,
    gradient: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50/80 hover:bg-sky-100/70',
    borderLight: 'border-sky-200/90',
    textCol: 'text-sky-900',
    iconBg: 'bg-sky-100 text-sky-700',
    badgeBg: 'bg-sky-100 text-sky-800',
  },
  {
    key: 'فیزیوتراپی',
    label: 'فیزیوتراپی',
    icon: Activity,
    gradient: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50/80 hover:bg-purple-100/70',
    borderLight: 'border-purple-200/90',
    textCol: 'text-purple-900',
    iconBg: 'bg-purple-100 text-purple-700',
    badgeBg: 'bg-purple-100 text-purple-800',
  },
  {
    key: 'درمانگاه',
    label: 'درمانگاه‌ها',
    icon: Stethoscope,
    gradient: 'from-cyan-600 to-teal-600',
    bgLight: 'bg-cyan-50/80 hover:bg-cyan-100/70',
    borderLight: 'border-cyan-200/90',
    textCol: 'text-cyan-900',
    iconBg: 'bg-cyan-100 text-cyan-700',
    badgeBg: 'bg-cyan-100 text-cyan-800',
  },
  {
    key: 'مرکز جراحی محدود',
    label: 'جراحی محدود',
    icon: Scissors,
    gradient: 'from-amber-500 to-amber-700',
    bgLight: 'bg-amber-50/80 hover:bg-amber-100/70',
    borderLight: 'border-amber-200/90',
    textCol: 'text-amber-900',
    iconBg: 'bg-amber-100 text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-800',
  },
  {
    key: 'پزشکی هسته‌ای',
    label: 'پزشکی هسته‌ای',
    icon: Atom,
    gradient: 'from-violet-600 to-purple-700',
    bgLight: 'bg-violet-50/80 hover:bg-violet-100/70',
    borderLight: 'border-violet-200/90',
    textCol: 'text-violet-900',
    iconBg: 'bg-violet-100 text-violet-700',
    badgeBg: 'bg-violet-100 text-violet-800',
  },
  {
    key: 'کلینیک',
    label: 'کلینیک‌ها',
    icon: Cross,
    gradient: 'from-slate-600 to-slate-800',
    bgLight: 'bg-slate-100 hover:bg-slate-200/70',
    borderLight: 'border-slate-300',
    textCol: 'text-slate-800',
    iconBg: 'bg-slate-200 text-slate-700',
    badgeBg: 'bg-slate-200 text-slate-700',
  },
  {
    key: 'چشم پزشکی',
    label: 'چشم پزشکی',
    icon: Eye,
    gradient: 'from-sky-600 to-blue-700',
    bgLight: 'bg-sky-50/80 hover:bg-sky-100/70',
    borderLight: 'border-sky-200/90',
    textCol: 'text-sky-900',
    iconBg: 'bg-sky-100 text-sky-700',
    badgeBg: 'bg-sky-100 text-sky-800',
  },
  {
    key: 'زنان و زایمان',
    label: 'زنان و زایمان',
    icon: Baby,
    gradient: 'from-purple-600 to-indigo-700',
    bgLight: 'bg-purple-50/80 hover:bg-purple-100/70',
    borderLight: 'border-purple-200/90',
    textCol: 'text-purple-900',
    iconBg: 'bg-purple-100 text-purple-700',
    badgeBg: 'bg-purple-100 text-purple-800',
  },
  {
    key: 'عفونی و گرمسیری',
    label: 'عفونی و گرمسیری',
    icon: Thermometer,
    gradient: 'from-emerald-600 to-teal-700',
    bgLight: 'bg-emerald-50/80 hover:bg-emerald-100/70',
    borderLight: 'border-emerald-200/90',
    textCol: 'text-emerald-900',
    iconBg: 'bg-emerald-100 text-emerald-700',
    badgeBg: 'bg-emerald-100 text-emerald-800',
  },
  {
    key: 'روماتولوژی و داخلی',
    label: 'روماتولوژی',
    icon: Bone,
    gradient: 'from-cyan-700 to-blue-800',
    bgLight: 'bg-cyan-50/80 hover:bg-cyan-100/70',
    borderLight: 'border-cyan-200/90',
    textCol: 'text-cyan-900',
    iconBg: 'bg-cyan-100 text-cyan-700',
    badgeBg: 'bg-cyan-100 text-cyan-800',
  },
  {
    key: 'عینک‌سازی / اپتومتری',
    label: 'عینک‌سازی',
    icon: Eye,
    gradient: 'from-amber-600 to-orange-700',
    bgLight: 'bg-amber-50/80 hover:bg-amber-100/70',
    borderLight: 'border-amber-200/90',
    textCol: 'text-amber-900',
    iconBg: 'bg-amber-100 text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-800',
  },
  {
    key: 'کودکان و اطفال',
    label: 'کودکان و اطفال',
    icon: Baby,
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50/80 hover:bg-rose-100/70',
    borderLight: 'border-rose-200/90',
    textCol: 'text-rose-900',
    iconBg: 'bg-rose-100 text-rose-700',
    badgeBg: 'bg-rose-100 text-rose-800',
  },
];

export function getCategoryItem(key: string): CategoryCardItem | undefined {
  return CATEGORY_ITEMS.find((c) => c.key === key);
}

export const CATEGORY_CONFIG: Record<string, CategoryMeta> = {
  all: {
    label: 'همه',
    icon: Grid,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  'آزمایشگاه': {
    label: 'آزمایشگاه',
    icon: FlaskConical,
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    borderColor: 'border-indigo-200'
  },
  'دندانپزشکی': {
    label: 'دندانپزشکی',
    icon: Smile,
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    borderColor: 'border-teal-200'
  },
  'بیمارستان': {
    label: 'بیمارستان',
    icon: Building2,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  'درمانگاه': {
    label: 'درمانگاه',
    icon: Stethoscope,
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    borderColor: 'border-cyan-200'
  },
  'تصویربرداری': {
    label: 'تصویربرداری',
    icon: Scan,
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    borderColor: 'border-sky-200'
  },
  'فیزیوتراپی': {
    label: 'فیزیوتراپی',
    icon: Activity,
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  'داروخانه': {
    label: 'داروخانه',
    icon: Pill,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    borderColor: 'border-emerald-200'
  },
  'مرکز جراحی محدود': {
    label: 'مرکز جراحی محدود',
    icon: Scissors,
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    borderColor: 'border-amber-200'
  },
  'مطب': {
    label: 'مطب',
    icon: UserRound,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    borderColor: 'border-slate-200'
  },
  'پزشکی هسته‌ای': {
    label: 'پزشکی هسته‌ای',
    icon: Atom,
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    borderColor: 'border-violet-200'
  },
  'کلینیک': {
    label: 'کلینیک',
    icon: Cross,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  'چشم پزشکی': {
    label: 'چشم پزشکی',
    icon: Eye,
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    borderColor: 'border-sky-200'
  },
  'زنان و زایمان': {
    label: 'زنان و زایمان',
    icon: Baby,
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  'عفونی و گرمسیری': {
    label: 'عفونی و گرمسیری',
    icon: Thermometer,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    borderColor: 'border-emerald-200'
  },
  'روماتولوژی و داخلی': {
    label: 'روماتولوژی و داخلی',
    icon: Bone,
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    borderColor: 'border-cyan-200'
  },
  'عینک‌سازی / اپتومتری': {
    label: 'عینک‌سازی / اپتومتری',
    icon: Eye,
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    borderColor: 'border-amber-200'
  },
  'عینک‌سازی': {
    label: 'عینک‌سازی',
    icon: Eye,
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    borderColor: 'border-amber-200'
  },
  'اپتومتری': {
    label: 'اپتومتری',
    icon: Eye,
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    borderColor: 'border-amber-200'
  },
  'بیمارستان اعصاب و روان': {
    label: 'بیمارستان اعصاب و روان',
    icon: Building2,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  'کودکان و اطفال': {
    label: 'کودکان و اطفال',
    icon: Baby,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    borderColor: 'border-rose-200'
  },
  'متخصص کودکان': {
    label: 'کودکان و اطفال',
    icon: Baby,
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    borderColor: 'border-rose-200'
  }
};

export function getCategoryMeta(type: string): CategoryMeta {
  return CATEGORY_CONFIG[type] || {
    label: type,
    icon: Stethoscope,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    borderColor: 'border-slate-200'
  };
}
