import { useState, useMemo } from "react";
import { Search, Eye, Mail, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { mockCustomers, Customer } from "@/lib/admin-mock-data";
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
import CustomerDetails from "@/components/admin/CustomerDetails";

const sortOptions = [
  { value: "newest", label: "الأحدث" },
  { value: "most-orders", label: "الأكثر طلبات" },
  { value: "highest-spending", label: "الأعلى إنفاقاً" },
];

export default function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const itemsPerPage = 20;

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = [...mockCustomers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.phone.includes(query) ||
          customer.email.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.registrationDate).getTime() -
            new Date(a.registrationDate).getTime()
          );
        case "most-orders":
          return b.totalOrders - a.totalOrders;
        case "highest-spending":
          return b.totalSpending - a.totalSpending;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          إدارة العملاء
        </h1>
        <p className="text-muted-foreground">عرض وإدارة بيانات العملاء</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="ابحث عن عميل..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pr-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="الترتيب" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  رقم الهاتف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  المحافظة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  عدد الطلبات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  إجمالي الإنفاق
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  تاريخ التسجيل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground">
                      لا يوجد عملاء مطابقون للبحث
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-primary hover:underline flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {customer.governorate}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {customer.totalSpending.toLocaleString("ar-EG")} جنيه
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(customer.registrationDate).toLocaleDateString(
                        "ar-EG"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
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
                filteredCustomers.length
              ).toLocaleString("ar-EG")}{" "}
              من {filteredCustomers.length.toLocaleString("ar-EG")} عميل
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

      {/* Customer Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCustomer && (
            <CustomerDetails
              customer={selectedCustomer}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}





