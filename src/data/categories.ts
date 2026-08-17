import { CategoryType } from '../types/giftCard';

export interface CategoryInfo {
  id: CategoryType;
  label: string;
  description: string;
  iconName: string;
  count: number;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'All',
    label: 'All Categories',
    description: 'Explore the complete collection of digital gift cards',
    iconName: 'LayoutGrid',
    count: 14,
  },
  {
    id: 'Gaming',
    label: 'Gaming',
    description: 'Console, PC, and mobile game credits & subscriptions',
    iconName: 'Gamepad2',
    count: 3,
  },
  {
    id: 'Shopping',
    label: 'Shopping',
    description: 'Top online marketplaces and retail store cards',
    iconName: 'ShoppingBag',
    count: 2,
  },
  {
    id: 'Entertainment',
    label: 'Entertainment',
    description: 'Movie, music, and streaming platform subscriptions',
    iconName: 'Film',
    count: 3,
  },
  {
    id: 'Food',
    label: 'Food & Dining',
    description: 'Delivery apps, coffee chains, and restaurant cards',
    iconName: 'Utensils',
    count: 2,
  },
  {
    id: 'Fashion',
    label: 'Fashion & Apparel',
    description: 'Trending clothing brands, shoes, and beauty',
    iconName: 'Sparkles',
    count: 2,
  },
  {
    id: 'Travel',
    label: 'Travel & Stays',
    description: 'Hotels, vacation stays, and flight vouchers',
    iconName: 'Plane',
    count: 1,
  },
  {
    id: 'Technology',
    label: 'Technology',
    description: 'Electronics, app store credits, and cloud services',
    iconName: 'Laptop',
    count: 1,
  },
];
