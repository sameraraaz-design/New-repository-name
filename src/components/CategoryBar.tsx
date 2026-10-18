import React from 'react';
import {
  Tv,
  Smartphone,
  Laptop,
  Shirt,
  User,
  Heart,
  Footprints,
  Watch,
  Home,
  Sparkles,
  Dumbbell,
  Gamepad2,
  Briefcase,
  BookOpen,
  ShoppingBag,
  Layers,
} from 'lucide-react';
import { Category } from '../types/index.ts';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Tv,
  Smartphone,
  Laptop,
  Shirt,
  User,
  Heart,
  Footprints,
  Watch,
  Home,
  Sparkles,
  Dumbbell,
  Gamepad2,
  Briefcase,
  BookOpen,
  ShoppingBag,
  Layers,
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none no-scrollbar">
          {/* 'All Categories' Option */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Departments</span>
          </button>

          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.iconName] || ShoppingBag;
            const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
