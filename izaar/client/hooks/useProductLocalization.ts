import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Custom hook to get localized product names and descriptions
 * based on current language setting
 */
export const useProductLocalization = () => {
  const { language } = useLanguage();

  const getProductName = (product: any) => {
    if (!product) return '';
    return language === 'en' ? (product.name_en || product.name_ar) : product.name_ar;
  };

  const getProductDescription = (product: any) => {
    if (!product) return '';
    return language === 'en' ? (product.description_en || product.description_ar) : product.description_ar;
  };

  return {
    getProductName,
    getProductDescription,
  };
};


