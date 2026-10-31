"use client";

import React from 'react';
import {
  Home,
  Car,
  ShoppingCart,
  Zap,
  Film,
  UtensilsCrossed,
  Activity,
  Briefcase,
  Laptop,
  TrendingUp,
  Smartphone,
  ShoppingBag,
  Layers
} from 'lucide-react';

const CATEGORY_MAP = {
  'Housing': Home,
  'Transportation': Car,
  'Transport': Car,
  'Groceries': ShoppingCart,
  'Utilities': Zap,
  'Entertainment': Film,
  'Food & Dining': UtensilsCrossed,
  'Dining': UtensilsCrossed,
  'Healthcare': Activity,
  'Salary': Briefcase,
  'Freelance': Laptop,
  'Investments': TrendingUp,
  'Subscriptions': Smartphone,
  'Shopping': ShoppingBag,
  'Other': Layers,
};

export default function CategoryIcon({ category, size = 16, className = "w-4 h-4" }) {
  const IconComponent = CATEGORY_MAP[category] || Layers;
  return <IconComponent size={size} className={className} />;
}
