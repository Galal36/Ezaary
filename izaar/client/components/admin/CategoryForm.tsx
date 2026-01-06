import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

// import { AdminCategory } from "@/lib/admin-mock-data";
import { categories as categoriesApi } from "@/lib/api-client";
import { toast } from "sonner";
import { AdminCategory } from "@/pages/admin/Categories"; // Import shared interface or redefine
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, X } from "lucide-react";

interface CategoryFormProps {
  category?: AdminCategory | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CategoryForm({ category, onClose, onSuccess }: CategoryFormProps) {
  const [image, setImage] = useState<string>(category?.image || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Update image when category prop changes
  useEffect(() => {
    if (category?.image) {
      setImage(category.image);
    }
  }, [category?.image]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
      active: category?.active !== undefined ? category.active : true,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const response = await categoriesApi.uploadImage(file);
        setImage(response.url);
        toast.success("تم رفع الصورة بنجاح");
      } catch (error) {
        console.error("Failed to upload image", error);
        toast.error("فشل رفع الصورة");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const categoryData: any = {
        name_ar: data.name,
        description_ar: data.description || "",
        is_active: Boolean(data.active) // Ensure it's a boolean
      };

      // Only include image_url if image exists
      if (image && image.trim().length > 0) {
        categoryData.image_url = image;
      }

      // Only include name_en if needed (some backends require it)
      if (data.name) {
        categoryData.name_en = data.name;
      }

      if (category) {
        await categoriesApi.update(category.slug, categoryData);
        toast.success("تم تحديث الفئة بنجاح");
      } else {
        await categoriesApi.create(categoryData);
        toast.success("تم إضافة الفئة بنجاح");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to save category:", error);
      const errorMessage = error?.message || error?.detail || "فشل حفظ الفئة";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">
          اسم الفئة <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register("name", { required: "اسم الفئة مطلوب" })}
          className="mt-2"
          placeholder="أدخل اسم الفئة"
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">
            {errors.name.message as string}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          {...register("description")}
          className="mt-2"
          rows={3}
          placeholder="وصف الفئة (اختياري)"
        />
      </div>

      <div>
        <Label htmlFor="image">
          صورة الفئة <span className="text-red-500">*</span>
        </Label>
        {image ? (
          <div className="mt-2 relative inline-block">
            <img
              src={image}
              alt="Category"
              className="w-32 h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => setImage("")}
              className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              اضغط لرفع صورة الفئة
            </p>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image")?.click()}
            >
              اختر الصورة
            </Button>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="order">الترتيب</Label>
        <Input
          id="order"
          type="number"
          {...register("order", { min: 0 })}
          className="mt-2"
          placeholder="0"
        />
        <p className="text-xs text-muted-foreground mt-1">
          يستخدم لترتيب عرض الفئات (الأقل يظهر أولاً)
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="active">الحالة</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {watch("active") ? "مفعل" : "معطل"}
          </span>
          <Switch
            id="active"
            checked={watch("active")}
            onCheckedChange={(checked) => setValue("active", checked)}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit">حفظ</Button>
        <Button type="button" variant="outline" onClick={onClose}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}





