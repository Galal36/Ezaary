// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { ChevronRight, ChevronLeft, MessageCircle, Loader2 } from "lucide-react";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import ProductCard from "@/components/ProductCard";
// import CategoryCard from "@/components/CategoryCard";
// import { categories as categoriesApi, products as productsApi } from "@/lib/api-client";
// import { normalizeImageUrl } from "@/lib/data-mappers";
// import { toast } from "sonner";

// export default function Home() {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [autoPlay, setAutoPlay] = useState(true);
//   const [categoriesList, setCategoriesList] = useState<any[]>([]);
//   const [specialOffers, setSpecialOffers] = useState<any[]>([]);
//   const [allProducts, setAllProducts] = useState<any[]>([]);
//   const [isLoadingCategories, setIsLoadingCategories] = useState(true);
//   const [isLoadingOffers, setIsLoadingOffers] = useState(true);
//   const [isLoadingAllProducts, setIsLoadingAllProducts] = useState(true);

//   // Helper to get product image
//   const getProductImage = (product: any) => {
//     if (product.primary_image) return normalizeImageUrl(product.primary_image);
//     if (product.images && product.images.length > 0) {
//       const firstImg = product.images[0];
//       return normalizeImageUrl(firstImg.image_url || firstImg.url || firstImg);
//     }
//     // Fallback to first available image from product object structure if needed
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

//   // Pagination / Load More state
//   const [visibleOffersCount, setVisibleOffersCount] = useState(9); // Initial 9 items
//   const [totalOffers, setTotalOffers] = useState(0);

//   const [visibleAllProductsCount, setVisibleAllProductsCount] = useState(12); // Initial 12 items
//   const [totalAllProducts, setTotalAllProducts] = useState(0);

//   // Hero slides (Static for now, can be dynamic later)
//   const heroSlides = [
//     {
//       id: 1,
//       title: "أحدث موديلات الملابس الرجالية",
//       subtitle: "جودة عالية وأسعار منافسة",
//       cta: "تسوق الآن",
//       image:
//         "https://images.unsplash.com/photo-1539701038985-a8a6c3b7414e?w=1200&h=400&fit=crop&auto=format&q=80",
//       discount: "خصم 30%",
//     },
//     {
//       id: 2,
//       title: "مجموعة الصيف الجديدة",
//       subtitle: "أحدث التصاميم بأفضل الأسعار",
//       cta: "اكتشف المزيد",
//       image:
//         "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=400&fit=crop&auto=format&q=80",
//       discount: "على كل شيء",
//     },
//     {
//       id: 3,
//       title: "الماركات العالمية الموثوقة",
//       subtitle: "Nike، Adidas، وأكثر",
//       cta: "تسوق الآن",
//       image:
//         "https://images.unsplash.com/photo-1502252430562-40eb08b0126f?w=1200&h=400&fit=crop&auto=format&q=80",
//       discount: "خصم حتى 50%",
//     },
//   ];

//   useEffect(() => {
//     fetchCategories();
//     fetchSpecialOffers();
//     fetchAllProducts();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       setIsLoadingCategories(true);
//       const data = await categoriesApi.list();
//       setCategoriesList(data);
//     } catch (error) {
//       console.error("Failed to fetch categories:", error);
//       toast.error("فشل تحميل الفئات");
//     } finally {
//       setIsLoadingCategories(false);
//     }
//   };

//   const fetchSpecialOffers = async () => {
//     try {
//       setIsLoadingOffers(true);
//       // Fetch on-sale products with reasonable limit
//       const data = await productsApi.list({ min_discount: '20', page_size: '18', ordering: '-discount_percentage' });
//       // Handle both paginated and non-paginated responses
//       const offers = data.results || data;
//       setSpecialOffers(offers);
//       setTotalOffers(data.count || offers.length);
//     } catch (error) {
//       console.error("Failed to fetch special offers:", error);
//       // Don't show toast for offers if empty, just log
//     } finally {
//       setIsLoadingOffers(false);
//     }
//   };

//   const fetchAllProducts = async () => {
//     try {
//       setIsLoadingAllProducts(true);
//       // Fetch products with reasonable pagination - load more as user scrolls
//       const data = await productsApi.list({ page_size: '24', ordering: '-created_at' });
//       // Handle both paginated and non-paginated responses
//       const products = data.results || data;
//       const total = data.count || products.length;
//       setAllProducts(products);
//       setTotalAllProducts(total);
//     } catch (error) {
//       console.error("Failed to fetch all products:", error);
//     } finally {
//       setIsLoadingAllProducts(false);
//     }
//   };

//   const handleLoadMore = () => {
//     // Increase visible count by 9 or remaining
//     setVisibleOffersCount(prev => prev + 9);
//   };

//   const handleLoadMoreAll = () => {
//     setVisibleAllProductsCount(prev => prev + 12);
//   };

//   // Auto-play hero slides
//   useEffect(() => {
//     if (!autoPlay) return;
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [autoPlay, heroSlides.length]);

//   const goToSlide = (index: number) => {
//     setCurrentSlide(index);
//     setAutoPlay(false);
//   };

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
//     setAutoPlay(false);
//   };

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
//     setAutoPlay(false);
//   };

//   return (
//     <div className="w-full min-h-screen flex flex-col bg-background">
//       <Header />

//       <main className="flex-1">
//         {/* Hero Section */}
//         <section className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
//           {heroSlides.map((slide, index) => (
//             <div
//               key={slide.id}
//               className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
//                 }`}
//             >
//               <img
//                 src={slide.image}
//                 alt={slide.title}
//                 className="w-full h-full object-cover"
//               />
//               <div className="absolute inset-0 bg-black/40" />

//               {/* Hero Content */}
//               <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
//                 <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
//                   {slide.title}
//                 </h1>
//                 <p className="text-lg md:text-xl mb-6 opacity-90">
//                   {slide.subtitle}
//                 </p>
//                 <div className="flex gap-4 flex-col sm:flex-row">
//                   <button className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity">
//                     {slide.cta}
//                   </button>
//                   <span className="bg-white/20 text-white px-6 py-3 rounded-lg font-bold">
//                     {slide.discount}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}

//           {/* Navigation Buttons */}
//           <button
//             onClick={prevSlide}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 hover:bg-white transition-colors hidden md:flex"
//           >
//             <ChevronLeft className="w-6 h-6 text-foreground" />
//           </button>

//           <button
//             onClick={nextSlide}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 hover:bg-white transition-colors hidden md:flex"
//           >
//             <ChevronRight className="w-6 h-6 text-foreground" />
//           </button>

//           {/* Dots */}
//           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
//             {heroSlides.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => goToSlide(index)}
//                 className={`w-3 h-3 rounded-full transition-all ${index === currentSlide
//                   ? "bg-accent w-8"
//                   : "bg-white/60 hover:bg-white"
//                   }`}
//               />
//             ))}
//           </div>
//         </section>

//         {/* Our Products Section */}
//         <section className="py-12 md:py-16">
//           <div className="max-w-7xl mx-auto px-4 lg:px-8">
//             <div className="mb-10">
//               <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">
//                 منتجاتنا
//               </h2>
//               <p className="text-center text-muted-foreground mt-2">
//                 تصفح جميع منتجاتنا المميزة
//               </p>
//             </div>

//             {isLoadingAllProducts ? (
//               <div className="flex justify-center py-10">
//                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
//               </div>
//             ) : offersListEmpty(allProducts) ? (
//               <div className="text-center py-10 text-muted-foreground">لا توجد منتجات حالياً</div>
//             ) : (
//               <>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                   {allProducts.slice(0, visibleAllProductsCount).map((product) => (
//                     <ProductCard
//                       key={product.id}
//                       id={product.id}
//                       slug={product.slug}
//                       name={product.name_ar}
//                       price={Number(product.final_price || product.price)}
//                       originalPrice={
//                         product.discount_percentage > 0 && product.final_price
//                           ? Number(product.price)
//                           : undefined
//                       }
//                       image={getProductImage(product)}
//                       images={getProductImages(product)}
//                       rating={4.8}
//                       reviewCount={12}
//                       discount={product.discount_percentage}
//                       inStock={product.is_in_stock}
//                     />
//                   ))}
//                 </div>

//                 {visibleAllProductsCount < totalAllProducts && (
//                   <div className="text-center mt-10">
//                     <button
//                       onClick={handleLoadMoreAll}
//                       className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors cursor-pointer"
//                     >
//                       عرض المزيد من المنتجات
//                     </button>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </section>

//         {/* Featured Products Section (Special Offers) */}
//         <section className="bg-secondary py-12 md:py-16">
//           <div className="max-w-7xl mx-auto px-4 lg:px-8">
//             <div className="mb-10">
//               <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">
//                 عروض خاصة
//               </h2>
//               <p className="text-center text-muted-foreground mt-2">
//                 اكتشف أفضل العروض والخصومات على المنتجات المختارة
//               </p>
//             </div>

//             {isLoadingOffers ? (
//               <div className="flex justify-center py-10">
//                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
//               </div>
//             ) : offersListEmpty(specialOffers) ? (
//               <div className="text-center py-10 text-muted-foreground">لا توجد عروض حالياً</div>
//             ) : (
//               <>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                   {specialOffers.slice(0, visibleOffersCount).map((product) => (
//                     <ProductCard
//                       key={product.id}
//                       id={product.id}
//                       slug={product.slug}
//                       name={product.name_ar}
//                       price={Number(product.final_price || product.price)}
//                       originalPrice={
//                         product.discount_percentage > 0 && product.final_price
//                           ? Number(product.price)
//                           : undefined
//                       }
//                       image={getProductImage(product)}
//                       images={getProductImages(product)}
//                       rating={4.8} // Using a default rating since it's not in the API
//                       reviewCount={12}
//                       discount={product.discount_percentage}
//                       inStock={product.is_in_stock}
//                     />
//                   ))}
//                 </div>

//                 {visibleOffersCount < totalOffers && (
//                   <div className="text-center mt-10">
//                     <button
//                       onClick={handleLoadMore}
//                       className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors cursor-pointer"
//                     >
//                       عرض المزيد من العروض
//                     </button>
//                   </div>
//                 )}

//                 {/* Fallback to 'All Products' if no load more needed? Or keep as general link? 
//                     User asked: "see more should give more products" -> implied load more logic.
//                     I will ADD a general 'Browse All' button below separately or just use load more.
//                     User requirement: "see more ... button should give more products" - I implemented load more.
//                  */}
//                 {visibleOffersCount >= totalOffers && (
//                   <div className="text-center mt-10">
//                     <Link
//                       to="/products"
//                       className="inline-block bg-outline border border-primary text-primary px-8 py-3 rounded-lg font-bold hover:bg-primary/10 transition-colors"
//                     >
//                       تصفح كل المنتجات
//                     </Link>
//                   </div>
//                 )}

//               </>
//             )}
//           </div>
//         </section>

//         {/* Categories Section */}
//         <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-16">
//           <div className="mb-10">
//             <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">
//               تصفح حسب الفئة
//             </h2>
//             <p className="text-center text-muted-foreground mt-2">
//               استكشف مجموعتنا الواسعة من الفئات
//             </p>
//           </div>

//           {isLoadingCategories ? (
//             <div className="flex justify-center py-10">
//               <Loader2 className="w-8 h-8 animate-spin text-primary" />
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {categoriesList.map((category) => (
//                 <CategoryCard
//                   key={category.id}
//                   id={category.slug} // Link to category slug ideally
//                   name={category.name_ar}
//                   image={category.image_url || "/placeholder-category.jpg"}
//                 />
//               ))}
//             </div>
//           )}
//         </section>





//         {/* CTA Section */}
//         <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-16">
//           <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
//             <h2 className="text-2xl md:text-3xl font-bold mb-4">
//               هل لديك أسئلة أو تحتاج مساعدة؟
//             </h2>
//             <p className="text-lg mb-6 opacity-90">
//               نحن هنا للمساعدة. تواصل معنا عبر WhatsApp أو أي وسيلة اتصال أخرى
//             </p>
//             <a
//               href="https://wa.me/201204437575?text=مرحباً، أرغب في الاستفسار عن..."
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
//             >
//               <MessageCircle className="w-5 h-5" />
//               تواصل معنا عبر WhatsApp
//             </a>
//           </div>
//         </section>

//         {/* Info Section */}
//         <section className="bg-secondary py-12">
//           <div className="max-w-7xl mx-auto px-4 lg:px-8">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//               <div>
//                 <div className="w-16 h-16 mx-auto mb-4 bg-accent rounded-full flex items-center justify-center">
//                   <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold mb-2">شحن سريع</h3>
//                 <p className="text-muted-foreground">التوصيل خلال 3-5 أيام عمل</p>
//               </div>
//               <div>
//                 <div className="w-16 h-16 mx-auto mb-4 bg-accent rounded-full flex items-center justify-center">
//                   <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold mb-2">أسعار منافسة</h3>
//                 <p className="text-muted-foreground">أفضل الأسعار في السوق</p>
//               </div>
//               <div>
//                 <div className="w-16 h-16 mx-auto mb-4 bg-accent rounded-full flex items-center justify-center">
//                   <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.172l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold mb-2">ضمان الجودة</h3>
//                 <p className="text-muted-foreground">منتجات أصلية وموثوقة</p>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       <Footer />

//       {/* Floating WhatsApp Button */}
//       <a
//         href="https://wa.me/201204437575?text=مرحباً، أرغب في الاستفسار عن..."
//         target="_blank"
//         rel="noopener noreferrer"
//         className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
//         title="تواصل معنا عبر WhatsApp"
//       >
//         <MessageCircle className="w-7 h-7 text-accent-foreground" />
//       </a>
//     </div>
//   );
// }

// // Helper to check empty array safely
// function offersListEmpty(list: any[]) {
//   return !list || list.length === 0;
// }


// ..............


import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, MessageCircle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { categories as categoriesApi, products as productsApi } from "@/lib/api-client";
import { normalizeImageUrl } from "@/lib/data-mappers";
import { toast } from "sonner";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(1); // Start with slide 2 (إزاري_1) as default
  const [autoPlay, setAutoPlay] = useState(true);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [specialOffers, setSpecialOffers] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [isLoadingAllProducts, setIsLoadingAllProducts] = useState(true);

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
    
    // 4. Remove duplicates (using Set)
    return Array.from(new Set(images));
  };

  // Pagination / Load More state
  const [visibleOffersCount, setVisibleOffersCount] = useState(9);
  const [totalOffers, setTotalOffers] = useState(0);

  const [visibleAllProductsCount, setVisibleAllProductsCount] = useState(12);
  const [totalAllProducts, setTotalAllProducts] = useState(0);

  // Hero slides
  const heroSlides = [
    {
      id: 1,
      title: "إزاري نسائي",
      subtitle: "أحدث صيحات الموضة النسائية",
      discountButton: "خصومات تصل الي 20 في المائة",
      cta: "اكتشف المزيد",
      ctaLink: "#products", // Scrolls to products section on home page
      image: "http://localhost:8000/media/hero_section/" + encodeURIComponent("إزاري_نسائي.png"),
      discount: "خصم 20%",
    },
    {
      id: 2,
      title: "إزاري رجالي",
      subtitle: "أحدث موديلات الملابس الرجالية",
      discountButton: "خصومات تصل الي 30 في المائة لا تنتظر",
      cta: "اكتشف المزيد من منتجات الرجال",
      ctaLink: "#products", // Scrolls to products section on home page
      image: "http://localhost:8000/media/hero_section/" + encodeURIComponent("إزاري_1.png"),
      discount: "خصم 30%",
    },
    {
      id: 3,
      title: "إزاري رجالي",
      subtitle: "جودة عالية وأسعار منافسة",
      discountButton: "خصومات تصل الي 30 في المائة لا تنتظر",
      cta: "اكتشف المزيد من منتجات الرجال",
      ctaLink: "#products", // Scrolls to products section on home page
      image: "http://localhost:8000/media/hero_section/" + encodeURIComponent("أزاري_رجالي 2.png"),
      discount: "خصم 30%",
    },
  ];

  useEffect(() => {
    fetchCategories();
    fetchSpecialOffers();
    fetchAllProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data = await categoriesApi.list();
      setCategoriesList(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("فشل تحميل الفئات");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchSpecialOffers = async () => {
    try {
      setIsLoadingOffers(true);
      const data = await productsApi.list({ min_discount: '20', page_size: '18', ordering: '-discount_percentage' });
      const offers = data.results || data;
      setSpecialOffers(offers);
      setTotalOffers(data.count || offers.length);
    } catch (error) {
      console.error("Failed to fetch special offers:", error);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      setIsLoadingAllProducts(true);
      // Use display_order for custom ordering (default ordering from backend)
      const data = await productsApi.list({ page_size: '24' });
      const products = data.results || data;
      const total = data.count || products.length;
      setAllProducts(products);
      setTotalAllProducts(total);
    } catch (error) {
      console.error("Failed to fetch all products:", error);
    } finally {
      setIsLoadingAllProducts(false);
    }
  };

  const handleLoadMore = () => {
    setVisibleOffersCount(prev => prev + 9);
  };

  const handleLoadMoreAll = () => {
    setVisibleAllProductsCount(prev => prev + 12);
  };

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoPlay, heroSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setAutoPlay(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                style={{ 
                  objectPosition: slide.id === 1 
                    ? '90% 12%' // For slide 1 (إزاري_نسائي): position higher up and more to the right
                    : slide.id === 2 
                    ? '90% 10%' // For slide 2 (إزاري_1): position higher up and more to the right
                    : '90% 0%' // For slide 3 (أزاري_رجالي 2): position higher up and more to the right
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black/50" />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 md:px-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl mb-6 opacity-90">
                  {slide.subtitle}
                </p>
                <div className="flex gap-4 flex-col sm:flex-row justify-center">
                  {slide.discountButton && (
                    <span className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-bold">
                      {slide.discountButton}
                    </span>
                  )}
                  {slide.cta && (
                    <a
                      href={slide.ctaLink || "#products"}
                      className="bg-white/90 text-foreground px-8 py-3 rounded-lg font-bold hover:bg-white transition-colors inline-block"
                    >
                      {slide.cta}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 hover:bg-white transition-colors hidden md:flex"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 hover:bg-white transition-colors hidden md:flex"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentSlide
                  ? "bg-accent w-8"
                  : "bg-white/60 hover:bg-white"
                  }`}
              />
            ))}
          </div>
        </section>

        {/* Our Products Section */}
        <section id="products" className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">
                منتجاتنا
              </h2>
              <p className="text-center text-muted-foreground mt-2">
                تصفح جميع منتجاتنا المميزة
              </p>
            </div>

            {isLoadingAllProducts ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : offersListEmpty(allProducts) ? (
              <div className="text-center py-10 text-muted-foreground">لا توجد منتجات حالياً</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {allProducts.slice(0, visibleAllProductsCount).map((product) => (
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
                      rating={4.8}
                      reviewCount={12}
                      discount={product.discount_percentage}
                      inStock={product.is_in_stock}
                      stock_quantity={product.stock_quantity}
                    />
                  ))}
                </div>

                {visibleAllProductsCount < totalAllProducts && (
                  <div className="text-center mt-10">
                    <button
                      onClick={handleLoadMoreAll}
                      className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      عرض المزيد من المنتجات
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="bg-secondary py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">
                عروض خاصة
              </h2>
              <p className="text-center text-muted-foreground mt-2">
                اكتشف أفضل العروض والخصومات على المنتجات المختارة
              </p>
            </div>

            {isLoadingOffers ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : offersListEmpty(specialOffers) ? (
              <div className="text-center py-10 text-muted-foreground">لا توجد عروض حالياً</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {specialOffers.slice(0, visibleOffersCount).map((product) => (
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
                      rating={4.8}
                      reviewCount={12}
                      discount={product.discount_percentage}
                      inStock={product.is_in_stock}
                      stock_quantity={product.stock_quantity}
                    />
                  ))}
                </div>

                {visibleOffersCount < totalOffers && (
                  <div className="text-center mt-10">
                    <button
                      onClick={handleLoadMore}
                      className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      عرض المزيد من العروض
                    </button>
                  </div>
                )}

                {visibleOffersCount >= totalOffers && (
                  <div className="text-center mt-10">
                    <Link
                      to="/products"
                      className="inline-block bg-outline border border-primary text-primary px-8 py-3 rounded-lg font-bold hover:bg-primary/10 transition-colors"
                    >
                      تصفح كل المنتجات
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-16">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">
              تصفح حسب الفئة
            </h2>
            <p className="text-center text-muted-foreground mt-2">
              استكشف مجموعتنا الواسعة من الفئات
            </p>
          </div>

          {isLoadingCategories ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoriesList.map((category) => (
                <CategoryCard
                  key={category.id}
                  id={category.slug}
                  name={category.name_ar}
                  image={category.image_url || "/placeholder-category.jpg"}
                />
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-16">
          <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              هل لديك أسئلة أو تحتاج مساعدة؟
            </h2>
            <p className="text-lg mb-6 opacity-90">
              نحن هنا للمساعدة. تواصل معنا عبر WhatsApp أو أي وسيلة اتصال أخرى
            </p>
            <a
              href="https://wa.me/201204437575?text=مرحباً، أرغب في الاستفسار عن..."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-5 h-5" />
              تواصل معنا عبر WhatsApp
            </a>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-secondary py-12">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 mx-auto mb-4 bg-accent rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">شحن سريع</h3>
                <p className="text-muted-foreground">التوصيل خلال 3-5 أيام عمل</p>
              </div>
              <div>
                <div className="w-16 h-16 mx-auto mb-4 bg-accent rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">أسعار منافسة</h3>
                <p className="text-muted-foreground">أفضل الأسعار في السوق</p>
              </div>
              <div>
                <div className="w-16 h-16 mx-auto mb-4 bg-accent rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.172l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">ضمان الجودة</h3>
                <p className="text-muted-foreground">منتجات أصلية وموثوقة</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <a
        href="https://wa.me/201204437575?text=مرحباً، أرغب في الاستفسار عن..."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
        title="تواصل معنا عبر WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-accent-foreground" />
      </a>
    </div>
  );
}

function offersListEmpty(list: any[]) {
  return !list || list.length === 0;
}