import { useState, useEffect } from "react";
import { GripVertical, Save, Loader2 } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { products as productsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Product {
  id: string;
  name_ar: string;
  slug: string;
  price: number;
  display_order: number;
  is_active: boolean;
  primary_image?: string;
}

function SortableProductItem({ product }: { product: Product }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border rounded-lg p-4 flex items-center gap-4 ${
        isDragging ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name_ar}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-foreground">{product.name_ar}</h3>
        <p className="text-sm text-muted-foreground">
          السعر: {product.price.toLocaleString("ar-EG")} جنيه
        </p>
        <p className="text-xs text-muted-foreground">
          الترتيب الحالي: {product.display_order}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!product.is_active && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
            غير نشط
          </span>
        )}
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
          #{product.display_order}
        </span>
      </div>
    </div>
  );
}

export default function ProductOrderManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      // Fetch all products ordered by display_order
      const data = await productsApi.list({ 
        page_size: '10000',
        ordering: 'display_order' 
      });
      const productsList = Array.isArray(data) ? data : (data.results || []);
      
      // Ensure display_order exists for all products
      // If display_order is 0 or missing, assign based on current index
      const productsWithOrder = productsList.map((product: any, index: number) => ({
        id: product.id,
        name_ar: product.name_ar,
        slug: product.slug,
        price: Number(product.final_price || product.price),
        display_order: product.display_order && product.display_order > 0 ? product.display_order : index + 1,
        is_active: product.is_active !== false,
        primary_image: product.primary_image,
      }));
      
      setProducts(productsWithOrder);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("فشل تحميل المنتجات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setProducts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update display_order for all items
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          display_order: index + 1,
        }));
        
        setHasChanges(true);
        return updatedItems;
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Prepare products data with new display_order
      const productsData = products.map((product, index) => ({
        id: product.id,
        display_order: index + 1,
      }));

      await productsApi.reorder(productsData);
      
      toast.success("تم حفظ الترتيب بنجاح");
      setHasChanges(false);
      
      // Reload to ensure sync
      await loadProducts();
    } catch (error: any) {
      console.error("Failed to save order:", error);
      toast.error(error.message || "فشل حفظ الترتيب");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    loadProducts();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ترتيب المنتجات</h1>
            <p className="text-muted-foreground mt-2">
              اسحب المنتجات لإعادة ترتيبها. الترتيب الحالي سيظهر في الصفحة الرئيسية وصفحات الفئات.
            </p>
          </div>
          <div className="flex gap-3">
            {hasChanges && (
              <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                إلغاء التغييرات
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  حفظ الترتيب
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info Box */}
        {hasChanges && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ⚠️ لديك تغييرات غير محفوظة. اضغط على "حفظ الترتيب" لحفظ التغييرات.
            </p>
          </div>
        )}

        {/* Products List */}
        <div className="bg-card rounded-lg shadow-sm p-6">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد منتجات</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={products.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {products.map((product) => (
                    <SortableProductItem key={product.id} product={product} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-secondary rounded-lg p-4">
          <h3 className="font-bold text-foreground mb-2">كيفية الاستخدام:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>اسحب المنتجات باستخدام أيقونة القبضة (⋮⋮) لإعادة ترتيبها</li>
            <li>المنتج في الأعلى سيظهر أولاً في الصفحة الرئيسية</li>
            <li>اضغط على "حفظ الترتيب" لحفظ التغييرات</li>
            <li>يمكنك استخدام لوحة المفاتيح للتنقل والترتيب أيضاً</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}

