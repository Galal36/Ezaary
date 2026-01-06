import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { assiutDistricts } from "@/lib/assiut-data";
import { orders, coupons, products as productsApi } from "@/lib/api-client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ShoppingBag, MapPin, User as UserIcon, Phone, Mail, Plus, Minus } from "lucide-react";

interface UnitSelection {
  unit: number;
  size: string;
  color: string;
}

interface ProductUnits {
  [productId: string]: UnitSelection[];
}

export default function Checkout() {
  const { items, getTotalPrice, clearCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [customAddress, setCustomAddress] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Product units selections
  const [productUnits, setProductUnits] = useState<ProductUnits>({});
  
  // Fresh product data from API (to get latest available_colors and available_sizes)
  const [freshProductData, setFreshProductData] = useState<Record<string, { available_colors?: string[], available_sizes?: string[] }>>({});

  // Initialize product units - update when items or quantities change
  useEffect(() => {
    setProductUnits((prev) => {
      const newUnits: ProductUnits = {};
      items.forEach((item) => {
        const existingUnits = prev[item.id] || [];
        const currentQuantity = existingUnits.length;
        
        if (item.quantity > currentQuantity) {
          // Add new units if quantity increased
          const newUnitsToAdd = Array.from({ length: item.quantity - currentQuantity }, (_, i) => ({
            unit: currentQuantity + i + 1,
            size: item.size || "",
            color: item.color || "",
          }));
          newUnits[item.id] = [...existingUnits, ...newUnitsToAdd];
        } else if (item.quantity < currentQuantity) {
          // Remove units if quantity decreased
          newUnits[item.id] = existingUnits.slice(0, item.quantity);
        } else {
          // Keep existing units if quantity unchanged
          newUnits[item.id] = existingUnits;
        }
        
        // Initialize if no existing units
        if (!prev[item.id] && item.quantity > 0) {
          newUnits[item.id] = Array.from({ length: item.quantity }, (_, i) => ({
            unit: i + 1,
            size: item.size || "",
            color: item.color || "",
          }));
        }
      });
      return newUnits;
    });
  }, [items]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  // Fetch fresh product data from API to get latest available_colors and available_sizes
  useEffect(() => {
    const fetchFreshProductData = async () => {
      const productDataMap: Record<string, { available_colors?: string[], available_sizes?: string[] }> = {};
      
      // Fetch fresh data for each product in cart
      for (const item of items) {
        try {
          // Fetch product by ID (UUID)
          const product = await productsApi.get(item.id);
          
          if (product) {
            // Clean and store the fresh data
            productDataMap[item.id] = {
              available_colors: Array.isArray(product.available_colors) 
                ? product.available_colors
                  .filter((color: any) => color && typeof color === 'string' && color.trim().length > 0)
                  .map((color: string) => color.trim())
                  .filter((color: string, index: number, self: string[]) => self.indexOf(color) === index)
                : [],
              available_sizes: Array.isArray(product.available_sizes) 
                ? product.available_sizes
                  .filter((size: any) => size && typeof size === 'string' && size.trim().length > 0)
                  .map((size: string) => size.trim())
                  .filter((size: string, index: number, self: string[]) => self.indexOf(size) === index)
                : []
            };
          }
        } catch (error) {
          console.error(`Failed to fetch fresh data for product ${item.id}:`, error);
          // If fetch fails, keep using cart item data as fallback
          productDataMap[item.id] = {
            available_colors: item.available_colors || [],
            available_sizes: item.available_sizes || []
          };
        }
      }
      
      setFreshProductData(productDataMap);
    };

    if (items.length > 0) {
      fetchFreshProductData();
    }
  }, [items]);

  const selectedDistrict = assiutDistricts.find((d) => d.id === district);

  // Handle coupon validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("الرجاء إدخال كود الكوبون");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      // Get first product ID if available (for product-specific coupons)
      const firstProductId = items.length > 0 ? items[0].id : undefined;
      const totalPrice = getTotalPrice();

      const result = await coupons.validate(couponCode.trim(), firstProductId, totalPrice);
      
      if (result.valid) {
        setAppliedCoupon(result);
        toast.success(`تم تطبيق الكوبون بنجاح! خصم ${result.discount_percentage}%`);
      } else {
        setCouponError("كود الكوبون غير صحيح");
      }
    } catch (error: any) {
      console.error("Coupon validation error:", error);
      setCouponError(error.message || "كود الكوبون غير صحيح أو منتهي الصلاحية");
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleUnitChange = (
    productId: string,
    unitIndex: number,
    field: "size" | "color",
    value: string
  ) => {
    setProductUnits((prev) => ({
      ...prev,
      [productId]: prev[productId].map((unit, idx) =>
        idx === unitIndex ? { ...unit, [field]: value } : unit
      ),
    }));
  };

  // Calculate dynamic discount based on quantity
  // Only applies to products that already have a base discount
  const calculateDynamicDiscount = (item: typeof items[0]) => {
    // If product has no base discount, return original values
    if (!item.discountPercentage || item.discountPercentage <= 0) {
      return {
        discountPercentage: 0,
        finalPrice: item.originalPrice || item.price,
        originalPrice: item.originalPrice || item.price,
      };
    }
    
    // Calculate dynamic discount: baseDiscount + (quantity - 1) * 2%
    const baseDiscount = item.discountPercentage;
    const additionalDiscount = (item.quantity - 1) * 2;
    const dynamicDiscount = baseDiscount + additionalDiscount;
    
    // Calculate final price from original price
    const originalPrice = item.originalPrice || item.price;
    const finalPrice = originalPrice * (1 - dynamicDiscount / 100);
    
    return {
      discountPercentage: dynamicDiscount,
      finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimals
      originalPrice: originalPrice,
    };
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      toast.error("الكمية يجب أن تكون أكبر من صفر");
      return;
    }
    
    // Check stock availability
    const item = items.find((i) => i.id === productId);
    if (item) {
      const stockQuantity = item.stock_quantity ?? Infinity;
      if (stockQuantity !== undefined && stockQuantity < Infinity && newQuantity > stockQuantity) {
        toast.error(`المتاح في المخزون: ${stockQuantity} قطعة فقط`);
        return;
      }
    }
    
    // Update cart quantity
    updateQuantity(productId, newQuantity);
    
    // Update productUnits to match new quantity
    setProductUnits((prev) => {
      const currentUnits = prev[productId] || [];
      const currentQuantity = currentUnits.length;
      
      if (newQuantity > currentQuantity) {
        // Add new units
        const item = items.find((i) => i.id === productId);
        const newUnits = Array.from({ length: newQuantity - currentQuantity }, (_, i) => ({
          unit: currentQuantity + i + 1,
          size: item?.size || "",
          color: item?.color || "",
        }));
        return {
          ...prev,
          [productId]: [...currentUnits, ...newUnits],
        };
      } else if (newQuantity < currentQuantity) {
        // Remove units
        return {
          ...prev,
          [productId]: currentUnits.slice(0, newQuantity),
        };
      }
      
      return prev;
    });
  };

  const validateForm = () => {
    // Check required fields
    if (!name.trim()) {
      toast.error("الرجاء إدخال الاسم الكامل");
      return false;
    }

    if (!phone.trim()) {
      toast.error("الرجاء إدخال رقم الهاتف");
      return false;
    }

    // Validate Egyptian phone number
    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("رقم الهاتف غير صحيح. يجب أن يبدأ بـ 010، 011، 012، أو 015");
      return false;
    }

    // District is now optional
    /* 
    if (!district) {
      toast.error("الرجاء اختيار المركز");
      return false;
    }
    */

    if (!detailedAddress.trim() && !customAddress.trim()) {
      toast.error("الرجاء إدخال العنوان التفصيلي");
      return false;
    }

    // Check all units have size and color (only if product has those options)
    for (const item of items) {
      const units = productUnits[item.id] || [];
      // Use fresh data if available, otherwise fallback to cart item data
      const freshData = freshProductData[item.id];
      const available_colors = freshData?.available_colors || item.available_colors || [];
      const available_sizes = freshData?.available_sizes || item.available_sizes || [];
      
      for (let i = 0; i < units.length; i++) {
        // Only validate size if product has available sizes
        if (available_sizes && available_sizes.length > 0 && !units[i].size) {
          toast.error(`الرجاء اختيار المقاس للوحدة ${i + 1} من ${item.name}`);
          return false;
        }
        // Only validate color if product has available colors
        if (available_colors && available_colors.length > 0 && !units[i].color) {
          toast.error(`الرجاء اختيار اللون للوحدة ${i + 1} من ${item.name}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Calculate total price with dynamic discounts
    const totalPrice = items.reduce((total, item) => {
      const { finalPrice } = calculateDynamicDiscount(item);
      return total + finalPrice * item.quantity;
    }, 0);
    
    // Apply coupon discount if available
    let discountAmount = 0;
    let finalSubtotal = totalPrice;
    if (appliedCoupon) {
      discountAmount = appliedCoupon.discount_amount || 0;
      finalSubtotal = appliedCoupon.final_amount || totalPrice;
    }
    
    // Dynamic shipping logic
    // Default (City/No District): 25
    // District selected: 35
    // Village selected: 50
    // Free shipping if order total >= 1200
    let shipping = 25;
    if (village) {
      shipping = 50;
    } else if (district) {
      shipping = 35;
    }
    
    // Apply free shipping if order total is 1200 or more
    if (finalSubtotal >= 1200) {
      shipping = 0;
    }

    // Prepare order items with dynamic discounts...
    const orderItems = items.flatMap((item) => {
      const units = productUnits[item.id] || [];
      const { discountPercentage, finalPrice, originalPrice } = calculateDynamicDiscount(item);
      
      return units.map((unit) => ({
        product: item.id,
        product_name_ar: item.name,
        product_sku: item.id, // Using ID as SKU for now
        selected_size: unit.size,
        selected_color: unit.color,
        quantity: 1, // Each unit is quantity 1
        unit_price: originalPrice,
        discount_percentage: discountPercentage,
        final_unit_price: finalPrice,
        subtotal: finalPrice,
      }));
    });

    // Prepare backend order format
    const backendOrderData = {
      customer_name: name,
      customer_phone: phone,
      customer_email: email || null,
      governorate: "أسيوط",
      district: selectedDistrict?.name || district || "مدينة أسيوط",
      village: village || "",
      detailed_address: detailedAddress || customAddress,
      customer_notes: notes || "",
      subtotal: finalSubtotal,
      discount_amount: discountAmount,
      coupon_code: appliedCoupon?.coupon?.code || null,
      shipping_cost: shipping,
      total: finalSubtotal + shipping,
      items: orderItems,
    };

    try {
      // Submit order to backend
      const response = await orders.create(backendOrderData);

      toast.success("تم إرسال طلبك بنجاح!");

      // Clear cart
      clearCart();

      // Navigate to confirmation page with order number
      navigate(`/order-confirmation?orderNumber=${response.order_number}`);
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى.");
    }
  };

  if (items.length === 0) {
    return null;
  }

  // Calculate total price with dynamic discounts
  const totalPrice = items.reduce((total, item) => {
    const { finalPrice } = calculateDynamicDiscount(item);
    return total + finalPrice * item.quantity;
  }, 0);

  // Apply coupon discount if available
  let discountAmount = 0;
  let finalSubtotal = totalPrice;
  if (appliedCoupon) {
    discountAmount = appliedCoupon.discount_amount || 0;
    finalSubtotal = appliedCoupon.final_amount || totalPrice;
  }

  // Calculate shipping cost based on selection
  // Default (City/No District): 25
  // District selected: 35
  // Village selected: 50
  // Free shipping if order total >= 1200
  let shipping = 25;
  if (village) {
    shipping = 50;
  } else if (district) {
    shipping = 35;
  }
  
  // Apply free shipping if order total is 1200 or more
  if (finalSubtotal >= 1200) {
    shipping = 0;
  }

  const finalTotal = finalSubtotal + shipping;

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">إتمام الطلب</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Products & Specifications */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  المنتجات والمواصفات
                </h2>
              </div>

              <div className="space-y-6">
                {items.map((item) => {
                  // Use fresh product data from API if available, otherwise fallback to cart item data
                  const freshData = freshProductData[item.id];
                  const available_colors = freshData?.available_colors || item.available_colors || [];
                  const available_sizes = freshData?.available_sizes || item.available_sizes || [];
                  
                  // Debug: Log to verify we're using fresh data
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Checkout - Product: ${item.name}`, {
                      id: item.id,
                      cart_colors: item.available_colors,
                      fresh_colors: freshData?.available_colors,
                      using_colors: available_colors,
                      cart_sizes: item.available_sizes,
                      fresh_sizes: freshData?.available_sizes,
                      using_sizes: available_sizes
                    });
                  }
                  
                  return (
                  <div key={item.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{item.name}</h3>
                        {(() => {
                          const { discountPercentage: dynamicDiscount, finalPrice: dynamicFinalPrice, originalPrice: dynamicOriginalPrice } = calculateDynamicDiscount(item);
                          return (
                            <>
                              <div className="flex items-center gap-2 flex-wrap">
                                {dynamicOriginalPrice && dynamicOriginalPrice > dynamicFinalPrice ? (
                                  <>
                                    <p className="text-sm text-muted-foreground line-through">
                                      {dynamicOriginalPrice.toLocaleString("ar-EG")} جنيه
                                    </p>
                                    <p className="text-sm font-bold text-primary">
                                      {dynamicFinalPrice.toLocaleString("ar-EG")} جنيه
                                    </p>
                                    {dynamicDiscount > 0 && (
                                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                        خصم {dynamicDiscount}%
                                        {item.quantity > 1 && item.discountPercentage > 0 && (
                                          <span className="text-green-600 mr-1">
                                            {" "}(+{((item.quantity - 1) * 2)}%)
                                          </span>
                                        )}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    {dynamicFinalPrice.toLocaleString("ar-EG")} جنيه
                                  </p>
                                )}
                                <span className="text-sm text-muted-foreground">× {item.quantity}</span>
                              </div>
                              <p className="text-sm font-medium text-foreground mt-1">
                                الإجمالي: {(dynamicFinalPrice * item.quantity).toLocaleString("ar-EG")} جنيه
                                {dynamicOriginalPrice && dynamicOriginalPrice > dynamicFinalPrice && (
                                  <span className="text-muted-foreground line-through mr-2">
                                    (كان {(dynamicOriginalPrice * item.quantity).toLocaleString("ar-EG")} جنيه)
                                  </span>
                                )}
                              </p>
                            </>
                          );
                        })()}
                        
                        {/* Quantity Selector */}
                        <div className="mt-3 flex flex-col gap-2">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="px-3 py-2 hover:bg-gray-100 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4 text-gray-700" />
                              </button>
                              <div className="px-4 py-2 min-w-[3rem] text-center font-medium border-x border-gray-300 bg-white">
                                {item.quantity}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="px-3 py-2 hover:bg-gray-100 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.stock_quantity !== undefined && item.stock_quantity < Infinity && item.quantity >= item.stock_quantity}
                              >
                                <Plus className="w-4 h-4 text-gray-700" />
                              </button>
                            </div>
                          </div>
                          {item.stock_quantity !== undefined && item.stock_quantity < Infinity && (
                            <p className="text-xs text-muted-foreground">
                              المتاح في المخزون: {item.stock_quantity} قطعة
                            </p>
                          )}
                        </div>
                        
                        {/* Promotional Message */}
                        {item.quantity >= 2 && (
                          <div className="mt-3 flex-1 min-w-[200px] bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <p className="text-sm text-green-800 font-medium">
                              🎉 زد عدد القطع واحصل علي عرض خاص بداية من {item.quantity} قطع
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {productUnits[item.id]?.map((unit, idx) => (
                        <div
                          key={idx}
                          className="bg-secondary/30 rounded-lg p-4 space-y-3"
                        >
                          <p className="font-medium text-sm text-foreground">
                            📦 الوحدة {unit.unit}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Size Selection - Use fresh data from API, fallback to cart item */}
                            {available_sizes && Array.isArray(available_sizes) && available_sizes.length > 0 && (
                              <div>
                                <Label htmlFor={`size-${item.id}-${idx}`}>
                                  المقاس <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={unit.size}
                                  onValueChange={(value) =>
                                    handleUnitChange(item.id, idx, "size", value)
                                  }
                                >
                                  <SelectTrigger id={`size-${item.id}-${idx}`}>
                                    <SelectValue placeholder="اختر المقاس" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {/* Only show product-specific sizes from fresh API data */}
                                    {available_sizes.map((size) => (
                                      <SelectItem key={size} value={size}>
                                        {size}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Color Selection - Use fresh data from API, fallback to cart item */}
                            {available_colors && Array.isArray(available_colors) && available_colors.length > 0 && (
                              <div>
                                <Label htmlFor={`color-${item.id}-${idx}`}>
                                  اللون <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={unit.color}
                                  onValueChange={(value) =>
                                    handleUnitChange(item.id, idx, "color", value)
                                  }
                                >
                                  <SelectTrigger id={`color-${item.id}-${idx}`}>
                                    <SelectValue placeholder="اختر اللون" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {/* Only show product-specific colors from fresh API data */}
                                    {available_colors.map((color) => (
                                      <SelectItem key={color} value={color}>
                                        {color}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <UserIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">بيانات العميل</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">
                      رقم الهاتف <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01012345678"
                        className="pr-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      مثال: 01012345678
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="pr-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">عنوان الشحن</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="governorate">المحافظة</Label>
                  <Input
                    id="governorate"
                    value="أسيوط"
                    disabled
                    className="bg-secondary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="district">
                      المركز (اختياري)
                    </Label>
                    <Select value={district} onValueChange={setDistrict}>
                      <SelectTrigger id="district">
                        <SelectValue placeholder="اختر المركز" />
                      </SelectTrigger>
                      <SelectContent>
                        {assiutDistricts.map((dist) => (
                          <SelectItem key={dist.id} value={dist.id}>
                            {dist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="village">القرية (اختياري)</Label>
                    <Select
                      value={village}
                      onValueChange={setVillage}
                      disabled={!district}
                    >
                      <SelectTrigger id="village">
                        <SelectValue placeholder="اختر القرية" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDistrict?.villages.map((vil) => (
                          <SelectItem key={vil} value={vil}>
                            {vil}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="detailedAddress">
                    العنوان التفصيلي <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="detailedAddress"
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    placeholder="اسم الشارع، رقم العمارة، رقم الشقة، علامات مميزة..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customAddress">
                    عنوان إضافي (إذا كان المركز أو القرية غير موجودة في القائمة)
                  </Label>
                  <Input
                    id="customAddress"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="اكتب العنوان الكامل هنا..."
                  />
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي ملاحظات خاصة بالطلب..."
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-4">
                ملخص الطلب
              </h2>

              {/* Coupon Section */}
              <div className="mb-6 pb-4 border-b">
                <Label className="text-sm font-medium mb-2 block">كود الكوبون</Label>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      placeholder="أدخل كود الكوبون"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="whitespace-nowrap"
                    >
                      {isValidatingCoupon ? "..." : "تطبيق"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        {appliedCoupon.coupon.code}
                      </p>
                      <p className="text-xs text-green-600">
                        خصم {appliedCoupon.discount_percentage}%
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-red-500 hover:text-red-700"
                    >
                      إزالة
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-red-500 mt-1">{couponError}</p>
                )}
              </div>

              <div className="space-y-3 mb-4">
                {items.map((item) => {
                  const { discountPercentage: dynamicDiscount, finalPrice: dynamicFinalPrice, originalPrice: dynamicOriginalPrice } = calculateDynamicDiscount(item);
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">
                          {item.name} × {item.quantity}
                        </span>
                        {dynamicDiscount > 0 && (
                          <span className="text-xs text-red-600">
                            خصم {dynamicDiscount}%
                            {item.quantity > 1 && item.discountPercentage > 0 && (
                              <span className="text-green-600"> (+{((item.quantity - 1) * 2)}%)</span>
                            )}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {dynamicOriginalPrice && dynamicOriginalPrice > dynamicFinalPrice ? (
                          <>
                            <div className="line-through text-muted-foreground text-xs">
                              {(dynamicOriginalPrice * item.quantity).toLocaleString("ar-EG")} جنيه
                            </div>
                            <div className="font-medium text-primary">
                              {(dynamicFinalPrice * item.quantity).toLocaleString("ar-EG")} جنيه
                            </div>
                          </>
                        ) : (
                          <span className="font-medium text-foreground">
                            {(dynamicFinalPrice * item.quantity).toLocaleString("ar-EG")} جنيه
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-medium text-foreground">
                      {totalPrice.toLocaleString("ar-EG")} جنيه
                    </span>
                  </div>
                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        خصم ({appliedCoupon.coupon.code})
                      </span>
                      <span className="font-medium text-green-600">
                        -{discountAmount.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} جنيه
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الشحن</span>
                    <span className="font-medium text-foreground">
                      {shipping === 0 ? (
                        <span className="text-green-600 font-bold">مجاني 🎉</span>
                      ) : (
                        `${shipping} جنيه`
                      )}
                    </span>
                  </div>
                  {shipping > 0 && finalSubtotal < 1200 && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        💡 أضف {(1200 - finalSubtotal).toLocaleString("ar-EG")} جنيه أخرى للحصول على شحن مجاني!
                      </p>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-bold text-foreground">الإجمالي</span>
                    <span className="text-xl font-bold text-primary">
                      {finalTotal.toLocaleString("ar-EG")} جنيه
                    </span>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                إرسال الطلب
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                بالضغط على "إرسال الطلب" فإنك توافق على شروط وأحكام المتجر
              </p>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

