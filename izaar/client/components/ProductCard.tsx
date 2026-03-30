// import { Heart, Eye } from "lucide-react";
// import { Link } from "react-router-dom";
// import { useState } from "react";
// import { useCart } from "@/contexts/CartContext";

// interface ProductCardProps {
//   id: string; // This should be the UUID
//   slug: string; // This is for navigation
//   name: string;
//   price: number;
//   originalPrice?: number;
//   image: string;
//   images?: string[]; // All product images for gallery
//   rating: number;
//   reviewCount: number;
//   discount?: number;
//   inStock?: boolean;
// }

// export default function ProductCard({
//   id,
//   slug,
//   name,
//   price,
//   originalPrice,
//   image,
//   images = [], // Gallery images
//   rating,
//   reviewCount,
//   discount,
//   inStock = true,
// }: ProductCardProps) {
//   const [isWishlisted, setIsWishlisted] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const { addToCart } = useCart();

//   // Get all available images (excluding the main image if it's in the images array)
//   const allImages = images.length > 0 ? images : [image];
//   const hasMultipleImages = allImages.length > 1;
  
//   // Get additional images (excluding the main one if it's the same)
//   const additionalImages = hasMultipleImages 
//     ? allImages.filter((img) => img !== image).slice(0, 4) // Show max 4 additional images
//     : [];

//   const handleAddToCart = () => {
//     addToCart({
//       id,
//       name,
//       price,
//       image,
//     });
//   };

//   const discountPercentage = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

//   return (
//     <div 
//       className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       {/* Image Container */}
//       <div className="relative w-full aspect-square bg-secondary overflow-hidden">
//         {/* Main Image - Fixed, no transitions, always visible - NEVER CHANGES */}
//         <img
//           src={image}
//           alt={name}
//           className="w-full h-full object-cover"
//           loading="lazy"
//           decoding="async"
//           onError={(e) => {
//             (e.target as HTMLImageElement).src = '/placeholder.svg';
//           }}
//         />
        
//         {/* Gallery Thumbnails - Shows below main image on hover */}
//         {isHovered && hasMultipleImages && additionalImages.length > 0 && (
//           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2 z-20">
//             <div className="flex gap-1.5 justify-center overflow-x-auto pb-1">
//               {additionalImages.slice(0, 4).map((img, index) => (
//                 <div
//                   key={index}
//                   className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 border-white/60 shadow-md"
//                 >
//                   <img
//                     src={img}
//                     alt={`${name} - صورة ${index + 2}`}
//                     className="w-full h-full object-cover"
//                     loading="lazy"
//                     onError={(e) => {
//                       (e.target as HTMLImageElement).src = '/placeholder.svg';
//                     }}
//                   />
//                 </div>
//               ))}
//               {allImages.length > 5 && (
//                 <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 border-white/60 shadow-md bg-black/70 flex items-center justify-center">
//                   <span className="text-white text-xs font-bold">
//                     +{allImages.length - 5}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Discount Badge */}
//         {discountPercentage > 0 && (
//           <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-bold">
//             خصم {discountPercentage}%
//           </div>
//         )}

//         {/* Wishlist Button */}
//         <button
//           onClick={() => setIsWishlisted(!isWishlisted)}
//           className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
//         >
//           <Heart
//             className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
//               }`}
//           />
//         </button>

//         {/* Quick View Button (Desktop only) - Show after a delay to not interfere with image gallery */}
//         <Link
//           to={`/product/${slug}`}
//           className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-30 pointer-events-none group-hover:pointer-events-auto"
//         >
//           <button 
//             className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-colors shadow-lg"
//             onClick={(e) => {
//               e.stopPropagation();
//             }}
//           >
//             <Eye className="w-5 h-5" />
//           </button>
//         </Link>

//         {/* Stock Badge */}
//         {!inStock && (
//           <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//             <span className="bg-white text-black px-3 py-1 rounded-lg font-bold">غير متوفر</span>
//           </div>
//         )}
//       </div>

//       {/* Product Info */}
//       <div className="p-4">
//         {/* Product Name */}
//         <h3 className="font-medium text-sm md:text-base text-foreground line-clamp-2 mb-2">
//           <Link
//             to={`/product/${slug}`}
//             className="hover:text-primary transition-colors"
//           >
//             {name}
//           </Link>
//         </h3>

//         {/* Rating - DISABLED: Will be enabled later when review system is activated */}
//         {/* 
//         <div className="flex items-center gap-1 mb-3 text-xs">
//           <div className="flex gap-0.5">
//             {Array.from({ length: 5 }).map((_, i) => (
//               <span
//                 key={i}
//                 className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}
//               >
//                 ★
//               </span>
//             ))}
//           </div>
//           <span className="text-muted-foreground">({reviewCount})</span>
//         </div>
//         */}

//         {/* Price */}
//         <div className="mb-4">
//           {originalPrice ? (
//             <div className="flex items-center gap-2">
//               <span className="text-lg md:text-xl font-bold text-accent">
//                 {price.toLocaleString("ar-EG")} جنيه
//               </span>
//               <span className="text-xs md:text-sm text-muted-foreground line-through">
//                 {originalPrice.toLocaleString("ar-EG")} جنيه
//               </span>
//             </div>
//           ) : (
//             <span className="text-lg md:text-xl font-bold text-foreground">
//               {price.toLocaleString("ar-EG")} جنيه
//             </span>
//           )}
//         </div>

//         {/* Add to Cart Button */}
//         <button
//           onClick={handleAddToCart}
//           disabled={!inStock}
//           className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           أضف للسلة
//         </button>
//       </div>
//     </div>
//   );
// }
// ................


import { Heart, Eye, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import QuickBuyModal, { type QuickBuyProduct } from "@/components/QuickBuyModal";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  discount?: number;
  inStock?: boolean;
  stock_quantity?: number;
  available_sizes?: string[];
  available_colors?: string[];
}

export default function ProductCard({
  id,
  slug,
  name,
  name_ar,
  name_en,
  price,
  originalPrice,
  image,
  images = [],
  rating,
  reviewCount,
  discount,
  inStock = true,
  stock_quantity,
  available_sizes,
  available_colors,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeImage, setActiveImage] = useState(image);
  const imgRef = useRef<HTMLImageElement>(null);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { t, language } = useLanguage();
  const isWishlisted = isInWishlist(id);

  // Ensure 'images' prop contains the main image to avoid duplicates in logic
  const allImages = images.length > 0 ? images : [image];
  const hasMultipleImages = allImages.length > 1;

  useEffect(() => {
    setActiveImage(image);
    setImageLoaded(false);
  }, [image]);

  // On hover, automatically switch to second image if available
  useEffect(() => {
    if (isHovered && hasMultipleImages) {
      const secondImage = allImages.find(img => img !== image);
      if (secondImage && secondImage !== image) {
        setActiveImage(secondImage);
      }
    } else {
      setActiveImage(image);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered, image]);

  // When activeImage changes (hover or return), reset loading state
  useEffect(() => {
    setImageLoaded(false);
  }, [activeImage]);

  // Handle cached images: onLoad may not fire when image is served from cache (e.g. after navigating back).
  // Check img.complete after render - if already loaded, set imageLoaded immediately.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const checkComplete = () => {
      if (img.complete && img.naturalWidth > 0) {
        setImageLoaded(true);
        return true;
      }
      return false;
    };

    if (checkComplete()) return;

    // Cached images can complete in the next frame - check again (fixes navigate-back loading bug)
    const rafId = requestAnimationFrame(() => {
      checkComplete();
    });
    return () => cancelAnimationFrame(rafId);
  }, [activeImage]);

  // We show up to 4 thumbnails. We don't filter out the main image here, 
  // so the user can switch back to it easily.
  const galleryImages = hasMultipleImages ? allImages.slice(0, 5) : [];

  const handleAddToCart = () => {
    // Check stock availability before adding to cart
    if (stock_quantity !== undefined && stock_quantity < Infinity && stock_quantity <= 0) {
      toast.error(t('product.outOfStock'));
      return;
    }

    addToCart({
      id,
      name,
      price,
      originalPrice: originalPrice,
      discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
      image,
      stock_quantity, // Include stock quantity
    });
  };

  const discountPercentage = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  return (
    <div
      className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-secondary overflow-hidden">
        
        {/* Image loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary z-[5]">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs text-muted-foreground">{language === 'en' ? 'Loading product...' : 'يتم تحميل المنتج'}</span>
          </div>
        )}

        {/* Main Image */}
        <Link to={`/product/${slug}`} className="block w-full h-full">
          <img
            ref={imgRef}
            src={activeImage}
            alt={name}
            className={`w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
              setImageLoaded(true);
            }}
          />
        </Link>

        {/* Gallery Thumbnails - Displayed on Card Hover */}
        {isHovered && hasMultipleImages && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 z-20">
            <div className="flex gap-2 justify-center overflow-x-auto pb-1 no-scrollbar">
              {galleryImages.map((img, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setActiveImage(img)} // Swap main image on hover
                  className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                    activeImage === img ? "border-primary shadow-lg scale-110" : "border-white/60 hover:border-white"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${name} - ${index}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-bold z-10">
            {t('product.discount')} {discountPercentage}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToWishlist({
              id,
              slug,
              name,
              price,
              image,
              originalPrice,
              discount,
            });
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-30"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
            }`}
          />
        </button>

        {/* Quick View Button */}
        <Link
          to={`/product/${slug}`}
          className="absolute inset-0 bg-black/0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300"
        >
          {/* Only show the eye if we aren't hovering the bottom thumbnails area. 
              However, simplified approach: Eye button centered */}
          {!hasMultipleImages && (
             <button
             className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg"
           >
             <Eye className="w-5 h-5" />
           </button>
          )}
        </Link>

        {/* Stock Badge */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
            <span className="bg-white text-black px-3 py-1 rounded-lg font-bold">{t('product.outOfStock')}</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-medium text-xs sm:text-sm md:text-base text-foreground line-clamp-2 mb-2 min-h-[2.25rem] break-normal">
          <Link
            to={`/product/${slug}`}
            className="hover:text-primary transition-colors"
          >
            {name}
          </Link>
        </h3>

        <div className="mb-4">
          {originalPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg md:text-xl font-bold text-accent">
                {price.toLocaleString(language === 'en' ? 'en-US' : 'ar-EG')} {t('product.egp')}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground line-through">
                {originalPrice.toLocaleString(language === 'en' ? 'en-US' : 'ar-EG')} {t('product.egp')}
              </span>
            </div>
          ) : (
            <span className="text-base sm:text-lg md:text-xl font-bold text-foreground">
              {price.toLocaleString(language === 'en' ? 'en-US' : 'ar-EG')} {t('product.egp')}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex-1 py-2 px-2 sm:px-3 bg-primary text-primary-foreground rounded-lg font-medium text-xs sm:text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('product.addToCart')}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickBuy(true);
            }}
            disabled={!inStock}
            className="py-2 px-2 sm:px-3 bg-accent text-accent-foreground rounded-lg font-medium text-xs sm:text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={language === 'en' ? 'Buy Now' : 'اشتري الآن'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      <QuickBuyModal
        isOpen={showQuickBuy}
        onClose={() => setShowQuickBuy(false)}
        product={showQuickBuy ? {
          id,
          name_ar: name_ar || name,
          name_en: name_en,
          slug,
          price: originalPrice || price,
          final_price: price,
          discount_percentage: discount || 0,
          primary_image: image,
          images: images?.map(img => ({ image_url: img })),
          available_sizes: available_sizes || [],
          available_colors: available_colors || [],
          stock_quantity,
        } : null}
      />
    </div>
  );
}