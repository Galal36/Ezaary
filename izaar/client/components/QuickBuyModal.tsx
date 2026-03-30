import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { orders, shipping as shippingApi, paymentNumbers as paymentNumbersApi } from "@/lib/api-client";
import { sortedGovernorates, getShippingCostByName } from "@/lib/governorates";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { normalizeImageUrl } from "@/lib/data-mappers";

export interface QuickBuyProduct {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  price: number;
  final_price: number;
  discount_percentage: number;
  primary_image?: string;
  images?: any[];
  available_sizes?: string[];
  available_colors?: string[];
  stock_quantity?: number;
}

interface QuickBuyModalProps {
  product: QuickBuyProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickBuyModal({ product, isOpen, onClose }: QuickBuyModalProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "vodafone_cash" | "instapay">("cash_on_delivery");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentNumbers, setPaymentNumbers] = useState<any[]>([]);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setPhone("");
      setGovernorate("");
      setDetailedAddress("");
      setPaymentMethod("cash_on_delivery");
      setPaymentScreenshot(null);
      setSelectedSize("");
      setSelectedColor("");
      setErrors({});
      setPaymentNumbers([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchNumbers = async () => {
      if (paymentMethod === "vodafone_cash" || paymentMethod === "instapay") {
        try {
          const nums = await paymentNumbersApi.list(paymentMethod);
          setPaymentNumbers(nums);
        } catch (err) {
          console.error("Failed to fetch payment numbers:", err);
        }
      } else {
        setPaymentNumbers([]);
      }
    };
    fetchNumbers();
  }, [paymentMethod]);

  if (!product) return null;

  const productName = language === "en" ? (product.name_en || product.name_ar) : product.name_ar;
  const sizes = (product.available_sizes || []).filter(Boolean);
  const colors = (product.available_colors || []).filter(Boolean);
  const unitPrice = Number(product.price);
  const finalPrice = Number(product.final_price) || unitPrice;
  const discountPct = product.discount_percentage || 0;

  const productImage = (() => {
    if (product.primary_image) return normalizeImageUrl(product.primary_image);
    if (product.images?.length) {
      const first = product.images[0];
      return normalizeImageUrl(first.image_url || first.url || first);
    }
    return "/placeholder-product.jpg";
  })();

  const shippingCost = governorate ? getShippingCostByName(governorate) : 0;
  const total = finalPrice + shippingCost;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "الاسم مطلوب";
    if (!phone.trim()) e.phone = "رقم الهاتف مطلوب";
    else if (!/^01[0-9]{9}$/.test(phone.trim())) e.phone = "رقم هاتف غير صحيح";
    if (!governorate) e.governorate = "المحافظة مطلوبة";
    if (!detailedAddress.trim()) e.detailedAddress = "العنوان التفصيلي مطلوب";
    if (sizes.length > 0 && !selectedSize) e.size = "اختر المقاس";
    if (colors.length > 0 && !selectedColor) e.color = "اختر اللون";
    if ((paymentMethod === "vodafone_cash" || paymentMethod === "instapay") && !paymentScreenshot) {
      e.screenshot = "صورة إيصال الدفع مطلوبة";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const orderData: any = {
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        governorate,
        detailed_address: detailedAddress.trim(),
        subtotal: finalPrice,
        discount_amount: 0,
        shipping_cost: shippingCost,
        total,
        payment_method: paymentMethod,
        items: [
          {
            product: product.id,
            product_name_ar: product.name_ar,
            selected_size: selectedSize || null,
            selected_color: selectedColor || null,
            quantity: 1,
            unit_price: unitPrice,
            discount_percentage: discountPct,
            final_unit_price: finalPrice,
            subtotal: finalPrice,
          },
        ],
      };

      if (paymentScreenshot) {
        orderData.payment_screenshot = paymentScreenshot;
      }

      const response = await orders.create(orderData);

      toast.success(language === "en" ? "Order placed successfully!" : "تم استلام طلبك بنجاح!");
      onClose();

      navigate("/order-confirmation", {
        state: {
          orderData: {
            order_number: response.order_number,
            customer: { name: name.trim() },
            items: [
              {
                product_name: product.name_ar,
                units: [
                  {
                    unit: 1,
                    size: selectedSize || "-",
                    color: selectedColor || "-",
                  },
                ],
              },
            ],
            subtotal: finalPrice,
            shipping: shippingCost,
            total,
          },
        },
      });
    } catch (error: any) {
      console.error("Quick buy error:", error);
      toast.error(error.message || (language === "en" ? "Failed to place order" : "فشل إنشاء الطلب"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">
            {language === "en" ? "Quick Buy" : "شراء سريع"}
          </DialogTitle>
          <DialogDescription className="text-right">
            {language === "en" ? "Fill in your details to order" : "أدخل بياناتك لإتمام الطلب"}
          </DialogDescription>
        </DialogHeader>

        {/* Product Summary */}
        <div className="flex gap-3 items-center p-3 bg-secondary rounded-lg">
          <img
            src={productImage}
            alt={productName}
            className="w-16 h-16 object-cover rounded-md"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{productName}</p>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold">{finalPrice} {language === "en" ? "EGP" : "جنيه"}</span>
              {discountPct > 0 && (
                <span className="text-muted-foreground line-through text-xs">{unitPrice}</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Size & Color */}
          {sizes.length > 0 && (
            <div>
              <Label className="text-right block mb-1">{language === "en" ? "Size" : "المقاس"}</Label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${
                      selectedSize === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {errors.size && <p className="text-destructive text-xs mt-1">{errors.size}</p>}
            </div>
          )}

          {colors.length > 0 && (
            <div>
              <Label className="text-right block mb-1">{language === "en" ? "Color" : "اللون"}</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${
                      selectedColor === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {errors.color && <p className="text-destructive text-xs mt-1">{errors.color}</p>}
            </div>
          )}

          {/* Customer Info */}
          <div>
            <Label htmlFor="qb-name" className="text-right block mb-1">{language === "en" ? "Full Name" : "الاسم الكامل"}</Label>
            <Input id="qb-name" value={name} onChange={(e) => setName(e.target.value)} dir="rtl" />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="qb-phone" className="text-right block mb-1">{language === "en" ? "Phone Number" : "رقم الهاتف"}</Label>
            <Input id="qb-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" dir="ltr" />
            {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <Label className="text-right block mb-1">{language === "en" ? "Governorate" : "المحافظة"}</Label>
            <Select value={governorate} onValueChange={setGovernorate}>
              <SelectTrigger>
                <SelectValue placeholder={language === "en" ? "Choose governorate" : "اختر المحافظة"} />
              </SelectTrigger>
              <SelectContent>
                {sortedGovernorates.map((g) => (
                  <SelectItem key={g.id} value={g.name}>
                    {g.name} ({g.shippingCost} {language === "en" ? "EGP" : "جنيه"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.governorate && <p className="text-destructive text-xs mt-1">{errors.governorate}</p>}
          </div>

          <div>
            <Label htmlFor="qb-address" className="text-right block mb-1">{language === "en" ? "Detailed Address" : "العنوان التفصيلي"}</Label>
            <Textarea id="qb-address" value={detailedAddress} onChange={(e) => setDetailedAddress(e.target.value)} dir="rtl" rows={2} />
            {errors.detailedAddress && <p className="text-destructive text-xs mt-1">{errors.detailedAddress}</p>}
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-right block mb-1">{language === "en" ? "Payment Method" : "طريقة الدفع"}</Label>
            <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash_on_delivery">{language === "en" ? "Cash on Delivery" : "الدفع عند الاستلام"}</SelectItem>
                <SelectItem value="vodafone_cash">{language === "en" ? "Vodafone Cash" : "فودافون كاش"}</SelectItem>
                <SelectItem value="instapay">{language === "en" ? "InstaPay" : "انستاباي"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Numbers & Screenshot */}
          {(paymentMethod === "vodafone_cash" || paymentMethod === "instapay") && (
            <div className="space-y-3">
              {paymentNumbers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold mb-1">
                    {language === "en" ? "Transfer to:" : "حوّل على:"}
                  </p>
                  {paymentNumbers.map((pn: any) => (
                    <p key={pn.id} className="font-mono">{pn.phone_number} {pn.account_name && `(${pn.account_name})`}</p>
                  ))}
                </div>
              )}
              <div>
                <Label className="text-right block mb-1">
                  {language === "en" ? "Payment Screenshot" : "صورة إيصال الدفع"}
                </Label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-3 cursor-pointer hover:border-primary transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">
                    {paymentScreenshot ? paymentScreenshot.name : (language === "en" ? "Upload screenshot" : "اختر الصورة")}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPaymentScreenshot(file);
                    }}
                  />
                </label>
                {errors.screenshot && <p className="text-destructive text-xs mt-1">{errors.screenshot}</p>}
              </div>
            </div>
          )}

          {/* Order Summary */}
          {governorate && (
            <div className="bg-secondary rounded-lg p-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === "en" ? "Price" : "السعر"}</span>
                <span>{finalPrice} {language === "en" ? "EGP" : "جنيه"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === "en" ? "Shipping" : "الشحن"}</span>
                <span>{shippingCost} {language === "en" ? "EGP" : "جنيه"}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>{language === "en" ? "Total" : "الإجمالي"}</span>
                <span className="text-primary">{total} {language === "en" ? "EGP" : "جنيه"}</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                {language === "en" ? "Placing order..." : "جاري إنشاء الطلب..."}
              </>
            ) : (
              language === "en" ? "Confirm Order" : "تأكيد الطلب"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
