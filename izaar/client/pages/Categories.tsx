import { useState, useEffect } from "react";
import { categories as categoriesApi } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import { normalizeImageUrl } from "@/lib/data-mappers";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export default function Categories() {
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesApi.list();
      setCategoriesList(data.results || data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error(t('categories.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-center">{t('categories.title')}</h1>
            <p className="text-center text-primary-foreground/90 mt-4 max-w-2xl mx-auto">
              {t('categories.subtitle')}
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-16">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : categoriesList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {categoriesList.map((category) => (
                <CategoryCard
                  key={category.id}
                  id={category.slug}
                  name={category.name_ar}
                  image={normalizeImageUrl(category.image_url || category.image || "/placeholder-category.jpg")}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              {t('categories.noCategories')}
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="bg-secondary py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">
                  {categoriesList.length > 0 ? `${categoriesList.length}+` : "8+"}
                </h3>
                <p className="text-muted-foreground">{t('categories.diverseCategories')}</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">120+</h3>
                <p className="text-muted-foreground">{t('categories.luxuryProducts')}</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">100%</h3>
                <p className="text-muted-foreground">{t('categories.guaranteedQuality')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
