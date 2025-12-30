import { useState } from 'react';
import { useThemeStore } from '../../../store/themeStore';
import { useLanguageStore } from '../../../store/languageStore';

// Modular components
import {
  ResourcesHeader,
  CategoryTabs,
  EmergencySection,
  CentersSection,
  EducationSection,
  FamilySection,
} from '../components';

// Data
import { categories, emergencyContacts, treatmentCenters, educationTopics, familyFaqs } from '../data';

// Types
import type { CategoryId } from '../types';

export function ResourcesPage() {
  const { theme } = useThemeStore();
  const language = useLanguageStore((state) => state.language);
  const isRTL = language === 'ar' || language === 'dz';
  const [activeCategory, setActiveCategory] = useState<CategoryId>('emergency');

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#09090b]' : 'bg-[#fafafa]'}`}>
      {/* Header */}
      <ResourcesHeader language={language} theme={theme} isRTL={isRTL} />

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        language={language}
        theme={theme}
      />

      {/* Content */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {activeCategory === 'emergency' && (
            <EmergencySection contacts={emergencyContacts} language={language} theme={theme} isRTL={isRTL} />
          )}

          {activeCategory === 'centers' && (
            <CentersSection centers={treatmentCenters} language={language} theme={theme} isRTL={isRTL} />
          )}

          {activeCategory === 'education' && (
            <EducationSection topics={educationTopics} language={language} theme={theme} isRTL={isRTL} />
          )}

          {activeCategory === 'family' && (
            <FamilySection faqs={familyFaqs} language={language} theme={theme} isRTL={isRTL} />
          )}
        </div>
      </section>
    </div>
  );
}
