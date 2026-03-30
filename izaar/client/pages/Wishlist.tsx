import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { normalizeImageUrl } from "@/lib/data-mappers";

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">قائمة أمنياتك</h1>

          {items.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-4">قائمة أمنياتك فارغة</h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  لم تضف أي منتجات إلى قائمة أمنياتك حتى الآن. أضف منتجاتك المفضلة وعد إليها لاحقاً!
                </p>
                <Link
                  to="/categories"
                  className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                >
                  استكشف المنتجات
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Image */}
                  <Link to={`/product/${item.slug}`}>
                    <div className="relative w-full aspect-square bg-secondary overflow-hidden">
                      <img
                        src={normalizeImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      {item.discount && item.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-bold">
                          خصم {item.discount}%
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/product/${item.slug}`}>
                      <h3 className="font-medium text-sm md:text-base text-foreground line-clamp-2 mb-2 hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Price */}
                    <div className="mb-4">
                      {item.originalPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg md:text-xl font-bold text-accent">
                            {item.price.toLocaleString("ar-EG")} جنيه
                          </span>
                          <span className="text-xs md:text-sm text-muted-foreground line-through">
                            {item.originalPrice.toLocaleString("ar-EG")} جنيه
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg md:text-xl font-bold text-foreground">
                          {item.price.toLocaleString("ar-EG")} جنيه
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        أضف للسلة
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                        title="حذف من المفضلة"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
