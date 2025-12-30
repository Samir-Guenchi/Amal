import type { Category, CategoryId } from '../types';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: CategoryId;
  onCategoryChange: (id: CategoryId) => void;
  language: 'en' | 'ar' | 'fr' | 'dz';
  theme: 'light' | 'dark';
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange, language, theme }: CategoryTabsProps) {
  return (
    <section className="px-4 mb-10">
      <div className="max-w-4xl mx-auto">
        <div
          className={`flex gap-3 p-2 overflow-x-auto ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-white shadow-sm'}`}
          style={{ borderRadius: '1.5rem' }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-2.5 px-5 py-3 font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                      : 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                    : theme === 'dark'
                      ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                style={{ borderRadius: isActive ? '1rem 0.5rem 1rem 0.5rem' : '0.75rem' }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{cat.label[language]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
