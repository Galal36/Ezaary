import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { sortedGovernorates, getShippingCostByName } from "@/lib/governorates";
import { orders, coupons, products as productsApi, paymentNumbers as paymentNumbersApi } from "@/lib/api-client";
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
import { ShoppingBag, MapPin, User as UserIcon, Phone, Mail, Plus, Minus, CreditCard, Upload, CheckCircle2 } from "lucide-react";

interface UnitSelection {
  unit: number;
  size: string;
  color: string;
}

interface ProductUnits {
  [productId: string]: UnitSelection[];
}

export default function Checkout() {
  const { items, getTotalPrice, clearCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [customAddress, setCustomAddress] = useState("");

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'vodafone_cash' | 'instapay'>('cash_on_delivery');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentNumbers, setPaymentNumbers] = useState<any[]>([]);
  const [screenshotError, setScreenshotError] = useState('');

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
      const deletedProducts: string[] = [];

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
        } catch (error: any) {
          console.error(`Failed to fetch fresh data for product ${item.id}:`, error);

          // Check if product doesn't exist (404 or similar error)
          if (error?.message?.includes('No Product matches') || error?.status === 404) {
            // Product was deleted - remove from cart
            deletedProducts.push(item.name);
            removeFromCart(item.id);
          } else {
            // Other errors - use cart item data as fallback
            productDataMap[item.id] = {
              available_colors: item.available_colors || [],
              available_sizes: item.available_sizes || []
            };
          }
        }
      }

      // Notify user if any products were removed
      if (deletedProducts.length > 0) {
        const productNames = deletedProducts.join('، ');
        toast.error(`تم إزالة المنتجات التالية من السلة لأنها لم تعد متوفرة: ${productNames}`, {
          duration: 5000,
        });
      }

      setFreshProductData(productDataMap);
    };

    if (items.length > 0) {
      fetchFreshProductData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Fetch payment numbers based on selected payment method
  useEffect(() => {
    const fetchPaymentNumbers = async () => {
      if (paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay') {
        try {
          const numbers = await paymentNumbersApi.list(paymentMethod);
          setPaymentNumbers(numbers);
        } catch (error) {
          console.error('Failed to fetch payment numbers:', error);
        }
      }
    };

    fetchPaymentNumbers();
  }, [paymentMethod]);

  // District/Village selection removed - using only governorate for shipping

  // Handle coupon validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError(t('checkout.coupon.errors.required'));
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      // Get all product IDs from the cart
      const productIds = items.map(item => item.id);
      // Use the same total price calculation logic as in the render (with dynamic discounts)
      const totalPrice = items.reduce((total, item) => {
        const { finalPrice } = calculateDynamicDiscount(item);
        return total + finalPrice * item.quantity;
      }, 0);

      // Prepare detailed items payload for smart backend validation
      const itemsPayload = items.map(item => {
        const { finalPrice } = calculateDynamicDiscount(item);
        return {
          id: item.id,
          quantity: item.quantity,
          price: finalPrice
        };
      });

      const result = await coupons.validate(couponCode.trim(), productIds, totalPrice, itemsPayload);

      if (result.valid) {
        setAppliedCoupon(result);
        toast.success(t('checkout.coupon.success').replace('{percentage}', result.discount_percentage.toString()));
      } else {
        setCouponError(t('checkout.coupon.errors.invalid'));
      }
    } catch (error: any) {
      console.error("Coupon validation error:", error);
      setCouponError(error.message || t('checkout.coupon.errors.expired'));
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setScreenshotError('');

    if (!file) {
      setPaymentScreenshot(null);
      return;
    }

    // Validate file type (accept common mobile formats including HEIC/WebP)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|heic|heif)$/i)) {
      setScreenshotError(t('payment.errors.invalidFileType'));
      setPaymentScreenshot(null);
      return;
    }

    // Validate file size (20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setScreenshotError(t('payment.errors.fileTooBig'));
      setPaymentScreenshot(null);
      return;
    }

    setPaymentScreenshot(file);
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

    // Calculate dynamic discount: baseDiscount + 2% if quantity >= 2
    const baseDiscount = item.discountPercentage;
    const additionalDiscount = item.quantity >= 2 ? 2 : 0;
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
      toast.error(t('checkout.errors.quantityInvalid'));
      return;
    }

    // Check stock availability
    const item = items.find((i) => i.id === productId);
    if (item) {
      const stockQuantity = item.stock_quantity ?? Infinity;
      if (stockQuantity !== undefined && stockQuantity < Infinity && newQuantity > stockQuantity) {
        toast.error(t('checkout.errors.stockLimit').replace('{quantity}', stockQuantity.toString()));
        return;
      }
    }

    // Update cart quantity - the useEffect will handle updating productUnits
    updateQuantity(productId, newQuantity);
  };

  const validateForm = () => {
    // Check payment screenshot for manual payment methods
    if (paymentMethod !== 'cash_on_delivery' && !paymentScreenshot) {
      toast.error(t('payment.errors.screenshotRequired'));
      return false;
    }

    // Check required fields
    if (!name.trim()) {
      toast.error(t('checkout.errors.fullNameRequired'));
      return false;
    }

    if (!phone.trim()) {
      toast.error(t('checkout.errors.phoneRequired'));
      return false;
    }

    // Validate Egyptian phone number
    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    if (!phoneRegex.test(phone)) {
      toast.error(t('checkout.errors.phoneInvalid'));
      return false;
    }

    // Governorate is required
    if (!governorate) {
      toast.error(t('checkout.errors.governorateRequired') || 'الرجاء اختيار المحافظة');
      return false;
    }

    if (!detailedAddress.trim() && !customAddress.trim()) {
      toast.error(t('checkout.errors.addressRequired'));
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
          toast.error(t('checkout.errors.sizeRequired').replace('{unit}', (i + 1).toString()).replace('{product}', item.name));
          return false;
        }
        // Only validate color if product has available colors
        if (available_colors && available_colors.length > 0 && !units[i].color) {
          toast.error(t('checkout.errors.colorRequired').replace('{unit}', (i + 1).toString()).replace('{product}', item.name));
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

    // New 3-Tier Zonal Shipping System
    // Tier 1 (Close): 60 EGP
    // Tier 2 (Far): 100 EGP
    // Tier 3 (Very Far): 120 EGP
    const shipping = getShippingCostByName(governorate);

    // Prepare order items with dynamic discounts...
    const orderItems = items.flatMap((item) => {
      const units = productUnits[item.id] || [];
      const { discountPercentage, finalPrice, originalPrice } = calculateDynamicDiscount(item);

      return units.map((unit) => ({
        product: item.id,
        product_name_ar: item.name,
        product_sku: item.id, // Using ID as SKU for now
        selected_size: unit.size || null,
        selected_color: unit.color || null,
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
      governorate: governorate,
      district: district || null,
      village: village || null,
      detailed_address: detailedAddress || customAddress,
      customer_notes: notes || null,
      subtotal: finalSubtotal,
      discount_amount: discountAmount,
      coupon_code: appliedCoupon?.coupon?.code || null,
      shipping_cost: shipping,
      total: finalSubtotal + shipping,
      payment_method: paymentMethod,
      payment_screenshot: paymentScreenshot,
      items: orderItems,
    };

    try {
      // Submit order to backend
      const response = await orders.create(backendOrderData);

      // Show appropriate success message based on payment method
      if (paymentMethod === 'cash_on_delivery') {
        toast.success(t('checkout.success.orderPlaced'));
      } else {
        toast.success(t('payment.successMessage'));
      }

      // Build order confirmation data matching the OrderConfirmation page format
      const confirmationItems = items.map((item) => {
        const units = productUnits[item.id] || [];
        return {
          product_name: item.name,
          units: units.length > 0
            ? units.map((u) => ({ unit: u.unit, size: u.size || "-", color: u.color || "-" }))
            : [{ unit: 1, size: "-", color: "-" }],
        };
      });

      const confirmationData = {
        order_number: response.order_number,
        customer: { name: name.trim() },
        items: confirmationItems,
        subtotal: finalSubtotal,
        shipping,
        total: finalSubtotal + shipping,
      };

      // Clear cart
      clearCart();

      // Navigate to confirmation page with order data
      navigate("/order-confirmation", { state: { orderData: confirmationData } });
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || t('checkout.errors.orderFailed'));
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

  // Calculate shipping cost based on governorate using 3-tier zonal system
  const shipping = governorate ? getShippingCostByName(governorate) : 0;
  const finalTotal = finalSubtotal + shipping;

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('checkout.title')}</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Products & Specifications */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  {t('checkout.productsAndSpecs')}
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
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
                                          {item.quantity >= 2 && item.discountPercentage > 0 ? (
                                            <>
                                              <span>خصم {item.discountPercentage}%</span>
                                              <span className="text-green-600 font-medium">
                                                + (2%، 2 قطع أو أكثر)
                                              </span>
                                            </>
                                          ) : (
                                            <>خصم {dynamicDiscount}%</>
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
                                {t('checkout.availableInStock')}: {item.stock_quantity} {t('checkout.pieces')}
                              </p>
                            )}
                          </div>

                          {/* Promotional Message */}
                          {item.quantity >= 2 && (
                            <div className="mt-3 flex-1 min-w-[200px] bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                              <p className="text-sm text-green-800 font-medium">
                                {t('checkout.promotionalMessage').replace('{percentage}', '2')}
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
                              📦 {t('checkout.unit')} {unit.unit}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Size Selection - Use fresh data from API, fallback to cart item */}
                              {available_sizes && Array.isArray(available_sizes) && available_sizes.length > 0 && (
                                <div>
                                  <Label htmlFor={`size-${item.id}-${idx}`}>
                                    {t('checkout.size')} <span className="text-red-500">*</span>
                                  </Label>
                                  <Select
                                    value={unit.size}
                                    onValueChange={(value) =>
                                      handleUnitChange(item.id, idx, "size", value)
                                    }
                                  >
                                    <SelectTrigger id={`size-${item.id}-${idx}`}>
                                      <SelectValue placeholder={t('checkout.selectSize')} />
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
                                    {t('checkout.color')} <span className="text-red-500">*</span>
                                  </Label>
                                  <Select
                                    value={unit.color}
                                    onValueChange={(value) =>
                                      handleUnitChange(item.id, idx, "color", value)
                                    }
                                  >
                                    <SelectTrigger id={`color-${item.id}-${idx}`}>
                                      <SelectValue placeholder={t('checkout.selectColor')} />
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
                <h2 className="text-xl font-bold text-foreground">{t('checkout.customerInfo')}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    {t('checkout.fullName')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('checkout.fullNamePlaceholder')}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">
                      {t('checkout.phone')} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={t('checkout.phonePlaceholder')}
                        className="pr-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('checkout.phoneExample')}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="email">{t('checkout.email')}</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('checkout.emailPlaceholder')}
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
                <h2 className="text-xl font-bold text-foreground">{t('checkout.shippingAddress')}</h2>
              </div>

              <div className="space-y-4">
                {/* Governorate Selection - Now supports all Egypt */}
                <div>
                  <Label htmlFor="governorate">
                    {t('checkout.governorate')} <span className="text-red-500">*</span>
                  </Label>
                  <Select value={governorate} onValueChange={setGovernorate}>
                    <SelectTrigger id="governorate">
                      <SelectValue placeholder={language === 'ar' ? 'اختر المحافظة' : 'Select Governorate'} />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedGovernorates.map((gov) => (
                        <SelectItem key={gov.id} value={gov.name}>
                          {gov.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {governorate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === 'ar' ? 'تكلفة الشحن:' : 'Shipping cost:'} {getShippingCostByName(governorate)} {language === 'ar' ? 'جنيه' : 'EGP'}
                    </p>
                  )}
                </div>

                {/* District and Village - Commented out for future use */}
                {/* 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="district">
                      {t('checkout.district')}
                    </Label>
                    <Input
                      id="district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder={t('checkout.selectDistrict')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="village">{t('checkout.village')}</Label>
                    <Input
                      id="village"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder={t('checkout.selectVillage')}
                    />
                  </div>
                </div>
                */}

                <div>
                  <Label htmlFor="detailedAddress">
                    {t('checkout.detailedAddress')} <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="detailedAddress"
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    placeholder={t('checkout.detailedAddressPlaceholder')}
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customAddress">
                    {t('checkout.customAddress')}
                  </Label>
                  <Input
                    id="customAddress"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder={t('checkout.customAddressPlaceholder')}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">{t('checkout.notes')}</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('checkout.notesPlaceholder')}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">{t('payment.selectMethod')}</h2>
              </div>

              <div className="space-y-4">
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cash_on_delivery'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className={`${language === 'ar' ? 'mr-3' : 'ml-3'} flex-1`}>
                      <div className="font-medium text-foreground">{t('payment.cashOnDelivery')}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {t('payment.cashOnDeliveryDesc')}
                      </div>
                    </div>
                  </label>

                  {/* Vodafone Cash */}
                  <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'vodafone_cash'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vodafone_cash"
                      checked={paymentMethod === 'vodafone_cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className={`${language === 'ar' ? 'mr-3' : 'ml-3'} flex-1`}>
                      <div className="font-medium text-foreground">{t('payment.vodafoneCash')}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {t('payment.vodafoneCashDesc')}
                      </div>
                    </div>
                  </label>

                  {/* Instapay */}
                  <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'instapay'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="instapay"
                      checked={paymentMethod === 'instapay'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className={`${language === 'ar' ? 'mr-3' : 'ml-3'} flex-1`}>
                      <div className="font-medium text-foreground">{t('payment.instapay')}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {t('payment.instapayDesc')}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Payment Instructions for Manual Methods */}
                {(paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay') && (
                  <div className="mt-6 space-y-4">
                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">{t('payment.instructions')}</h3>
                      <div className="text-sm text-blue-800 space-y-2">
                        <p>
                          {t('payment.transferAmount')
                            .replace('{amount}', `**${finalTotal.toLocaleString(language === 'en' ? 'en-US' : 'ar-EG')} ${language === 'ar' ? 'جنيه' : 'EGP'}**`)
                            .replace('{method}', `**${paymentMethod === 'vodafone_cash' ? t('payment.vodafoneCash') : t('payment.instapay')}**`)
                            .split('**')
                            .map((part, idx) => idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part)}
                        </p>

                        {/* Payment Numbers */}
                        {paymentNumbers.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {paymentNumbers.map((number) => (
                              <div key={number.id} className="flex items-center gap-2 bg-white p-3 rounded border border-blue-300">
                                <span className="font-bold text-blue-900 text-lg">{number.phone_number}</span>
                                {number.account_name && (
                                  <span className="text-sm text-blue-700">({number.account_name})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <p className="mt-3">{t('payment.afterUpload')}</p>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div>
                      <Label htmlFor="paymentScreenshot">
                        {t('payment.uploadScreenshot')} <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-2">
                        <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary">
                          <div className="flex flex-col items-center space-y-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-600 text-center">
                              {paymentScreenshot ? paymentScreenshot.name : t('payment.screenshotHelper')}
                            </span>
                          </div>
                          <input
                            id="paymentScreenshot"
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      {screenshotError && (
                        <p className="text-sm text-red-500 mt-1">{screenshotError}</p>
                      )}
                      {paymentScreenshot && !screenshotError && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{language === 'ar' ? 'تم رفع الملف بنجاح' : 'File uploaded successfully'}</span>
                        </div>
                      )}
                    </div>

                    {/* Confirmation Message */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        {t('payment.confirmationMessage')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {t('checkout.orderSummary')}
              </h2>

              {/* Coupon Section */}
              <div className="mb-6 pb-4 border-b">
                <Label className="text-sm font-medium mb-2 block">{t('checkout.couponCode')}</Label>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      placeholder={t('checkout.couponPlaceholder')}
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
                      {isValidatingCoupon ? "..." : t('checkout.apply')}
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
                      {t('checkout.remove')}
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
                            {item.quantity >= 2 && item.discountPercentage > 0 && (
                              <span className="text-green-600"> (+2%)</span>
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
                      {governorate ? `${shipping} جنيه` : 'اختر المحافظة'}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-bold text-foreground">الإجمالي</span>
                    <span className="text-xl font-bold text-primary">
                      {finalTotal.toLocaleString("ar-EG")} جنيه
                    </span>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                {t('checkout.submitOrder')}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                {t('checkout.agreeTerms')}
              </p>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

