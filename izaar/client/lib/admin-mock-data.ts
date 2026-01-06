export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  governorate: string;
  district: string;
  address: string;
  products: OrderProduct[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: "new" | "processing" | "shipped" | "out-for-delivery" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  discountPercentage: number;
  images: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  quantity: number;
  rating: number;
  reviewCount: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  order: number;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  governorate: string;
  totalOrders: number;
  totalSpending: number;
  registrationDate: string;
  lastOrderDate?: string;
}

// Mock Orders Data
export const mockOrders: Order[] = [
  {
    id: "ORD001",
    customerName: "أحمد محمد",
    phone: "201234567890",
    email: "ahmed@example.com",
    governorate: "أسيوط",
    district: "أسيوط",
    address: "شارع الجمهورية، العمارة رقم 5",
    products: [
      {
        id: "1",
        name: "قميص رياضي درايفت",
        price: 199,
        quantity: 2,
        size: "L",
        color: "أزرق",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
      },
    ],
    subtotal: 398,
    discount: 0,
    shipping: 25,
    total: 423,
    status: "processing",
    createdAt: "2024-12-15T10:30:00Z",
    updatedAt: "2024-12-15T14:20:00Z",
  },
  {
    id: "ORD002",
    customerName: "محمود علي",
    phone: "201987654321",
    email: "mahmoud@example.com",
    governorate: "القاهرة",
    district: "العاشر من رمضان",
    address: "الحي العاشر، الشارع الرئيسي",
    products: [
      {
        id: "2",
        name: "تي شيرت رياضي",
        price: 149,
        quantity: 1,
        size: "M",
        color: "أسود",
        image: "https://images.unsplash.com/photo-1503341455253-b2b723bb19d3?w=100&h=100&fit=crop",
      },
      {
        id: "3",
        name: "جاكيت رياضي",
        price: 399,
        quantity: 1,
        size: "XL",
        color: "رمادي",
        image: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=100&h=100&fit=crop",
      },
    ],
    subtotal: 548,
    discount: 50,
    shipping: 0,
    total: 498,
    status: "new",
    createdAt: "2024-12-16T09:15:00Z",
    updatedAt: "2024-12-16T09:15:00Z",
  },
  {
    id: "ORD003",
    customerName: "فاطمة حسين",
    phone: "201567890123",
    email: "fatma@example.com",
    governorate: "الجيزة",
    district: "الهرم",
    address: "شارع الأهرام، الفيلا رقم 10",
    products: [
      {
        id: "4",
        name: "بولو شيرت قطن",
        price: 179,
        quantity: 3,
        size: "M",
        color: "أحمر",
        image: "https://images.unsplash.com/photo-1618231722492-f34f50db938a?w=100&h=100&fit=crop",
      },
    ],
    subtotal: 537,
    discount: 0,
    shipping: 25,
    total: 562,
    status: "shipped",
    createdAt: "2024-12-14T16:45:00Z",
    updatedAt: "2024-12-15T08:30:00Z",
  },
  {
    id: "ORD004",
    customerName: "سارة عبدالله",
    phone: "201456123789",
    email: "sarah@example.com",
    governorate: "الإسكندرية",
    district: "الوسط",
    address: "شارع سعد زغلول",
    products: [
      {
        id: "5",
        name: "شورت رياضي",
        price: 99,
        quantity: 2,
        size: "S",
        color: "أبيض",
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop",
      },
    ],
    subtotal: 198,
    discount: 20,
    shipping: 25,
    total: 203,
    status: "delivered",
    createdAt: "2024-12-10T12:00:00Z",
    updatedAt: "2024-12-12T14:30:00Z",
  },
  {
    id: "ORD005",
    customerName: "خالد إبراهيم",
    phone: "201234567123",
    email: "khaled@example.com",
    governorate: "المنيا",
    district: "المنيا",
    address: "شارع البنك، بجوار المسجد",
    products: [
      {
        id: "6",
        name: "جاكيت فاخر",
        price: 449,
        quantity: 1,
        size: "L",
        color: "أسود",
        image: "https://images.unsplash.com/photo-1508729466827-79d3b814e5e7?w=100&h=100&fit=crop",
      },
    ],
    subtotal: 449,
    discount: 45,
    shipping: 0,
    total: 404,
    status: "out-for-delivery",
    createdAt: "2024-12-13T11:20:00Z",
    updatedAt: "2024-12-16T08:00:00Z",
  },
];

// Mock Products Data
export const mockProducts: AdminProduct[] = [
  {
    id: "1",
    name: "قميص رياضي درايفت تقنية حديثة",
    sku: "SPORTSHIRT001",
    description: "قميص رياضي عالي الجودة من أفضل الماركات العالمية",
    categoryId: "sportswear",
    categoryName: "ملابس رياضية رجالي",
    price: 199,
    discountPercentage: 25,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["أزرق", "أسود", "أحمر"],
    inStock: true,
    quantity: 45,
    rating: 4.8,
    reviewCount: 127,
  },
  {
    id: "2",
    name: "تي شيرت رياضي تهوية عالية",
    sku: "TSHIRT001",
    description: "تي شيرت بتصميم حديث وراحة عالية",
    categoryId: "sportswear",
    categoryName: "ملابس رياضية رجالي",
    price: 149,
    discountPercentage: 20,
    images: ["https://images.unsplash.com/photo-1503341455253-b2b723bb19d3?w=300"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["أسود", "أبيض", "رمادي"],
    inStock: true,
    quantity: 78,
    rating: 4.6,
    reviewCount: 98,
  },
  {
    id: "3",
    name: "جاكيت رياضي محافظ على الحرارة",
    sku: "JACKET001",
    description: "جاكيت فاخر للرياضة والاستخدام اليومي",
    categoryId: "sportswear",
    categoryName: "ملابس رياضية رجالي",
    price: 399,
    discountPercentage: 30,
    images: ["https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=300"],
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["رمادي", "أسود", "أزرق"],
    inStock: true,
    quantity: 22,
    rating: 4.9,
    reviewCount: 156,
  },
];

// Mock Categories Data
export const mockCategories: AdminCategory[] = [
  {
    id: "sportswear",
    name: "ملابس رياضية رجالي",
    description: "أفضل الملابس الرياضية الرجالية",
    image: "https://images.unsplash.com/photo-1539701038985-a8a6c3b7414e?w=300&h=300&fit=crop",
    productCount: 15,
    order: 1,
    active: true,
  },
  {
    id: "casual",
    name: "ملابس كاجوال",
    description: "ملابس كاجوال مريحة وأنيقة",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=300&fit=crop",
    productCount: 15,
    order: 2,
    active: true,
  },
  {
    id: "homewear",
    name: "ملابس بيتي",
    description: "ملابس منزلية مريحة",
    image: "https://images.unsplash.com/photo-1502252430562-40eb08b0126f?w=300&h=300&fit=crop",
    productCount: 15,
    order: 3,
    active: true,
  },
];

// Mock Customers Data
export const mockCustomers: Customer[] = [
  {
    id: "CUST001",
    name: "أحمد محمد",
    email: "ahmed@example.com",
    phone: "201234567890",
    governorate: "أسيوط",
    totalOrders: 5,
    totalSpending: 2150,
    registrationDate: "2024-06-15",
    lastOrderDate: "2024-12-15",
  },
  {
    id: "CUST002",
    name: "محمود علي",
    email: "mahmoud@example.com",
    phone: "201987654321",
    governorate: "القاهرة",
    totalOrders: 3,
    totalSpending: 1520,
    registrationDate: "2024-08-20",
    lastOrderDate: "2024-12-16",
  },
  {
    id: "CUST003",
    name: "فاطمة حسين",
    email: "fatma@example.com",
    phone: "201567890123",
    governorate: "الجيزة",
    totalOrders: 8,
    totalSpending: 3890,
    registrationDate: "2024-03-10",
    lastOrderDate: "2024-12-14",
  },
];
