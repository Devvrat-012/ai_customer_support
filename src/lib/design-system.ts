// Reusable gradient and color classes
export const gradients = {
  primary: 'bg-gradient-to-r from-blue-600 to-purple-600',
  primaryHover: 'hover:from-blue-700 hover:to-purple-700',
  text: 'bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent',
  hero: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent',
  surface: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950',
  cta: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
  footer: 'bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800',
  features: 'bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800',
  benefits: 'bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900',
  auth: 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950',
} as const;

export const featureColors = {
  instant: {
    card: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
    icon: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  },
  ai: {
    card: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    icon: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  },
  secure: {
    card: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    icon: 'bg-gradient-to-r from-green-500 to-emerald-600',
  },
  available: {
    card: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    icon: 'bg-gradient-to-r from-purple-500 to-pink-600',
  },
  analytics: {
    card: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
    icon: 'bg-gradient-to-r from-red-500 to-rose-600',
  },
  collaboration: {
    card: 'bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20',
    icon: 'bg-gradient-to-r from-cyan-500 to-teal-600',
  },
} as const;

export const benefitColors = [
  'bg-gradient-to-r from-green-400 to-emerald-500',
  'bg-gradient-to-r from-blue-400 to-indigo-500',
  'bg-gradient-to-r from-purple-400 to-pink-500',
  'bg-gradient-to-r from-orange-400 to-red-500',
] as const;

export const animations = {
  blob: 'animate-blob',
  float: 'animate-float',
  pulseGlow: 'animate-pulse-glow',
  delayShort: 'animation-delay-2000',
  delayLong: 'animation-delay-4000',
} as const;

export const spacing = {
  section: 'py-20',
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  cardPadding: 'p-4',
  iconSize: 'h-6 w-6',
  iconContainer: 'w-12 h-12',
} as const;

export const typography = {
  heading1: 'text-4xl font-bold tracking-tight sm:text-6xl',
  heading2: 'text-3xl font-bold tracking-tight sm:text-4xl',
  heading3: 'text-xl font-semibold',
  body: 'text-lg leading-8',
  caption: 'text-sm',
} as const;

export const shadows = {
  card: 'shadow-lg hover:shadow-xl',
  cardLarge: 'shadow-2xl',
  button: 'shadow-lg hover:shadow-xl',
} as const;
