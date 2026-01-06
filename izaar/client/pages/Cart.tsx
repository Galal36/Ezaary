import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">السلة الخاصة بك</h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              حالياً لا توجد منتجات في سلتك. ابدأ التسوق واضف بعض المنتجات المميزة!
            </p>
            <Link
              to="/categories"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              استكشف المنتجات
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  const shipping = totalPrice >= 1200 ? 0 : 25;
  const finalTotal = totalPrice + shipping;

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">السلة الخاصة بك</h1>
          <Link
            to="/categories"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            متابعة التسوق
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-lg shadow-sm p-4 flex flex-col sm:flex-row gap-4"
              >
                {/* Product Image */}
                <div className="w-full sm:w-24 h-24 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">{item.name}</h3>
                    {(item.size || item.color) && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {[item.size, item.color].filter(Boolean).join(" - ")}
                      </p>
                    )}
                    <p className="text-lg font-bold text-primary">
                      {item.price.toLocaleString("ar-EG")} جنيه
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-2 hover:bg-secondary transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 border-l border-r border-border min-w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const stockQuantity = item.stock_quantity ?? Infinity;
                            if (stockQuantity !== undefined && stockQuantity < Infinity && item.quantity + 1 > stockQuantity) {
                              // Toast will be shown by updateQuantity
                              return;
                            }
                            updateQuantity(item.id, item.quantity + 1);
                          }}
                          className="px-3 py-2 hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.stock_quantity !== undefined && item.stock_quantity < Infinity && item.quantity >= item.stock_quantity}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {item.stock_quantity !== undefined && item.stock_quantity < Infinity && (
                      <p className="text-xs text-muted-foreground">
                        المتاح: {item.stock_quantity} قطعة
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  {/* Subtotal */}
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-muted-foreground mb-1">الإجمالي</p>
                    <p className="text-lg font-bold text-foreground">
                      {(item.price * item.quantity).toLocaleString("ar-EG")} جنيه
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-4">ملخص الطلب</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium text-foreground">
                    {totalPrice.toLocaleString("ar-EG")} جنيه
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الشحن</span>
                  <span className="font-medium text-foreground">
                    {shipping === 0 ? (
                      <span className="text-green-600">مجاني</span>
                    ) : (
                      `${shipping.toLocaleString("ar-EG")} جنيه`
                    )}
                  </span>
                </div>
                {totalPrice < 1200 && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    💡 أضف {(1200 - totalPrice).toLocaleString("ar-EG")} جنيه أخرى للحصول على شحن مجاني!
                  </p>
                )}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold text-foreground">الإجمالي</span>
                  <span className="text-xl font-bold text-primary">
                    {finalTotal.toLocaleString("ar-EG")} جنيه
                  </span>
                </div>
              </div>

              <Button asChild className="w-full mb-3" size="lg">
                <Link to="/checkout">إتمام الطلب</Link>
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
              >
                تفريغ السلة
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
