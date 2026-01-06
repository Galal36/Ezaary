import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { categories as categoriesApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CategoryForm from "@/components/admin/CategoryForm";
import { toast } from "sonner";

export interface AdminCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  active: boolean;
  productCount: number;
  slug: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesApi.list();
      // Map API response to AdminCategory interface
      const mappedCategories = data.map((cat: any) => ({
        id: cat.id,
        name: cat.name_ar, // Assuming Arabic name for admin
        description: cat.description_ar || "",
        image: cat.image_url || "/placeholder-category.jpg",
        active: cat.is_active,
        productCount: cat.products_count || 0, // Backend needs to provide this or we defaults to 0
        slug: cat.slug,
      }));
      setCategories(mappedCategories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("فشل في تحميل الفئات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEditCategory = (category: AdminCategory) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الفئة؟")) {
      try {
        // We need slug for delete, finding it from categories list
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          await categoriesApi.delete(category.slug);
          toast.success("تم حذف الفئة بنجاح");
          fetchCategories();
        }
      } catch (error) {
        console.error("Delete failed", error);
        toast.error("فشل في حذف الفئة");
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedCategory(null);
    fetchCategories();
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            إدارة الفئات
          </h1>
          <p className="text-muted-foreground">عرض وإدارة فئات المنتجات</p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة فئة جديدة
        </Button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="text-center py-10">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 bg-gray-200">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-category.jpg";
                  }}
                />
                {!category.active && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    معطل
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {category.productCount} منتج
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1.5 hover:bg-red-50 rounded transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={selectedCategory}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedCategory(null);
            }}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}





