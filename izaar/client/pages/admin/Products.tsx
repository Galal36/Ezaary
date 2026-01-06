import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { products, categories as categoriesApi } from "@/lib/api-client";
import { AdminProduct } from "@/lib/admin-mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminProducts() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(
    searchParams.get("action") === "add"
  );
  const [productsList, setProductsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 20;

  useEffect(() => {
    Promise.all([loadProducts(), loadCategories()]);
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      // Fetch ALL products for admin - Admin should see everything
      // Use a very large page_size to get all products in one request
      const params: Record<string, string> = {
        page_size: '10000', // Very large number to get all products
      };
      
      // Call the API directly to get full response with pagination info
      const API_BASE_URL = 'http://localhost:8000/api';
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/products/?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle both paginated and non-paginated responses
      let allProducts: any[] = [];
      
      if (data.results) {
        // Paginated response
        allProducts = data.results;
        
        // If there are more pages, fetch them
        if (data.count && data.count > data.results.length) {
          const pageSize = 10000;
          const totalPages = Math.ceil(data.count / pageSize);
          
          // Fetch remaining pages if any (unlikely with page_size=10000, but just in case)
          for (let page = 2; page <= totalPages; page++) {
            const pageParams: Record<string, string> = {
              page_size: pageSize.toString(),
              page: page.toString(),
            };
            const pageQueryParams = new URLSearchParams(pageParams);
            const pageResponse = await fetch(`${API_BASE_URL}/products/?${pageQueryParams}`, {
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (pageResponse.ok) {
              const pageData = await pageResponse.json();
              if (pageData.results) {
                allProducts.push(...pageData.results);
              }
            }
          }
        }
      } else if (Array.isArray(data)) {
        // Non-paginated response (array)
        allProducts = data;
      } else {
        // Fallback
        allProducts = [];
      }
      
      setProductsList(allProducts);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProductsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.list();
      setCategoriesList(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const refreshData = () => {
    loadProducts();
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...productsList];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name_ar.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Stock filter
    if (stockFilter !== "all") {
      filtered = filtered.filter(
        (product) =>
          (stockFilter === "in-stock" && product.is_in_stock) ||
          (stockFilter === "out-of-stock" && !product.is_in_stock)
      );
    }

    return filtered;
  }, [searchQuery, categoryFilter, stockFilter, productsList]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: any) => {
    // Map API product to AdminProduct shape
    setSelectedProduct({
      id: product.id,
      name: product.name_ar,
      sku: product.sku,
      categoryName: product.category_name,
      categoryId: product.category,
      price: parseFloat(product.price),
      discountPercentage: product.discount_percentage || 0,
      inStock: product.is_in_stock,
      quantity: product.stock_quantity || 0,
      images: product.images
        ? product.images.map((img: any) => {
            // Handle both object and string formats
            return typeof img === 'string' ? img : (img.image_url || img.url || img);
          })
        : (product.primary_image ? [product.primary_image] : []),
      description: product.description_ar || "",
      sizes: product.available_sizes || [],
      available_sizes: product.available_sizes || [], // Add this for ProductForm
      colors: product.available_colors || [],
      available_colors: product.available_colors || [], // Add this for ProductForm - ensure it's an array
      slug: product.slug
    });
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      await products.delete(productId);
      refreshData();
    }
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            إدارة المنتجات
          </h1>
          <p className="text-muted-foreground">
            عرض وإدارة جميع منتجات المتجر
          </p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج جديد
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pr-10"
            />
          </div>

          {/* Category Filter */}
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {categoriesList.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stock Filter */}
          <Select
            value={stockFilter}
            onValueChange={(value) => {
              setStockFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="in-stock">متوفر</SelectItem>
              <SelectItem value="out-of-stock">نفذ من المخزون</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  صورة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  اسم المنتج
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  كود المنتج
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  الفئة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  السعر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  الخصم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  المخزون
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground">
                      لا توجد منتجات مطابقة للبحث
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={product.primary_image || "/placeholder.svg"}
                        alt={product.name_ar}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {product.name_ar}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {product.category_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {parseFloat(product.price).toLocaleString("ar-EG")} جنيه
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.discount_percentage > 0 ? (
                        <span className="text-green-600 font-medium">
                          {product.discount_percentage}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {product.is_in_stock ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          متوفر ({product.stock_quantity})
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          نفذ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // Fetch full details before editing
                            products.get(product.slug).then(fullProduct => {
                              handleEditProduct(fullProduct);
                            });
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.slug)} // Use slug for delete
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              عرض {((currentPage - 1) * itemsPerPage + 1).toLocaleString(
                "ar-EG"
              )}{" "}
              -{" "}
              {Math.min(
                currentPage * itemsPerPage,
                filteredProducts.length
              ).toLocaleString("ar-EG")}{" "}
              من {filteredProducts.length.toLocaleString("ar-EG")} منتج
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                  )
                  .map((page, idx, arr) => (
                    <div key={page} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedProduct(null);
              refreshData(); // Refresh list after close
            }}
          />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}




