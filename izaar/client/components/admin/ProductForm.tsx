import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { products, categories, coupons } from "@/lib/api-client";
import { AdminProduct } from "@/lib/admin-mock-data";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Upload, Trash2 } from "lucide-react";

interface ProductFormProps {
  product?: AdminProduct | null;
  onClose: () => void;
}

const sizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
const colors = [
  { name: "أزرق", hex: "#3b82f6" },
  { name: "أسود", hex: "#000000" },
  { name: "أبيض", hex: "#ffffff" },
  { name: "رمادي", hex: "#6b7280" },
  { name: "أحمر", hex: "#ef4444" },
  { name: "أخضر", hex: "#10b981" },
  // Existing (already in DB in some products)
  { name: "كحلي", hex: "#1e3a8a" },
  { name: "بيج", hex: "#d6c7a1" },
  // New colors
  { name: "برجاندي", hex: "#800020" },
  { name: "بني", hex: "#8B4513" },
  { name: "زيتي", hex: "#556B2F" },
];

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    product?.available_sizes || product?.sizes || []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(() => {
    const colors = product?.available_colors || product?.colors;
    // Ensure it's always an array
    if (Array.isArray(colors)) {
      return colors;
    }
    return colors ? [colors] : [];
  });
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productCoupons, setProductCoupons] = useState<any[]>([]);
  const [allCoupons, setAllCoupons] = useState<any[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [isLoadingAllCoupons, setIsLoadingAllCoupons] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState(0);
  const [newCouponValidFrom, setNewCouponValidFrom] = useState("");
  const [newCouponValidTo, setNewCouponValidTo] = useState("");
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [selectedExistingCoupon, setSelectedExistingCoupon] = useState<string>("");
  const [pendingCouponLink, setPendingCouponLink] = useState<string | null>(null); // For new products

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: product?.name || "",
      name_en: product?.name_en || "",
      description: product?.description || "",
      description_en: product?.description_en || "",
      categoryId: product?.categoryId || "",
      sku: product?.sku || "",
      slug: product?.slug || "",
      price: product?.price || 0,
      discountPercentage: product?.discountPercentage || 0,
      inStock: product?.inStock !== undefined ? product.inStock : true,
      quantity: product?.quantity || 0,
    },
  });

  useEffect(() => {
    loadCategories();
    loadAllCoupons(); // Load all coupons for reuse option
    if (product?.id) {
      loadCoupons();
      // Clear pending coupon link when editing existing product
      setPendingCouponLink(null);
    } else {
      // Clear pending coupon link when switching to new product
      setPendingCouponLink(null);
      setSelectedExistingCoupon("");
    }
  }, [product?.id]);

  // Update form state when product prop changes
  useEffect(() => {
    if (product) {
      setImages(product.images || []);
      
      // Ensure sizes and colors are arrays
      const sizes = product.available_sizes || product.sizes;
      setSelectedSizes(Array.isArray(sizes) ? sizes : (sizes ? [sizes] : []));
      
      const colors = product.available_colors || product.colors;
      setSelectedColors(Array.isArray(colors) ? colors : (colors ? [colors] : []));
      
      setValue("name", product.name || "");
      setValue("name_en", product.name_en || "");
      setValue("description", product.description || "");
      setValue("description_en", product.description_en || "");
      setValue("categoryId", product.categoryId || "");
      setValue("sku", product.sku || "");
      setValue("slug", product.slug || "");
      setValue("price", product.price || 0);
      setValue("discountPercentage", product.discountPercentage || 0);
      setValue("inStock", product.inStock !== undefined ? product.inStock : true);
      setValue("quantity", product.quantity || 0);
      
      console.log("ProductForm: Loaded product colors:", colors, "->", Array.isArray(colors) ? colors : (colors ? [colors] : [])); // Debug
    } else {
      // Reset form for new product
      setImages([]);
      setSelectedSizes([]);
      setSelectedColors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]); // setValue is stable from react-hook-form, doesn't need to be in deps

  const loadCategories = async () => {
    try {
      const data = await categories.list();
      setCategoriesList(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadCoupons = async () => {
    if (!product?.id) return;
    setIsLoadingCoupons(true);
    try {
      // Try with product_id parameter
      const data = await coupons.list({ product_id: product.id.toString(), active_only: 'true' });
      setProductCoupons(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Failed to load coupons:", error);
      // If error, try without active_only filter
      try {
        const data = await coupons.list({ product_id: product.id.toString() });
        setProductCoupons(Array.isArray(data) ? data : data.results || []);
      } catch (e) {
        console.error("Failed to load coupons (fallback):", e);
        setProductCoupons([]);
      }
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const loadAllCoupons = async () => {
    setIsLoadingAllCoupons(true);
    try {
      const data = await coupons.list({});
      setAllCoupons(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Failed to load all coupons:", error);
      setAllCoupons([]);
    } finally {
      setIsLoadingAllCoupons(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!product?.id || !newCouponCode.trim() || !newCouponDiscount || !newCouponValidFrom || !newCouponValidTo) {
      alert("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    setIsCreatingCoupon(true);
    try {
      // Convert datetime-local format to ISO format for Django
      const formatDateTime = (dateTimeLocal: string) => {
        if (!dateTimeLocal) return null;
        // datetime-local format: "2024-01-01T12:00"
        // Django expects: "2024-01-01T12:00:00" or "2024-01-01T12:00:00Z"
        const date = new Date(dateTimeLocal);
        return date.toISOString();
      };

      const couponData = {
        code: newCouponCode.trim().toUpperCase(),
        discount_percentage: newCouponDiscount,
        products: [product.id], // Use products array instead of product
        valid_from: formatDateTime(newCouponValidFrom),
        valid_to: formatDateTime(newCouponValidTo),
        is_active: true,
      };
      
      console.log("Creating coupon with data:", couponData); // Debug log
      await coupons.create(couponData);
      setNewCouponCode("");
      setNewCouponDiscount(0);
      setNewCouponValidFrom("");
      setNewCouponValidTo("");
      await loadCoupons(); // Reload coupons
      await loadAllCoupons(); // Reload all coupons
      alert("تم إنشاء الكوبون بنجاح");
    } catch (error: any) {
      console.error("Failed to create coupon:", error);
      alert(error.message || "حدث خطأ أثناء إنشاء الكوبون");
    } finally {
      setIsCreatingCoupon(false);
    }
  };

  const handleReuseCoupon = async () => {
    if (!selectedExistingCoupon) {
      alert("الرجاء اختيار كوبون");
      return;
    }

    // If creating a new product (no product.id yet), store the coupon for later linking
    if (!product?.id) {
      setPendingCouponLink(selectedExistingCoupon);
      alert("سيتم ربط الكوبون بالمنتج بعد إنشائه");
      return;
    }

    // For existing products, link immediately
    try {
      // Get the selected coupon
      const coupon = allCoupons.find(c => c.id === selectedExistingCoupon);
      if (!coupon) {
        alert("الكوبون المحدد غير موجود");
        return;
      }

      // Get current products for this coupon (handle both array of IDs and array of objects)
      let currentProducts: string[] = [];
      if (Array.isArray(coupon.products)) {
        // If products is an array of IDs (strings)
        if (coupon.products.length > 0 && typeof coupon.products[0] === 'string') {
          currentProducts = coupon.products as string[];
        } 
        // If products is an array of objects with id property
        else if (coupon.products.length > 0 && typeof coupon.products[0] === 'object') {
          currentProducts = (coupon.products as any[]).map(p => p.id || p);
        }
      }
      
      // Add current product if not already in the list
      const productIdStr = product.id.toString();
      if (!currentProducts.includes(productIdStr) && !currentProducts.includes(product.id)) {
        const updatedProducts = [...currentProducts, product.id];
        
        // Update the coupon with only the fields that can be updated
        await coupons.update(coupon.id, {
          code: coupon.code,
          discount_percentage: coupon.discount_percentage,
          products: updatedProducts,
          valid_from: coupon.valid_from,
          valid_to: coupon.valid_to,
          is_active: coupon.is_active,
          max_uses: coupon.max_uses,
        });
        
        await loadCoupons(); // Reload product coupons
        await loadAllCoupons(); // Reload all coupons
        setSelectedExistingCoupon(""); // Reset selection
        alert("تم ربط الكوبون بالمنتج بنجاح");
      } else {
        alert("هذا الكوبون مربوط بالفعل بهذا المنتج");
      }
    } catch (error: any) {
      console.error("Failed to reuse coupon:", error);
      alert(error.message || "حدث خطأ أثناء ربط الكوبون");
    }
  };

  // Helper function to link coupon to a product
  const linkCouponToProduct = async (couponId: string, productId: string) => {
    try {
      // Fetch the coupon directly from API to ensure we have latest data
      const coupon = await coupons.get(couponId);
      if (!coupon) {
        console.error("Coupon not found:", couponId);
        return;
      }

      // Get current products for this coupon
      let currentProducts: string[] = [];
      if (Array.isArray(coupon.products)) {
        if (coupon.products.length > 0 && typeof coupon.products[0] === 'string') {
          currentProducts = coupon.products as string[];
        } else if (coupon.products.length > 0 && typeof coupon.products[0] === 'object') {
          currentProducts = (coupon.products as any[]).map(p => p.id || p);
        }
      }

      // Add product if not already in the list
      const productIdStr = productId.toString();
      if (!currentProducts.includes(productIdStr) && !currentProducts.includes(productId)) {
        const updatedProducts = [...currentProducts, productId];
        
        await coupons.update(coupon.id, {
          code: coupon.code,
          discount_percentage: coupon.discount_percentage,
          products: updatedProducts,
          valid_from: coupon.valid_from,
          valid_to: coupon.valid_to,
          is_active: coupon.is_active,
          max_uses: coupon.max_uses,
        });
      }
    } catch (error: any) {
      console.error("Failed to link coupon after product creation:", error);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
    try {
      await coupons.delete(couponId);
      await loadCoupons();
      alert("تم حذف الكوبون بنجاح");
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      alert("حدث خطأ أثناء حذف الكوبون");
    }
  };

  const price = watch("price");
  const discountPercentage = watch("discountPercentage");
  const finalPrice = price - (price * discountPercentage) / 100;


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          // Compress image before upload
          const compressedFile = await compressImage(file);
          return products.uploadImage(compressedFile);
        });
        const results = await Promise.all(uploadPromises);
        setImages((prev) => [...prev, ...results.map(r => r.url)]);
      } catch (error) {
        console.error("Failed to upload images:", error);
        alert("فشل رفع الصور");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Native image compression using Canvas API
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      // If file is already small (< 1MB), no need to compress
      if (file.size < 1024 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions (max 1920px width/height while maintaining aspect ratio)
          let width = img.width;
          let height = img.height;
          const maxDimension = 1920;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image on canvas with high quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression (0.85 quality for good balance)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // Create new file from blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
              resolve(compressedFile);
            },
            'image/jpeg',
            0.85 // Quality: 0.85 provides good balance between size and quality
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Ensure colors and sizes are arrays
      const colorsArray = Array.isArray(selectedColors) ? selectedColors : (selectedColors ? [selectedColors] : []);
      const sizesArray = Array.isArray(selectedSizes) ? selectedSizes : (selectedSizes ? [selectedSizes] : []);
      
      const productData: any = {
        name_ar: data.name,
        name_en: data.name_en,
        sku: data.sku,
        description_ar: data.description,
        description_en: data.description_en,
        price: data.price,
        discount_percentage: data.discountPercentage,
        category: data.categoryId,
        stock_quantity: data.quantity,
        is_in_stock: data.inStock,
        available_sizes: sizesArray,
        available_colors: colorsArray, // Ensure it's always an array
        images: images,
        is_active: true
      };

      // Slug handling (production-safe):
      // - On create: omit slug unless user explicitly entered one (backend will auto-generate).
      // - On edit: only send slug if it was changed by the admin.
      const submittedSlug = (data.slug || "").trim();
      const existingSlug = (product?.slug || "").trim();
      if (submittedSlug) {
        if (!product || submittedSlug !== existingSlug) {
          productData.slug = submittedSlug;
        }
      }

      console.log("Saving product with colors:", colorsArray); // Debug log

      let createdProductId: string | null = null;
      if (product) {
        await products.update(product.slug || product.id, productData);
      } else {
        const createdProduct = await products.create(productData);
        // Get the product ID from the response (try multiple possible formats)
        createdProductId = createdProduct?.id || createdProduct?.data?.id || createdProduct?.uuid || null;
        
        // If there's a pending coupon link, link it now
        if (pendingCouponLink && createdProductId) {
          try {
            await linkCouponToProduct(pendingCouponLink, createdProductId);
            setPendingCouponLink(null);
            console.log("Successfully linked coupon to new product");
          } catch (error) {
            console.error("Failed to link coupon after product creation:", error);
            // Don't fail the whole operation, just log the error
          }
        }
      }
      onClose();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("حدث خطأ أثناء حفظ المنتج");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">معلومات أساسية</h3>
        <div>
          <Label htmlFor="name">
            اسم المنتج (بالعربية) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register("name", { required: "اسم المنتج مطلوب" })}
            className="mt-2"
            placeholder="أدخل اسم المنتج بالعربية"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">
              {errors.name.message as string}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="name_en">
            Product Name (English)
          </Label>
          <Input
            id="name_en"
            {...register("name_en")}
            className="mt-2"
            placeholder="Enter product name in English"
            dir="ltr"
          />
        </div>

        <div>
          <Label htmlFor="description">الوصف المختصر (بالعربية)</Label>
          <Textarea
            id="description"
            {...register("description")}
            className="mt-2"
            rows={2}
            placeholder="وصف مختصر للمنتج بالعربية"
          />
        </div>

        <div>
          <Label htmlFor="description_en">Product Description (English)</Label>
          <Textarea
            id="description_en"
            {...register("description_en")}
            className="mt-2"
            rows={2}
            placeholder="Brief product description in English"
            dir="ltr"
          />
        </div>

        <div>
          <Label htmlFor="categoryId">
            الفئة <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watch("categoryId")}
            onValueChange={(value) => setValue("categoryId", value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              {categoriesList.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sku">
            كود المنتج (SKU) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="sku"
            {...register("sku", { required: "كود المنتج مطلوب" })}
            className="mt-2"
            placeholder="SPORTSHIRT001"
          />
        </div>

        <div>
          <Label htmlFor="slug">
            رابط المنتج (Slug) <span className="text-xs text-gray-500">(اختياري)</span>
          </Label>
          <Input
            id="slug"
            {...register("slug", { 
              validate: (value) => {
                // If provided, validate format
                if (value && value.trim().length > 0) {
                  // Check for invalid characters (no spaces, special chars except hyphens)
                  if (/[^\p{L}\p{N}-]/u.test(value)) {
                    return "يجب أن يحتوي الرابط على أحرف وأرقام وشرطات فقط (بدون مسافات أو رموز خاصة)";
                  }
                }
                return true;
              }
            })}
            className="mt-2"
            placeholder="اتركه فارغاً ليتم إنشاؤه تلقائياً من اسم المنتج"
            dir="ltr"
          />
          {errors.slug && (
            <p className="text-sm text-red-500 mt-1">
              {errors.slug.message as string}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            سيتم إنشاء الرابط تلقائياً من اسم المنتج إذا تركت الحقل فارغاً
          </p>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">الأسعار</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">
              السعر (جنيه) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              {...register("price", {
                required: "السعر مطلوب",
                min: { value: 0, message: "السعر يجب أن يكون أكبر من صفر" },
              })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="discountPercentage">نسبة الخصم (%)</Label>
            <Input
              id="discountPercentage"
              type="number"
              {...register("discountPercentage", {
                min: { value: 0, message: "الخصم يجب أن يكون أكبر من أو يساوي صفر" },
                max: { value: 100, message: "الخصم يجب أن يكون أقل من 100" },
              })}
              className="mt-2"
            />
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">السعر بعد الخصم</p>
          <p className="text-2xl font-bold text-foreground">
            {finalPrice.toLocaleString("ar-EG")} جنيه
          </p>
        </div>
      </div>

      {/* Inventory */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">المخزون</h3>
        <div>
          <Label>الحالة</Label>
          <RadioGroup
            value={watch("inStock") ? "in-stock" : "out-of-stock"}
            onValueChange={(value) => setValue("inStock", value === "in-stock")}
            className="mt-2"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="in-stock" id="in-stock" />
              <Label htmlFor="in-stock">متوفر</Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="out-of-stock" id="out-of-stock" />
              <Label htmlFor="out-of-stock">نفذ من المخزون</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <Label htmlFor="quantity">الكمية المتاحة</Label>
          <Input
            id="quantity"
            type="number"
            {...register("quantity", { min: 0 })}
            className="mt-2"
          />
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">المواصفات</h3>
        <div>
          <Label>المقاسات المتاحة</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {sizes.map((size) => (
              <div key={size} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`size-${size}`}
                  checked={selectedSizes.includes(size)}
                  onCheckedChange={() => handleSizeToggle(size)}
                />
                <Label htmlFor={`size-${size}`} className="cursor-pointer">
                  {size}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label>الألوان المتاحة</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {colors.map((color) => (
              <div
                key={color.name}
                className="flex items-center gap-2"
              >
                <Checkbox
                  id={`color-${color.name}`}
                  checked={selectedColors.includes(color.name)}
                  onCheckedChange={() => handleColorToggle(color.name)}
                  className="flex-shrink-0"
                />
                <Label
                  htmlFor={`color-${color.name}`}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <span>{color.name}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coupons Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">كوبونات الخصم</h3>
        
        {/* Current Active Coupons */}
        <div>
          <Label>الكوبونات النشطة الحالية</Label>
          {isLoadingCoupons ? (
            <p className="text-sm text-muted-foreground mt-2">جاري التحميل...</p>
          ) : productCoupons.length > 0 ? (
            <div className="mt-2 space-y-2">
              {productCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{coupon.code}</span>
                      <span className="text-sm text-muted-foreground">
                        - خصم {coupon.discount_percentage}%
                      </span>
                      {coupon.is_valid && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          نشط
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      من {new Date(coupon.valid_from).toLocaleDateString('ar-EG')} إلى{" "}
                      {new Date(coupon.valid_to).toLocaleDateString('ar-EG')}
                    </p>
                    {coupon.max_uses && (
                      <p className="text-xs text-muted-foreground">
                        الاستخدام: {coupon.used_count} / {coupon.max_uses}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              لا توجد كوبونات نشطة لهذا المنتج
            </p>
          )}
        </div>

        {/* Reuse Existing Coupon */}
        <div className="border-t pt-4">
          <Label className="mb-3 block">استخدام كوبون موجود</Label>
          {pendingCouponLink && !product?.id && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              ✓ سيتم ربط الكوبون المحدد بالمنتج بعد إنشائه
            </div>
          )}
          <div className="space-y-3">
            <div>
              <Label htmlFor="existingCoupon" className="text-sm">
                اختر كوبون موجود
              </Label>
              {isLoadingAllCoupons ? (
                <p className="text-sm text-muted-foreground mt-2">جاري التحميل...</p>
              ) : (
                <Select
                  value={selectedExistingCoupon}
                  onValueChange={setSelectedExistingCoupon}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر كوبون للاستخدام" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCoupons.length > 0 ? (
                      allCoupons.map((coupon) => {
                        // Check if this coupon is already linked to current product
                        const isLinked = product?.id && (
                          (Array.isArray(coupon.products) && coupon.products.some(
                            (p: any) => (typeof p === 'string' ? p === product.id : p.id === product.id || p === product.id)
                          )) ||
                          (coupon.product_count > 0 && coupon.products?.includes?.(product.id))
                        );
                        return (
                          <SelectItem key={coupon.id} value={coupon.id}>
                            {coupon.code} - خصم {coupon.discount_percentage}%
                            {coupon.product_count > 0 && ` (${coupon.product_count} منتج)`}
                            {isLinked && ' ✓ مربوط'}
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-coupons" disabled>
                        لا توجد كوبونات متاحة
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleReuseCoupon}
              disabled={!selectedExistingCoupon}
              className="w-full"
            >
              {product?.id ? "ربط الكوبون بهذا المنتج" : "سيتم الربط بعد إنشاء المنتج"}
            </Button>
          </div>
        </div>

        {/* Create New Coupon */}
        <div className="border-t pt-4">
          <Label className="mb-3 block">إضافة كوبون جديد</Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="couponCode" className="text-sm">
                  كود الكوبون <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="couponCode"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="مثال: SAVE20"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="couponDiscount" className="text-sm">
                  نسبة الخصم (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="couponDiscount"
                  type="number"
                  min="0"
                  max="100"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                  placeholder="20"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="couponValidFrom" className="text-sm">
                  صالح من <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="couponValidFrom"
                  type="datetime-local"
                  value={newCouponValidFrom}
                  onChange={(e) => setNewCouponValidFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="couponValidTo" className="text-sm">
                  صالح حتى <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="couponValidTo"
                  type="datetime-local"
                  value={newCouponValidTo}
                  onChange={(e) => setNewCouponValidTo(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleCreateCoupon}
              disabled={isCreatingCoupon || !product?.id}
              className="w-full"
            >
              {isCreatingCoupon ? "جاري الإنشاء..." : "إضافة كوبون"}
            </Button>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">صور المنتج</h3>
        <div>
          <Label htmlFor="images">
            صور المنتج <span className="text-red-500">*</span>
          </Label>
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              اسحب الصور هنا أو اضغط للرفع
            </p>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("images")?.click()}
            >
              {isUploading ? "جاري الرفع..." : "اختر الصور"}
            </Button>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? "جاري الحفظ..." : "حفظ المنتج"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}




