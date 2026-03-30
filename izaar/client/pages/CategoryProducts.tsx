// import { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import { ChevronRight, Loader2 } from "lucide-react";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import ProductCard from "@/components/ProductCard";
// import { categories as categoriesApi, products as productsApi } from "@/lib/api-client";
// import { normalizeImageUrl } from "@/lib/data-mappers";
// import { toast } from "sonner";

// export default function CategoryProducts() {
//   const { categoryId } = useParams<{ categoryId: string }>(); // This is actually the slug
//   const [category, setCategory] = useState<any>(null);
//   const [products, setProducts] = useState<any[]>([]);
//   const [relatedCategories, setRelatedCategories] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Helper to get product image
//   const getProductImage = (product: any) => {
//     if (product.primary_image) return normalizeImageUrl(product.primary_image);
//     if (product.images && product.images.length > 0) {
//       const firstImg = product.images[0];
//       return normalizeImageUrl(firstImg.image_url || firstImg.url || firstImg);
//     }
//     return "/placeholder-product.jpg";
//   };

//   // Helper to get all product images for gallery
//   const getProductImages = (product: any): string[] => {
//     const images: string[] = [];
    
//     // If product has images array, extract all image URLs
//     if (product.images && Array.isArray(product.images)) {
//       product.images.forEach((img: any) => {
//         const url = img.image_url || img.url || img;
//         if (url) {
//           images.push(normalizeImageUrl(url));
//         }
//       });
//     }
    
//     // If no images found, use primary_image or fallback
//     if (images.length === 0) {
//       if (product.primary_image) {
//         images.push(normalizeImageUrl(product.primary_image));
//       } else {
//         images.push("/placeholder-product.jpg");
//       }
//     }
    
//     return images;
//   };

//   // Pagination / Load More
//   const [visibleCount, setVisibleCount] = useState(12);

//   useEffect(() => {
//     if (categoryId) {
//       loadCategoryData(categoryId);
//     }
//   }, [categoryId]);

//   const loadCategoryData = async (slug: string) => {
//     try {
//       setIsLoading(true);

//       // Parallel fetch: Category details, Products, Related Categories
//       const [catData, prodData, allCats] = await Promise.all([
//         categoriesApi.get(slug),
//         productsApi.list({ category: slug, page_size: '100' }), // Fetch filtered products
//         categoriesApi.list() // For related categories section
//       ]);

//       setCategory(catData);
//       setProducts(prodData);
//       setRelatedCategories(allCats.results || allCats); // handle pagination wrapper if present

//     } catch (error) {
//       console.error("Failed to load category data:", error);
//       // If category fetch fails specifically, category state remains null treated as not found
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLoadMore = () => {
//     setVisibleCount(prev => prev + 12);
//   };

//   if (isLoading) {
//     return (
//       <div className="w-full min-h-screen flex flex-col bg-background">
//         <Header />
//         <main className="flex-1 flex items-center justify-center">
//           <Loader2 className="w-8 h-8 animate-spin text-primary" />
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   if (!category) {
//     return (
//       <div className="w-full min-h-screen flex flex-col bg-background">
//         <Header />
//         <main className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <h1 className="text-3xl font-bold text-primary mb-4">الفئة غير موجودة</h1>
//             <p className="text-muted-foreground mb-6">
//               نعتذر، الفئة التي تبحث عنها غير متاحة
//             </p>
//             <Link
//               to="/categories"
//               className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
//             >
//               العودة للفئات
//             </Link>
//           </div>
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full min-h-screen flex flex-col bg-background">
//       <Header />

//       <main className="flex-1">
//         {/* Breadcrumb */}
//         <section className="bg-secondary py-4">
//           <div className="max-w-7xl mx-auto px-4 lg:px-8">
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//               <Link to="/" className="hover:text-primary transition-colors">
//                 الرئيسية
//               </Link>
//               <ChevronRight className="w-4 h-4" />
//               <Link to="/categories" className="hover:text-primary transition-colors">
//                 الفئات
//               </Link>
//               <ChevronRight className="w-4 h-4" />
//               <span className="text-foreground font-medium">{category.name_ar}</span>
//             </div>
//           </div>
//         </section>

//         {/* Category Header */}
//         <section className="bg-primary text-primary-foreground py-8 md:py-12">
//           <div className="max-w-7xl mx-auto px-4 lg:px-8">
//             <h1 className="text-4xl md:text-5xl font-bold mb-2">{category.name_ar}</h1>
//             <p className="text-primary-foreground/90 text-lg">
//               {products.length} منتج متاح
//             </p>
//           </div>
//         </section>

//         {/* Filters and Products */}
//         <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-16">
//           {/* Products Grid */}
//           {products.length > 0 ? (
//             <>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
//                 {products.slice(0, visibleCount).map((product: any) => (
//                   <ProductCard
//                     key={product.id}
//                     id={product.id}
//                     slug={product.slug}
//                     name={product.name_ar}
//                     price={Number(product.final_price || product.price)}
//                     originalPrice={
//                       product.discount_percentage > 0 && product.final_price
//                         ? Number(product.price)
//                         : undefined
//                     }
//                     image={getProductImage(product)}
//                     images={getProductImages(product)}
//                     // Mock rating/reviews since not in API list
//                     rating={4.5}
//                     reviewCount={10}
//                     discount={product.discount_percentage}
//                     inStock={product.is_in_stock}
//                   />
//                 ))}
//               </div>

//               {/* Load More Button */}
//               {visibleCount < products.length && (
//                 <div className="text-center">
//                   <button
//                     onClick={handleLoadMore}
//                     className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
//                   >
//                     عرض المزيد من المنتجات
//                   </button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="text-center py-16">
//               <h2 className="text-2xl font-bold text-foreground mb-4">
//                 لا توجد منتجات في هذه الفئة
//               </h2>
//               <p className="text-muted-foreground mb-8">
//                 نعتذر، لا توجد منتجات متاحة حالياً في هذه الفئة. يرجى محاولة فئة أخرى.
//               </p>
//             </div>
//           )}
//         </section>

//         {/* Related Categories */}
//         <section className="bg-secondary py-12 md:py-16">
//           <div className="max-w-7xl mx-auto px-4 lg:px-8">
//             <h2 className="text-3xl font-bold text-center mb-10">فئات ذات صلة</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {relatedCategories
//                 .filter((c: any) => c.slug !== categoryId)
//                 .slice(0, 4)
//                 .map((relatedCategory: any) => (
//                   <Link
//                     key={relatedCategory.id}
//                     to={`/category/${relatedCategory.slug}`}
//                     className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
//                   >
//                     <img
//                       src={relatedCategory.image_url || "/placeholder-category.jpg"}
//                       alt={relatedCategory.name_ar}
//                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                       onError={(e) => {
//                         (e.target as HTMLImageElement).src = "/placeholder-category.jpg";
//                       }}
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/0" />
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <h3 className="text-white font-bold text-center px-4">
//                         {relatedCategory.name_ar}
//                       </h3>
//                     </div>
//                   </Link>
//                 ))}
//             </div>
//           </div>
//         </section>
//       </main>

//       <Footer />
//     </div>
//   );
// }
// ..............


import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories as categoriesApi, products as productsApi } from "@/lib/api-client";
import { normalizeImageUrl } from "@/lib/data-mappers";
import { toast } from "sonner";

export default function CategoryProducts() {
  const { categoryId } = useParams<{ categoryId: string }>(); 
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [relatedCategories, setRelatedCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to get product image
  const getProductImage = (product: any) => {
    if (product.primary_image) return normalizeImageUrl(product.primary_image);
    if (product.images && product.images.length > 0) {
      const firstImg = product.images[0];
      return normalizeImageUrl(firstImg.image_url || firstImg.url || firstImg);
    }
    return "/placeholder-product.jpg";
  };

  // Helper to get all product images for gallery (Robust Version)
  const getProductImages = (product: any): string[] => {
    const images: string[] = [];
    
    // 1. Add primary image first
    if (product.primary_image) {
      images.push(normalizeImageUrl(product.primary_image));
    }

    // 2. Add images from gallery array
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img: any) => {
        const url = img.image_url || img.url || img;
        if (url) {
          images.push(normalizeImageUrl(url));
        }
      });
    }

    // 3. Fallback if empty
    if (images.length === 0) {
      images.push("/placeholder-product.jpg");
    }
    
    // 4. Remove duplicates
    return Array.from(new Set(images));
  };

  // Pagination / Load More
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    if (categoryId) {
      loadCategoryData(categoryId);
    }
  }, [categoryId]);

  const loadCategoryData = async (slug: string) => {
    try {
      setIsLoading(true);

      const [catData, prodData, allCats] = await Promise.all([
        categoriesApi.get(slug),
        productsApi.list({ category: slug, page_size: '100' }), 
        categoriesApi.list() 
      ]);

      setCategory(catData);
      setProducts(prodData);
      setRelatedCategories(allCats.results || allCats);

    } catch (error) {
      console.error("Failed to load category data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-muted-foreground text-sm">يتم تحميل الصفحة</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-4">الفئة غير موجودة</h1>
            <p className="text-muted-foreground mb-6">
              نعتذر، الفئة التي تبحث عنها غير متاحة
            </p>
            <Link
              to="/categories"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              العودة للفئات
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <section className="bg-secondary py-4">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">
                الرئيسية
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/categories" className="hover:text-primary transition-colors">
                الفئات
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">{category.name_ar}</span>
            </div>
          </div>
        </section>

        {/* Category Header */}
        <section className="bg-primary text-primary-foreground py-8 md:py-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              {/* Category Image */}
              {category.image_url && (
                <div className="w-full md:w-64 h-48 md:h-64 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                  <img
                    src={normalizeImageUrl(category.image_url)}
                    alt={category.name_ar}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-category.jpg";
                    }}
                  />
                </div>
              )}
              
              {/* Category Info */}
              <div className="flex-1 text-center md:text-right">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{category.name_ar}</h1>
                {category.description_ar && (
                  <p className="text-primary-foreground/80 text-lg mb-3">
                    {category.description_ar}
                  </p>
                )}
                <p className="text-primary-foreground/90 text-lg">
                  {products.length} منتج متاح
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Products */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-16">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-12">
                {products.slice(0, visibleCount).map((product: any) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name_ar}
                    name_ar={product.name_ar}
                    name_en={product.name_en}
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
                    inStock={product.is_in_stock}
                    stock_quantity={product.stock_quantity}
                    available_sizes={product.available_sizes}
                    available_colors={product.available_colors}
                  />
                ))}
              </div>

              {visibleCount < products.length && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                  >
                    عرض المزيد من المنتجات
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                لا توجد منتجات في هذه الفئة
              </h2>
              <p className="text-muted-foreground mb-8">
                نعتذر، لا توجد منتجات متاحة حالياً في هذه الفئة. يرجى محاولة فئة أخرى.
              </p>
            </div>
          )}
        </section>

        {/* Related Categories */}
        <section className="bg-secondary py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-10">فئات ذات صلة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCategories
                .filter((c: any) => c.slug !== categoryId)
                .slice(0, 4)
                .map((relatedCategory: any) => (
                  <Link
                    key={relatedCategory.id}
                    to={`/category/${relatedCategory.slug}`}
                    className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={relatedCategory.image_url || "/placeholder-category.jpg"}
                      alt={relatedCategory.name_ar}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-category.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/0" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-white font-bold text-center px-4">
                        {relatedCategory.name_ar}
                      </h3>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}