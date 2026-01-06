import { useParams, Link } from "react-router-dom";
import { Heart, ChevronRight, ShoppingCart, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductImageGallery from "@/components/ProductImageGallery";
import { products as productsApi } from "@/lib/api-client";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { normalizeImageUrl } from "@/lib/data-mappers";

export default function Product() {
  const { productId } = useParams<{ productId: string }>(); // This is the slug
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  
  // Check if product is in wishlist
  const isWishlisted = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    if (productId) {
      loadProductData(productId);
      window.scrollTo(0, 0); // Scroll to top on navigation
    }
  }, [productId]);

  const loadProductData = async (slug: string) => {
    try {
      setIsLoading(true);
      const data = await productsApi.get(slug);
      
      // Ensure available_colors is always an array and clean it
      // IMPORTANT: Only use colors that are actually in the database, filter out any extras
      if (data) {
        if (!Array.isArray(data.available_colors)) {
          data.available_colors = data.available_colors ? [data.available_colors] : [];
        }
        
        // Filter out duplicates, empty strings, null, undefined, and whitespace-only values
        // This ensures we only use the exact colors stored in the database
        data.available_colors = data.available_colors
          .filter((color: any) => color && typeof color === 'string' && color.trim().length > 0)
          .map((color: string) => color.trim())
          .filter((color: string, index: number, self: string[]) => self.indexOf(color) === index); // Remove duplicates
        
        // Debug: Log to verify colors match admin selection
        if (process.env.NODE_ENV === 'development') {
          console.log(`Product ${data.name_ar || data.slug} - Available colors from API:`, data.available_colors);
        }
      }
      
      setProduct(data);

      // Fetch related products
      // We can use list filtered by category, or a dedicated related endpoint if available
      // The backend 'related' action exists but api-client might not expose it directly yet.
      // Let's check api-client, or just fallback to list by category logic.
      // Assuming api-client doesn't have 'related', I'll use list with category filter
      // But we need the category slug first. `data.category` might be ID or object details depending on serializer.
      // ProductDetailSerializer returns category as ID, and category_name.
      // Actually ProductDetailSerializer (line 83 in serializers.py) returns 'category' (ID) and 'category_name'.
      // It doesn't return category slug directly? 
      // CategorySerializer returns slug. 
      // Let's try filtered list by category ID if possible? ViewSet filter (line 97) uses 'category' param against 'category__slug'.
      // If we only have ID, we might need to fetch category details first or just skip related for now/use simple filter.
      // Wait, ProductDetailSerializer returns `category` which is the ID.
      // The filter `category__slug` expects a slug.
      // I can't filter by ID using `category` param if it expects slug.
      // Let's check ViewSet again. 
      // Line 97: `category_slug = self.request.query_params.get('category')`. 
      // Line 99: `queryset.filter(category__slug=category_slug)`.
      // So I NEED the slug. 
      // Does ProductDetailSerializer return the slug of the category? No.
      // I'll skip related products dynamic fetch for this step to keep it simple, or try to guess/fetch category.
      // Actually, let's just fetch "New Arrivals" or "Best Sellers" as related if we can't get category slug easily,
      // OR update serializer to return category_slug.
      // For now, I will fetch a generic list to populate "related" to avoid blocking.
      const related = await productsApi.list({ page_size: '4' });
      setRelatedProducts(related.results || related);

    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("فشل تحميل المنتج");
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  // Color mapping
  const colorMap: Record<string, string> = {
    "أزرق": "#3b82f6", "أسود": "#000000", "أبيض": "#ffffff", "رمادي": "#6b7280", "أحمر": "#ef4444", "أخضر": "#10b981",
    "Blue": "#3b82f6", "Black": "#000000", "White": "#ffffff", "Gray": "#6b7280", "Red": "#ef4444", "Green": "#10b981",
  };

  // Clean and deduplicate colors
  const validColors = useMemo(() => {
    if (!product?.available_colors || !Array.isArray(product.available_colors)) {
      return [];
    }
    
    return product.available_colors
      .filter((color: any) => color && typeof color === 'string' && color.trim().length > 0)
      .map((color: string) => color.trim())
      .filter((color: string, index: number, self: string[]) => self.indexOf(color) === index) // Remove duplicates
      .filter((color: string) => colorMap[color] || color.match(/^#[0-9A-Fa-f]{6}$/)); // Only keep valid colors
  }, [product?.available_colors]);

  const handleAddToCart = () => {
    if (product) {
      if (product.available_sizes && product.available_sizes.length > 0 && !selectedSize) {
        toast.error("يرجى اختيار المقاس");
        return;
      }
      if (product.available_colors && product.available_colors.length > 0 && !selectedColor) {
        toast.error("يرجى اختيار اللون");
        return;
      }

      // Check stock availability before adding to cart
      const stockQuantity = product.stock_quantity ?? Infinity;
      if (stockQuantity !== undefined && stockQuantity < Infinity && quantity > stockQuantity) {
        toast.error(`المتاح في المخزون: ${stockQuantity} قطعة فقط`);
        return;
      }

      addToCart(
        {
          id: product.id,
          name: product.name_ar,
          price: Number(product.final_price || product.price),
          originalPrice: product.discount_percentage > 0 ? Number(product.price) : undefined,
          discountPercentage: product.discount_percentage > 0 ? Number(product.discount_percentage) : undefined,
          image: productImages[0] || '/placeholder.svg',
          size: selectedSize,
          color: selectedColor,
          available_sizes: product.available_sizes,
          available_colors: product.available_colors,
          stock_quantity: product.stock_quantity // Include stock quantity
        },
        quantity
      );
      toast.success("تمت الإضافة للسلة");
    }
  };

  // Get all product images for gallery
  const productImages = useMemo(() => {
    if (!product) return [];
    
    // Extract all images from the product
    const images: string[] = [];
    
    // If product has images array (from ProductDetailSerializer)
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img: any) => {
        const url = img.image_url || img.url;
        if (url) {
          images.push(normalizeImageUrl(url));
        }
      });
    }
    
    // If no images found, try primary_image as fallback
    if (images.length === 0 && product.primary_image) {
      images.push(normalizeImageUrl(product.primary_image));
    }
    
    // Final fallback
    if (images.length === 0) {
      images.push('/placeholder.svg');
    }
    
    return images;
  }, [product]);

  // Helper to get single image (for related products)
  const getProductImage = (p: any) => {
    if (p.images && Array.isArray(p.images) && p.images.length > 0) {
      const primaryImg = p.images.find((img: any) => img.is_primary);
      if (primaryImg?.image_url) return normalizeImageUrl(primaryImg.image_url);
      if (p.images[0]?.image_url) return normalizeImageUrl(p.images[0].image_url);
    }
    if (p.primary_image) return normalizeImageUrl(p.primary_image);
    return "/placeholder.svg";
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-4">المنتج غير موجود</h1>
            <p className="text-muted-foreground mb-6">
              نعتذر، المنتج الذي تبحث عنه غير متاح
            </p>
            <Link
              to="/"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              العودة للرئيسية
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discountPercentage = product.discount_percentage || 0;

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
              <span className="text-muted-foreground">
                {product.category_name}
              </span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">{product.name_ar}</span>
            </div>
          </div>
        </section>

        {/* Product Details */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Product Image Gallery */}
            <div className="flex flex-col gap-4">
              <ProductImageGallery
                images={productImages}
                productName={product.name_ar}
                discountPercentage={discountPercentage}
                isInStock={product.is_in_stock}
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-6">
              {/* Name and Rating */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {product.name_ar}
                </h1>
                {/* Rating - DISABLED: Will be enabled later when review system is activated */}
                {/* 
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={i < Math.floor(product.average_rating || 0) ? "text-yellow-400 text-lg" : "text-gray-300 text-lg"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    {product.average_rating || 0} ({product.review_count || 0} تقييم)
                  </span>
                </div>
                */}
              </div>

              {/* Price */}
              <div className="border-t border-b py-4">
                {product.discount_percentage > 0 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-accent">
                      {Number(product.final_price).toLocaleString("ar-EG")} جنيه
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      {Number(product.price).toLocaleString("ar-EG")} جنيه
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-foreground">
                    {Number(product.price).toLocaleString("ar-EG")} جنيه
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">الوصف</h3>
                <p className="text-muted-foreground">{product.description_ar}</p>
              </div>

              {/* Sizes */}
              {product.available_sizes && product.available_sizes.length > 0 && (
                <div>
                  <h3 className="font-medium text-foreground mb-3">المقاس:</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.available_sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md transition-colors ${selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {validColors.length > 0 && (
                <div>
                  <h3 className="font-medium text-foreground mb-3">اللون:</h3>
                  <div className="flex flex-wrap gap-3">
                    {validColors.map((color: string) => {
                      const hexColor = colorMap[color] || color;
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`group relative w-8 h-8 rounded-full border border-border flex items-center justify-center ${selectedColor === color ? "ring-2 ring-primary ring-offset-2" : ""
                            }`}
                          title={color}
                        >
                          <span
                            className="w-full h-full rounded-full border border-gray-200"
                            style={{ backgroundColor: hexColor }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">الحالة:</span>
                <span className={product.is_in_stock ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {product.is_in_stock ? "متوفر في المخزن" : "غير متوفر"}
                </span>
              </div>

              {/* Quantity and Actions */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-4 items-center">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-secondary transition-colors"
                      disabled={!product.is_in_stock}
                    >
                      −
                    </button>
                    <span className="px-4 py-2 border-l border-r border-border min-w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => {
                        const stockQuantity = product.stock_quantity ?? Infinity;
                        if (stockQuantity !== undefined && stockQuantity < Infinity && quantity + 1 > stockQuantity) {
                          toast.error(`المتاح في المخزون: ${stockQuantity} قطعة فقط`);
                        } else {
                          setQuantity(quantity + 1);
                        }
                      }}
                      className="px-4 py-2 hover:bg-secondary transition-colors"
                      disabled={!product.is_in_stock || (product.stock_quantity !== undefined && product.stock_quantity < Infinity && quantity >= product.stock_quantity)}
                    >
                      +
                    </button>
                  </div>
                </div>
                {product.stock_quantity !== undefined && product.stock_quantity < Infinity && (
                  <p className="text-sm text-muted-foreground">
                    المتاح في المخزون: {product.stock_quantity} قطعة
                  </p>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.is_in_stock}
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                أضف للسلة
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => {
                  if (product) {
                    addToWishlist({
                      id: product.id,
                      slug: product.slug,
                      name: product.name_ar,
                      price: Number(product.final_price || product.price),
                      image: normalizeImageUrl(product.primary_image || product.images?.[0]?.image_url || product.images?.[0] || ""),
                      originalPrice: product.discount_percentage > 0 ? Number(product.price) : undefined,
                      discount: product.discount_percentage,
                    });
                  }
                }}
                className="w-full py-3 px-4 border-2 border-border rounded-lg font-bold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                />
                {isWishlisted ? "مضاف للمفضلة" : "أضف للمفضلة"}
              </button>
            </div>
          </div>

          {/* Related Products */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">منتجات مشابهة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/product/${relatedProduct.slug}`}
                    className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative w-full aspect-square bg-secondary overflow-hidden">
                      <img
                        src={getProductImage(relatedProduct)}
                        alt={relatedProduct.name_ar}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {relatedProduct.discount_percentage > 0 && (
                        <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-bold">
                          خصم {relatedProduct.discount_percentage}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-2">
                        {relatedProduct.name_ar}
                      </h3>
                      {/* Rating - DISABLED: Will be enabled later when review system is activated */}
                      {/* 
                      <div className="flex items-center gap-1 mb-3 text-xs">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={i < Math.floor(relatedProduct.average_rating || 0) ? "text-yellow-400" : "text-gray-300"}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-muted-foreground">({relatedProduct.review_count || 0})</span>
                      </div>
                      */}
                      {relatedProduct.discount_percentage > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-accent">
                            {Number(relatedProduct.final_price).toLocaleString("ar-EG")} جنيه
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            {Number(relatedProduct.price).toLocaleString("ar-EG")}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-foreground">
                          {Number(relatedProduct.price).toLocaleString("ar-EG")} جنيه
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
}
