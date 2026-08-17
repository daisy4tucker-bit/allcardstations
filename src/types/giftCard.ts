import { ReactNode } from 'react';

export type CategoryType = 
  | 'all' 
  | 'All'
  | 'gaming' 
  | 'Gaming'
  | 'streaming' 
  | 'Shopping'
  | 'shopping' 
  | 'food' 
  | 'Food'
  | 'crypto' 
  | 'travel'
  | 'Travel'
  | 'Entertainment'
  | 'Fashion'
  | 'Technology';

export type SortOption = 
  | 'popular' 
  | 'discount' 
  | 'alphabetical' 
  | 'price-low' 
  | 'price-high'
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc';

export interface GiftCardThemeColor {
  bgGradient?: string;
  badgeBg?: string;
  textColor?: string;
  iconBg?: string;
  borderColor?: string;
}

export interface GiftCard {
  id: string;
  name: string;
  slug?: string;
  category: CategoryType;
  region?: string;
  regions?: string[];
  currency?: string;
  currencies?: string[];
  startingPrice?: number;
  description: string;
  longDescription?: string;
  availableDenominations?: number[];
  denominations?: number[];
  available?: boolean;
  themeColor?: GiftCardThemeColor;
  symbol?: string;
  tagline?: string;
  image?: string;
  redemptionType?: string;
  popular?: boolean;
  featured?: boolean;
  terms?: string[];
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  gradient?: string;
  iconName?: string;
  instantDelivery?: boolean;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  numericValue?: number;
  suffix?: string;
  description: string;
  iconName: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: ReactNode;
  active?: boolean;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  subject: string;
  orderNumber?: string;
  message: string;
}

export interface ValidationFormData {
  brandId: string;
  cardCode: string;
  securityPin?: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  avatarBg?: string;
  rating: number;
  date: string;
  period?: 'recent' | 'last_year' | '2_years_ago' | '3_years_ago';
  yearLabel?: string;
  type: 'bought' | 'validated';
  cardName: string;
  denomination?: string;
  comment: string;
  location: string;
  verified: boolean;
  helpfulCount?: number;
}
