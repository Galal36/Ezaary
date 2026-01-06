import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { search as searchApi } from "@/lib/api-client";
import { normalizeImageUrl } from "@/lib/data-mappers";
import { toast } from "sonner";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    if (query) {
      performSearch(query, 0);
    }
  }, [query]);

  const performSearch = async (searchQuery: string, offset: number) => {
    setIsLoading(true);
    try {
      const data = await searchApi.query(searchQuery, limit, offset);
      setResults(data.results || []);
      setSuggestions(data.suggestions || []);
      setDidYouMean(data.did_you_mean);
      setTotalCount(data.count || 0);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("فشل البحث");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, (nextPage - 1) * limit);
  };

  const getProductImage = (product: any) => {
    if (product.primary_image) return normalizeImageUrl(product.primary_image);
    return "/placeholder-product.jpg";
  };

  const getProductImages = (product: any): string[] => {
    if (product.primary_image) {
      return [normalizeImageUrl(product.primary_image)];
    }
    return ["/placeholder-product.jpg"];
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-primary text-primary-foreground py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              نتائج البحث
            </h1>
            {query && (
              <p className="text-primary-foreground/90">
                البحث عن: <span className="font-bold">{query}</span>
              </p>
            )}
          </div>
        </section>

        {/* Did You Mean */}
        {didYouMean && results.length === 0 && (
          <section className="bg-secondary py-4">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <p className="text-muted-foreground mb-2">هل تقصد:</p>
              <Link
                to={`/search?q=${encodeURIComponent(didYouMean)}`}
                className="text-primary hover:underline font-medium"
              >
                {didYouMean}
              </Link>
            </div>
          </section>
        )}

        {/* Results */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12">
          {isLoading && results.length === 0 ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  تم العثور على {totalCount} نتيجة
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {results.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name_ar}
                    price={Number(product.final_price || product.price)}
                    originalPrice={
                      product.discount_percentage > 0 && product.final_price
                        ? Number(product.price)
                        : undefined
                    }
                    image={getProductImage(product)}
                    images={getProductImages(product)}
                    rating={4.5}
                    reviewCount={10}
                    discount={product.discount_percentage}
                    inStock={true}
                  />
                ))}
              </div>

              {/* Load More */}
              {results.length < totalCount && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري التحميل...
                      </span>
                    ) : (
                      "عرض المزيد"
                    )}
                  </button>
                </div>
              )}
            </>
          ) : query ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                لا توجد نتائج
              </h2>
              <p className="text-muted-foreground mb-6">
                لم نتمكن من العثور على نتائج لـ "{query}"
              </p>
              
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-8">
                  <p className="text-foreground font-medium mb-4">اقتراحات:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map((suggestion, index) => (
                      <Link
                        key={index}
                        to={`/search?q=${encodeURIComponent(suggestion)}`}
                        className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors"
                      >
                        {suggestion}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">أدخل كلمة البحث للبدء</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

