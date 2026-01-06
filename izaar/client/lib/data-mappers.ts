// /**
//  * Data Mappers
//  * Convert between backend API format (snake_case) and frontend format (camelCase)
//  */

// // Helper function to normalize image URLs
// export const normalizeImageUrl = (url: string | null | undefined): string => {
//   if (!url) return '/placeholder.svg';
  
//   // If it's already a full URL, return as is
//   if (url.startsWith('http://') || url.startsWith('https://')) {
//     return url;
//   }
  
//   // If it's a relative path starting with /media, prepend backend URL
//   if (url.startsWith('/media/') || url.startsWith('media/')) {
//     const backendUrl = 'http://localhost:8000';
//     return url.startsWith('/') ? `${backendUrl}${url}` : `${backendUrl}/${url}`;
//   }
  
//   // If it's a relative path, prepend backend URL and /media
//   if (url.startsWith('/')) {
//     return `http://localhost:8000${url}`;
//   }
  
//   return url;
// };

// // Product Mappers
// export const mapBackendProduct = (product: any) => ({
//   id: product.id,
//   name: product.name_ar,
//   price: parseFloat(product.final_price || product.price),
//   originalPrice: product.discount_percentage > 0 ? parseFloat(product.price) : undefined,
//   image: normalizeImageUrl(product.primary_image || product.image_url),
//   rating: parseFloat(product.average_rating || 0),
//   reviewCount: product.review_count || 0,
//   category: product.category_name || '',
//   categoryId: product.category || '',
//   description: product.description_ar || '',
//   discount: product.discount_percentage || 0,
//   inStock: product.is_in_stock,
//   slug: product.slug,
//   sku: product.sku,
//   sizes: product.available_sizes || [],
//   colors: product.available_colors || [],
//   quantity: product.stock_quantity || 0,
// });

// export const mapBackendProductToAdmin = (product: any) => ({
//   id: product.id,
//   name: product.name_ar,
//   sku: product.sku,
//   description: product.description_ar || '',
//   categoryId: product.category,
//   categoryName: product.category_name || '',
//   price: parseFloat(product.price),
//   discountPercentage: product.discount_percentage || 0,
//   images: product.images?.map((img: any) => normalizeImageUrl(img.image_url)) || [],
//   sizes: product.available_sizes || [],
//   colors: product.available_colors || [],
//   inStock: product.is_in_stock,
//   quantity: product.stock_quantity || 0,
//   rating: parseFloat(product.average_rating || 0),
//   reviewCount: product.review_count || 0,
// });

// export const mapFrontendProductToBackend = (product: any) => ({
//   name_ar: product.name,
//   sku: product.sku,
//   slug: product.slug || product.sku?.toLowerCase().replace(/\s+/g, '-'),
//   description_ar: product.description,
//   category: product.categoryId,
//   price: product.price,
//   discount_percentage: product.discountPercentage || 0,
//   available_sizes: product.sizes,
//   available_colors: product.colors,
//   stock_quantity: product.quantity,
//   is_in_stock: product.inStock,
//   is_featured: product.isFeatured || false,
//   is_new: product.isNew || false,
//   is_on_sale: product.discountPercentage > 0,
// });

// // Category Mappers
// export const mapBackendCategory = (category: any) => ({
//   id: category.id,
//   name: category.name_ar,
//   image: normalizeImageUrl(category.image_url),
//   slug: category.slug,
//   description: category.description_ar || '',
//   productCount: category.product_count || 0,
//   order: category.display_order || 0,
//   active: category.is_active,
// });

// export const mapFrontendCategoryToBackend = (category: any) => ({
//   name_ar: category.name,
//   slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-'),
//   description_ar: category.description,
//   image_url: category.image,
//   display_order: category.order || 0,
//   is_active: category.active !== undefined ? category.active : true,
// });

// // Order Mappers
// export const mapBackendOrder = (order: any) => ({
//   id: order.id,
//   customerName: order.customer_name,
//   phone: order.customer_phone,
//   email: order.customer_email || '',
//   governorate: order.governorate,
//   district: order.district,
//   address: order.detailed_address,
//   village: order.village || '',
//   products: order.items?.map((item: any) => ({
//     id: item.product,
//     name: item.product_name_ar,
//     price: parseFloat(item.final_unit_price),
//     quantity: item.quantity,
//     size: item.selected_size,
//     color: item.selected_color,
//     image: '/placeholder.svg', // Images not returned in order items
//   })) || [],
//   subtotal: parseFloat(order.subtotal),
//   discount: parseFloat(order.discount_amount || 0),
//   shipping: parseFloat(order.shipping_cost),
//   total: parseFloat(order.total),
//   status: mapBackendOrderStatus(order.status),
//   createdAt: order.created_at,
//   updatedAt: order.updated_at,
//   notes: order.customer_notes,
//   adminNotes: order.admin_notes,
// });

// // Map backend order status to frontend format
// export const mapBackendOrderStatus = (status: string): "new" | "processing" | "shipped" | "out-for-delivery" | "delivered" | "cancelled" => {
//   const statusMap: Record<string, any> = {
//     'pending': 'new',
//     'confirmed': 'processing',
//     'processing': 'processing',
//     'shipped': 'shipped',
//     'out_for_delivery': 'out-for-delivery',
//     'delivered': 'delivered',
//     'cancelled': 'cancelled',
//   };
//   return statusMap[status] || 'new';
// };

// // Map frontend order status to backend format
// export const mapFrontendOrderStatus = (status: string): string => {
//   const statusMap: Record<string, string> = {
//     'new': 'pending',
//     'processing': 'confirmed',
//     'shipped': 'shipped',
//     'out-for-delivery': 'out_for_delivery',
//     'delivered': 'delivered',
//     'cancelled': 'cancelled',
//   };
//   return statusMap[status] || 'pending';
// };

// // Map frontend order to backend format for creation
// export const mapFrontendOrderToBackend = (orderData: any) => {
//   return {
//     customer_name: orderData.fullName,
//     customer_phone: orderData.phone,
//     customer_email: orderData.email || '',
//     governorate: orderData.governorate,
//     district: orderData.district,
//     village: orderData.village || '',
//     detailed_address: orderData.detailedAddress,
//     customer_notes: orderData.notes || '',
//     subtotal: orderData.subtotal,
//     discount_amount: orderData.discountAmount || 0,
//     shipping_cost: orderData.shippingCost,
//     total: orderData.total,
//     items: orderData.items.map((item: any) => ({
//       product: item.productId,
//       product_name_ar: item.productName,
//       product_sku: item.productSku || '',
//       selected_size: item.selectedSize || '',
//       selected_color: item.selectedColor || '',
//       quantity: 1, // Each item represents 1 unit
//       unit_price: item.unitPrice,
//       discount_percentage: item.discountPercentage || 0,
//       final_unit_price: item.finalUnitPrice,
//       subtotal: item.finalUnitPrice,
//     })),
//   };
// };

// // Customer Mappers (for admin dashboard)
// export const mapBackendCustomer = (order: any) => {
//   // Since we don't have customer accounts, we aggregate from orders
//   return {
//     id: order.customer_phone, // Use phone as unique ID
//     name: order.customer_name,
//     email: order.customer_email || '',
//     phone: order.customer_phone,
//     governorate: order.governorate,
//     totalOrders: 1, // Would need to be calculated from multiple orders
//     totalSpending: parseFloat(order.total),
//     registrationDate: order.created_at,
//     lastOrderDate: order.created_at,
//   };
// };

// // Review Mappers
// export const mapBackendReview = (review: any) => ({
//   id: review.id,
//   productId: review.product,
//   productName: review.product_name || '',
//   reviewerName: review.reviewer_name,
//   rating: review.rating,
//   title: review.title_ar || '',
//   comment: review.comment_ar || '',
//   isApproved: review.is_approved,
//   isVerified: review.is_verified_purchase,
//   helpfulCount: review.helpful_count || 0,
//   createdAt: review.created_at,
// });

// export const mapFrontendReviewToBackend = (review: any) => ({
//   product: review.productId,
//   reviewer_name: review.reviewerName,
//   rating: review.rating,
//   title_ar: review.title,
//   comment_ar: review.comment,
// });


// ...........


/**
 * Data Mappers
 * Convert between backend API format (snake_case) and frontend format (camelCase)
 */

// Helper function to normalize image URLs
export const normalizeImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path starting with /media, prepend backend URL
  if (url.startsWith('/media/') || url.startsWith('media/')) {
    const backendUrl = 'http://localhost:8000';
    return url.startsWith('/') ? `${backendUrl}${url}` : `${backendUrl}/${url}`;
  }
  
  // If it's a relative path, prepend backend URL and /media
  if (url.startsWith('/')) {
    return `http://localhost:8000${url}`;
  }
  
  return url;
};

// Product Mappers
export const mapBackendProduct = (product: any) => ({
  id: product.id,
  name: product.name_ar,
  price: parseFloat(product.final_price || product.price),
  originalPrice: product.discount_percentage > 0 ? parseFloat(product.price) : undefined,
  image: normalizeImageUrl(product.primary_image || product.image_url),
  rating: parseFloat(product.average_rating || 0),
  reviewCount: product.review_count || 0,
  category: product.category_name || '',
  categoryId: product.category || '',
  description: product.description_ar || '',
  discount: product.discount_percentage || 0,
  inStock: product.is_in_stock,
  slug: product.slug,
  sku: product.sku,
  sizes: product.available_sizes || [],
  colors: product.available_colors || [],
  quantity: product.stock_quantity || 0,
});

export const mapBackendProductToAdmin = (product: any) => ({
  id: product.id,
  name: product.name_ar,
  sku: product.sku,
  description: product.description_ar || '',
  categoryId: product.category,
  categoryName: product.category_name || '',
  price: parseFloat(product.price),
  discountPercentage: product.discount_percentage || 0,
  images: product.images?.map((img: any) => normalizeImageUrl(img.image_url)) || [],
  sizes: product.available_sizes || [],
  colors: product.available_colors || [],
  inStock: product.is_in_stock,
  quantity: product.stock_quantity || 0,
  rating: parseFloat(product.average_rating || 0),
  reviewCount: product.review_count || 0,
});

export const mapFrontendProductToBackend = (product: any) => ({
  name_ar: product.name,
  sku: product.sku,
  slug: product.slug || product.sku?.toLowerCase().replace(/\s+/g, '-'),
  description_ar: product.description,
  category: product.categoryId,
  price: product.price,
  discount_percentage: product.discountPercentage || 0,
  available_sizes: product.sizes,
  available_colors: product.colors,
  stock_quantity: product.quantity,
  is_in_stock: product.inStock,
  is_featured: product.isFeatured || false,
  is_new: product.isNew || false,
  is_on_sale: product.discountPercentage > 0,
});

// Category Mappers
export const mapBackendCategory = (category: any) => ({
  id: category.id,
  name: category.name_ar,
  image: normalizeImageUrl(category.image_url),
  slug: category.slug,
  description: category.description_ar || '',
  productCount: category.product_count || 0,
  order: category.display_order || 0,
  active: category.is_active,
});

export const mapFrontendCategoryToBackend = (category: any) => ({
  name_ar: category.name,
  slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-'),
  description_ar: category.description,
  image_url: category.image,
  display_order: category.order || 0,
  is_active: category.active !== undefined ? category.active : true,
});

// Order Mappers
export const mapBackendOrder = (order: any) => ({
  id: order.id,
  customerName: order.customer_name,
  phone: order.customer_phone,
  email: order.customer_email || '',
  governorate: order.governorate,
  district: order.district,
  address: order.detailed_address,
  village: order.village || '',
  products: order.items?.map((item: any) => ({
    id: item.product,
    name: item.product_name_ar,
    price: parseFloat(item.final_unit_price),
    quantity: item.quantity,
    size: item.selected_size,
    color: item.selected_color,
    image: '/placeholder.svg', // Images not returned in order items
  })) || [],
  subtotal: parseFloat(order.subtotal),
  discount: parseFloat(order.discount_amount || 0),
  shipping: parseFloat(order.shipping_cost),
  total: parseFloat(order.total),
  status: mapBackendOrderStatus(order.status),
  createdAt: order.created_at,
  updatedAt: order.updated_at,
  notes: order.customer_notes,
  adminNotes: order.admin_notes,
});

// Map backend order status to frontend format
export const mapBackendOrderStatus = (status: string): "new" | "processing" | "shipped" | "out-for-delivery" | "delivered" | "cancelled" => {
  const statusMap: Record<string, any> = {
    'pending': 'new',
    'confirmed': 'processing',
    'processing': 'processing',
    'shipped': 'shipped',
    'out_for_delivery': 'out-for-delivery',
    'delivered': 'delivered',
    'cancelled': 'cancelled',
  };
  return statusMap[status] || 'new';
};

// Map frontend order status to backend format
export const mapFrontendOrderStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'new': 'pending',
    'processing': 'confirmed',
    'shipped': 'shipped',
    'out-for-delivery': 'out_for_delivery',
    'delivered': 'delivered',
    'cancelled': 'cancelled',
  };
  return statusMap[status] || 'pending';
};

// Map frontend order to backend format for creation
export const mapFrontendOrderToBackend = (orderData: any) => {
  return {
    customer_name: orderData.fullName,
    customer_phone: orderData.phone,
    customer_email: orderData.email || '',
    governorate: orderData.governorate,
    district: orderData.district,
    village: orderData.village || '',
    detailed_address: orderData.detailedAddress,
    customer_notes: orderData.notes || '',
    subtotal: orderData.subtotal,
    discount_amount: orderData.discountAmount || 0,
    shipping_cost: orderData.shippingCost,
    total: orderData.total,
    items: orderData.items.map((item: any) => ({
      product: item.productId,
      product_name_ar: item.productName,
      product_sku: item.productSku || '',
      selected_size: item.selectedSize || '',
      selected_color: item.selectedColor || '',
      quantity: 1, // Each item represents 1 unit
      unit_price: item.unitPrice,
      discount_percentage: item.discountPercentage || 0,
      final_unit_price: item.finalUnitPrice,
      subtotal: item.finalUnitPrice,
    })),
  };
};

// Customer Mappers (for admin dashboard)
export const mapBackendCustomer = (order: any) => {
  // Since we don't have customer accounts, we aggregate from orders
  return {
    id: order.customer_phone, // Use phone as unique ID
    name: order.customer_name,
    email: order.customer_email || '',
    phone: order.customer_phone,
    governorate: order.governorate,
    totalOrders: 1, // Would need to be calculated from multiple orders
    totalSpending: parseFloat(order.total),
    registrationDate: order.created_at,
    lastOrderDate: order.created_at,
  };
};

// Review Mappers
export const mapBackendReview = (review: any) => ({
  id: review.id,
  productId: review.product,
  productName: review.product_name || '',
  reviewerName: review.reviewer_name,
  rating: review.rating,
  title: review.title_ar || '',
  comment: review.comment_ar || '',
  isApproved: review.is_approved,
  isVerified: review.is_verified_purchase,
  helpfulCount: review.helpful_count || 0,
  createdAt: review.created_at,
});

export const mapFrontendReviewToBackend = (review: any) => ({
  product: review.productId,
  reviewer_name: review.reviewerName,
  rating: review.rating,
  title_ar: review.title,
  comment_ar: review.comment,
});

