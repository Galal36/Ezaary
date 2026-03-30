import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get language from localStorage or default to Arabic
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    // Set initial direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const isRTL = language === 'ar';

  // Translation function - returns translated text
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Translation dictionary - comprehensive translations for the entire website
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.categories': 'Categories',
    'nav.newArrivals': 'New Arrivals',
    'nav.bestSellers': 'Best Sellers',
    'nav.sale': 'Sale',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.cart': 'Cart',
    'nav.wishlist': 'Wishlist',
    'nav.account': 'Account',
    'nav.search': 'Search',
    'nav.searchPlaceholder': 'Search for products...',

    // Product
    'product.addToCart': 'Add to Cart',
    'product.addToWishlist': 'Add to Wishlist',
    'product.addedToWishlist': 'Added to Wishlist',
    'product.buyNow': 'Buy Now',
    'product.inStock': 'In Stock',
    'product.outOfStock': 'Out of Stock',
    'product.available': 'Available in Stock',
    'product.notAvailable': 'Not Available',
    'product.size': 'Size',
    'product.color': 'Color',
    'product.quantity': 'Quantity',
    'product.price': 'Price',
    'product.description': 'Description',
    'product.specifications': 'Specifications',
    'product.reviews': 'Reviews',
    'product.rating': 'Rating',
    'product.relatedProducts': 'Related Products',
    'product.similarProducts': 'Similar Products',
    'product.productNotFound': 'Product Not Found',
    'product.productNotAvailable': 'Sorry, the product you are looking for is not available',
    'product.backToHome': 'Back to Home',
    'product.status': 'Status',
    'product.selectSize': 'Please select size',
    'product.selectColor': 'Please select color',
    'product.addedToCart': 'Added to Cart',
    'product.stockAvailable': 'Stock Available',
    'product.piecesOnly': 'pieces only',
    'product.discount': 'Discount',
    'product.egp': 'EGP',

    // Cart
    // Cart
    'cart.empty': 'Your cart is empty',
    'cart.discount': 'Discount',
    'cart.checkout': 'Proceed to Checkout',
    'cart.remove': 'Remove',
    'cart.update': 'Update',
    'cart.itemsInCart': 'items in cart',
    'cart.item': 'Item',
    'cart.items': 'Items',

    // Checkout
    // Checkout


    // Wishlist
    'wishlist.title': 'Wishlist',
    'wishlist.empty': 'Your wishlist is empty',
    'wishlist.emptyDescription': 'Add products to your wishlist to save them for later',
    'wishlist.removeFromWishlist': 'Remove from Wishlist',
    'wishlist.moveToCart': 'Move to Cart',

    // Categories
    // Categories
    'categories.all': 'All Categories',
    'categories.viewAll': 'View All',
    'categories.products': 'Products',
    'categories.noProducts': 'No products found',
    'categories.loading': 'Loading...',

    // Footer
    'footer.aboutUs': 'About Us',
    'footer.contactUs': 'Contact Us',
    'footer.followUs': 'Follow Us',
    'footer.quickLinks': 'Quick Links',
    'footer.customerService': 'Customer Service',
    'footer.shippingPolicy': 'Shipping Policy',
    'footer.returnPolicy': 'Return Policy',
    'footer.privacyPolicy': 'Privacy Policy',
    'footer.termsConditions': 'Terms & Conditions',
    'footer.faq': 'FAQ',
    'footer.allRightsReserved': 'All rights reserved',

    // General
    'general.loading': 'Loading...',
    'general.error': 'Error',
    'general.success': 'Success',
    'general.cancel': 'Cancel',
    'general.confirm': 'Confirm',
    'general.save': 'Save',
    'general.edit': 'Edit',
    'general.delete': 'Delete',
    'general.view': 'View',
    'general.close': 'Close',
    'general.next': 'Next',
    'general.previous': 'Previous',
    'general.search': 'Search',
    'general.filter': 'Filter',
    'general.sort': 'Sort',
    'general.sortBy': 'Sort By',
    'general.show': 'Show',
    'general.hide': 'Hide',
    'general.more': 'More',
    'general.less': 'Less',
    'general.viewMore': 'View More',
    'general.viewLess': 'View Less',
    'general.readMore': 'Read More',
    'general.readLess': 'Read Less',
    'general.seeAll': 'See All',
    'general.backToTop': 'Back to Top',
    'general.share': 'Share',
    'general.copy': 'Copy',
    'general.copied': 'Copied!',

    // Breadcrumb
    'breadcrumb.home': 'Home',
    'breadcrumb.categories': 'Categories',

    // Filters & Sorting
    'filter.priceRange': 'Price Range',
    'filter.brand': 'Brand',
    'filter.size': 'Size',
    'filter.color': 'Color',
    'filter.availability': 'Availability',
    'filter.inStockOnly': 'In Stock Only',
    'filter.onSale': 'On Sale',
    'filter.clearAll': 'Clear All',
    'sort.featured': 'Featured',
    'sort.priceLowToHigh': 'Price: Low to High',
    'sort.priceHighToLow': 'Price: High to Low',
    'sort.newest': 'Newest',
    'sort.bestSelling': 'Best Selling',
    'sort.rating': 'Top Rated',

    // Messages
    'message.loadingFailed': 'Failed to load',
    'message.saveFailed': 'Failed to save',
    'message.deleteConfirm': 'Are you sure you want to delete?',
    'message.noResults': 'No results found',
    'message.tryAgain': 'Try Again',

    // Search
    'search.results': 'Search Results',
    'search.resultsFor': 'Results for',
    'search.noResults': 'No results found',
    'search.tryDifferentKeywords': 'Try different keywords',

    // Order
    'order.orderNumber': 'Order Number',
    'order.orderDate': 'Order Date',
    'order.orderStatus': 'Order Status',
    'order.orderTotal': 'Order Total',
    'order.orderDetails': 'Order Details',
    'order.trackOrder': 'Track Order',
    'order.new': 'New',
    'order.processing': 'Processing',
    'order.shipped': 'Shipped',
    'order.delivered': 'Delivered',
    'order.cancelled': 'Cancelled',

    // Account
    'account.myAccount': 'My Account',
    'account.orders': 'Orders',
    'account.profile': 'Profile',
    'account.addresses': 'Addresses',
    'account.logout': 'Logout',

    // About
    'about.mission': 'Our Mission',
    'about.vision': 'Our Vision',

    // Admin specific
    'admin.dashboard': 'Dashboard',
    'admin.products': 'Products',
    'admin.orders': 'Orders',
    'admin.customers': 'Customers',
    'admin.reports': 'Reports',
    'admin.settings': 'Settings',

    // Home page specific
    'home.specialOffers': 'Special Offers',
    'home.specialOffersDesc': 'Discover the best offers and discounts on selected products',
    'home.noOffersAvailable': 'No offers available now',
    'home.loadMoreOffers': 'Load More Offers',
    'home.browseAllProducts': 'Browse All Products',
    'home.needHelp': 'Do you have questions or need help?',
    'home.needHelpDesc': 'We are here to help. Contact us via WhatsApp or any other means of communication',
    'home.contactWhatsApp': 'Contact us via WhatsApp',
    'home.fastShipping': 'Fast Shipping',
    'home.fastShippingDesc': 'Delivery within 3-5 business days',
    'home.competitivePrices': 'Competitive Prices',
    'home.competitivePricesDesc': 'Best prices in the market',
    'home.qualityGuarantee': 'Quality Guarantee',
    'home.qualityGuaranteeDesc': 'Original and reliable products',

    // Hero section custom
    'hero.ezaaryMen': 'Ezaary Men',
    'hero.ezaaryWomen': 'Ezaary Women',
    'hero.mostModernClothes': 'Most modern clothes',
    'hero.discountUpTo30': 'Discounts up to 30%',
    'hero.discountUpTo20': 'Discounts up to 20%',
    'hero.discoverMore': 'Discover More',

    // Footer
    'footer.izaaryDescription': 'Ezaary is your trusted store in Egypt with fast shipping and excellent customer service',
    'footer.quickLinksTitle': 'Quick Links',
    'footer.contactTitle': 'Contact Us',
    'footer.followTitle': 'Follow Us',
    'footer.newsletter': 'Subscribe to our newsletter',
    'footer.emailPlaceholder': 'Your email',
    'footer.subscribe': 'Subscribe',
    'footer.copyright': '© 2024 Ezaary. All rights reserved',
    'footer.location': 'Assiut, Egypt',

    // About page
    'about.title': 'About Ezaary',
    'about.subtitle': 'Ezaary... We combine quality and affordable prices',
    'about.ourStory': 'Who Are We?',
    'about.storyP1': 'Since our establishment in 2025, we have set one goal before our eyes: to provide high-quality clothing at reasonable prices. Today, we are happy to serve our customers throughout Egypt.\nContinuous customer service, post-sale evaluation and delivery follow-up, you may find each one separately elsewhere, but you will not find them all together except at Ezaary.',
    'about.storyP2': '',
    'about.storyP3': '',
    'about.storyP4': '',
    'about.storyP5': '',
    'about.ourValues': 'Why Ezaary?',
    'about.qualityFirst': 'Unlimited Diversity',
    'about.qualityFirstDesc': 'We offer the latest fashion trends for men and women, whether from our direct stock or through our network of trusted partners for the most famous global brands.',
    'about.customerFocus': 'Trust and Security',
    'about.customerFocusDesc': 'Transparency is the foundation of our dealings.',
    'about.continuousInnovation': 'After-Sales Service',
    'about.continuousInnovationDesc': 'Shop with peace of mind, with a flexible exchange and return policy for 15 days.',
    'about.whyChooseUs': '',
    'about.whyReason1': '',
    'about.whyReason2': '',
    'about.whyReason3': '',
    'about.whyReason4': '',
    'about.whyReason5': '',
    'about.whyReason6': 'We are here to make your look better, every day.',

    // Categories page
    'categories.title': 'All Categories',
    'categories.subtitle': 'Choose from our wide range of categories and find what you\'re looking for easily',
    'categories.loadFailed': 'Failed to load categories',
    'categories.noCategories': 'No categories available at the moment',
    'categories.diverseCategories': 'Diverse Categories',
    'categories.luxuryProducts': 'Luxury Products',
    'categories.guaranteedQuality': 'Guaranteed Quality',

    // Privacy Policy page
    'privacy.title': 'Privacy Policy',
    'privacy.paragraph1': 'The online store deals professionally with its users by clarifying all points that the buyer needs to know. We care about every detail of the order from the moment it is activated and requested until delivery, as well as after-sales services.',
    'privacy.paragraph2': 'Ezaary also builds the general structure of the store in a way that satisfies all customers. The customer should open and inspect their merchandise upon receipt, and there is no problem if they do not find what they ordered - they can return the order. When returning, shipping costs must be paid, except if the order was incorrect from the store, in which case Ezaary bears the shipping costs.',
    'privacy.paragraph3': 'You must add your phone number and email address - the email is also necessary because it is used to send you a link to rate the product you purchased.',
    'privacy.paragraph4': 'We allow our partners to display their trusted products on our platform, you can contact us to know more details',

    // Shipping Policy page
    'shipping.title': 'Shipping and Return Policies',
    'shipping.delivery': 'Delivery',
    'shipping.deliveryInfo': 'Delivery within Assiut Governorate and within Assiut centers and villages. Please note that if the delivery location is far away, we may contact the buyer to increase shipping costs on the order only.',
    'shipping.deliveryAssiut': 'Delivery within Assiut:',
    'shipping.deliveryAssiutTime': '1 to 3 business days',
    'shipping.deliveryCairo': 'To Cairo Governorate:',
    'shipping.deliveryCairoTime': '2 to 4 business days',
    'shipping.returnPolicy': 'Exchange and Return Policy | Ezaary',
    'shipping.returnPolicyIntro': 'Ezaary always strives for customer satisfaction and after-sales services. If there is any problem with the product, whether it\'s the size or any defect, you can return it.',
    'shipping.returnConditions': 'Return and Exchange Conditions',
    'shipping.returnFirst': 'First',
    'shipping.returnFirst1': 'Products can be returned or exchanged within 3 days of receiving the order.',
    'shipping.returnFirst2': 'The product must be in its original condition (unused - unwashed)',
    'shipping.returnFirst3': 'Returns will not be accepted in the following cases:',
    'shipping.returnFirst3a': 'Product damage or soiling after receipt.',
    'shipping.returnFirst3b': 'Products that have been customized or printed specifically based on customer request.',
    'shipping.returnSecond': 'Second: Steps for Exchange or Return',
    'shipping.returnSecond1': 'Contact Ezaary customer service via WhatsApp or Facebook page.',
    'shipping.returnSecond2': 'Mention the order number and reason for return or exchange.',
    'shipping.returnSecond3': 'We will arrange with the shipping company to pick up the product from you.',
    'shipping.returnSecond4': 'After we receive and inspect the product, we will:',
    'shipping.returnSecond4a': 'Exchange the product for another according to your preference.',
    'shipping.returnSecond4b': 'Or refund the amount using the same payment method used (within 3 to 5 business days).',
    'shipping.returnThird': 'Third: Shipping Costs',
    'shipping.returnThird1': 'In case of exchange or return due to an error from Ezaary (wrong size - manufacturing defect), we bear the full cost.',
    'shipping.returnThird2': 'In case the customer changes their mind or an inappropriate size was selected by mistake, the customer bears the shipping cost.',
    'shipping.ourGoal': 'Our Goal',
    'shipping.ourGoalText': 'At Ezaary, one of our highest priorities is customer satisfaction. Therefore, we are happy to communicate with us for evaluation or in case of any problem.',

    // Cart page
    'cart.title': 'Your Cart',
    'cart.emptyTitle': 'Your Cart',
    'cart.emptyDescription': 'Currently there are no products in your cart. Start shopping and add some amazing products!',
    'cart.exploreProducts': 'Explore Products',
    'cart.continueShopping': 'Continue Shopping',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.shippingFree': 'Free',
    'cart.total': 'Total',
    'cart.completeOrder': 'Complete Order',
    'cart.clearCart': 'Clear Cart',
    'cart.available': 'Available',
    'cart.pieces': 'pieces',
    'cart.delete': 'Delete',
    'cart.addMoreForFreeShipping': 'Add {amount} EGP more to get free shipping!',
    'cart.orderSummary': 'Order Summary',

    // Checkout page
    'checkout.title': 'Complete Order',
    'checkout.productsAndSpecs': 'Products & Specifications',
    'checkout.unit': 'Unit',
    'checkout.selectSize': 'Select Size',
    'checkout.size': 'Size',
    'checkout.selectColor': 'Select Color',
    'checkout.color': 'Color',
    'checkout.customerInfo': 'Customer Information',
    'checkout.fullName': 'Full Name',
    'checkout.fullNamePlaceholder': 'Enter your full name',
    'checkout.phone': 'Phone Number',
    'checkout.phonePlaceholder': '01012345678',
    'checkout.phoneExample': 'Example: 01012345678',
    'checkout.email': 'Email Address (Optional)',
    'checkout.emailPlaceholder': 'example@email.com',
    'checkout.shippingAddress': 'Shipping Address',
    'checkout.governorate': 'Governorate',
    'checkout.district': 'District (Optional)',
    'checkout.selectDistrict': 'Select District',
    'checkout.village': 'Village (Optional)',
    'checkout.selectVillage': 'Select Village',
    'checkout.detailedAddress': 'Detailed Address',
    'checkout.detailedAddressPlaceholder': 'Street name, building number, apartment number, landmarks...',
    'checkout.customAddress': 'Additional Address (if district or village is not in the list)',
    'checkout.customAddressPlaceholder': 'Write the full address here...',
    'checkout.notes': 'Additional Notes (Optional)',
    'checkout.notesPlaceholder': 'Any special notes about the order...',
    'checkout.orderSummary': 'Order Summary',
    'checkout.couponCode': 'Coupon Code',
    'checkout.couponPlaceholder': 'Enter coupon code',
    'checkout.apply': 'Apply',
    'checkout.remove': 'Remove',
    'checkout.discount': 'Discount',
    'checkout.submitOrder': 'Submit Order',
    'checkout.agreeTerms': 'By clicking "Submit Order" you agree to the store\'s terms and conditions',
    'checkout.availableInStock': 'Available in stock',
    'checkout.pieces': 'pieces',
    'checkout.addMoreForFreeShipping': 'Add {amount} EGP more to get free shipping!',
    'checkout.promotionalMessage': '🎉 Extra {percentage}% discount applied for buying 2 or more items!',
    'checkout.errors.fullNameRequired': 'Please enter your full name',
    'checkout.errors.phoneRequired': 'Please enter your phone number',
    'checkout.errors.phoneInvalid': 'Phone number is incorrect. Must start with 010, 011, 012, or 015',
    'checkout.errors.addressRequired': 'Please enter detailed address',
    'checkout.errors.sizeRequired': 'Please select size for unit {unit} of {product}',
    'checkout.errors.colorRequired': 'Please select color for unit {unit} of {product}',
    'checkout.errors.quantityInvalid': 'Quantity must be greater than zero',
    'checkout.errors.stockLimit': 'Available in stock: {quantity} pieces only',
    'checkout.success.orderPlaced': 'Your order has been sent successfully!',
    'checkout.errors.orderFailed': 'An error occurred while sending the order. Please try again.',
    'checkout.coupon.errors.required': 'Please enter coupon code',
    'checkout.coupon.errors.invalid': 'Coupon code is incorrect',
    'checkout.coupon.errors.expired': 'Coupon code is incorrect or expired',
    'checkout.coupon.success': 'Coupon applied successfully! Discount {percentage}%',

    // Payment Methods
    'payment.selectMethod': 'Select Payment Method',
    'payment.cashOnDelivery': 'Pay on Delivery',
    'payment.cashOnDeliveryDesc': 'Pay in cash when you receive your order',
    'payment.vodafoneCash': 'Pay via Vodafone Cash',
    'payment.vodafoneCashDesc': 'Manual transfer via Vodafone Cash',
    'payment.instapay': 'Pay via Instapay',
    'payment.instapayDesc': 'Manual transfer via Instapay',
    'payment.instructions': 'Payment Instructions',
    'payment.transferAmount': 'Please transfer **{amount} EGP** via **{method}** to the following number:',
    'payment.phoneNumber': 'Phone Number:',
    'payment.uploadScreenshot': 'Upload Payment Screenshot',
    'payment.screenshotHelper': 'Upload a screenshot of the payment confirmation (Max size: 20MB)',
    'payment.afterUpload': 'After completing the transfer, upload a screenshot of the payment below.',
    'payment.confirmationMessage': 'Once you submit the order, our customer service team will review and confirm your payment shortly.',
    'payment.errors.screenshotRequired': 'Please upload a payment screenshot',
    'payment.errors.fileTooBig': 'File size must not exceed 20MB',
    'payment.errors.invalidFileType': 'Only JPG, PNG, and JPEG files are allowed',
    'payment.successMessage': 'Thank you! Your order has been received. Our customer service team will contact you soon to confirm the payment.',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.categories': 'الفئات',
    'nav.newArrivals': 'الوافدون الجدد',
    'nav.bestSellers': 'الأكثر مبيعاً',
    'nav.sale': 'التخفيضات',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'nav.cart': 'السلة',
    'nav.wishlist': 'المفضلة',
    'nav.account': 'الحساب',
    'nav.search': 'البحث',
    'nav.searchPlaceholder': 'ابحث عن المنتجات...',

    // Product
    'product.addToCart': 'أضف للسلة',
    'product.addToWishlist': 'أضف للمفضلة',
    'product.addedToWishlist': 'مضاف للمفضلة',
    'product.buyNow': 'اشتري الآن',
    'product.inStock': 'متوفر',
    'product.outOfStock': 'غير متوفر',
    'product.available': 'متوفر في المخزن',
    'product.notAvailable': 'غير متوفر',
    'product.size': 'المقاس',
    'product.color': 'اللون',
    'product.quantity': 'الكمية',
    'product.price': 'السعر',
    'product.description': 'الوصف',
    'product.specifications': 'المواصفات',
    'product.reviews': 'التقييمات',
    'product.rating': 'التقييم',
    'product.relatedProducts': 'منتجات مشابهة',
    'product.similarProducts': 'منتجات مشابهة',
    'product.productNotFound': 'المنتج غير موجود',
    'product.productNotAvailable': 'نعتذر، المنتج الذي تبحث عنه غير متاح',
    'product.backToHome': 'العودة للرئيسية',
    'product.status': 'الحالة',
    'product.selectSize': 'يرجى اختيار المقاس',
    'product.selectColor': 'يرجى اختيار اللون',
    'product.addedToCart': 'تمت الإضافة للسلة',
    'product.stockAvailable': 'المتاح في المخزون',
    'product.piecesOnly': 'قطعة فقط',
    'product.discount': 'خصم',
    'product.egp': 'جنيه',

    // Cart
    'cart.empty': 'سلتك فارغة',
    'cart.discount': 'الخصم',
    'cart.checkout': 'إتمام الطلب',
    'cart.remove': 'إزالة',
    'cart.update': 'تحديث',
    'cart.itemsInCart': 'منتج في السلة',
    'cart.item': 'منتج',
    'cart.items': 'منتجات',

    // Checkout
    'checkout.shippingInfo': 'معلومات الشحن',
    'checkout.billingInfo': 'معلومات الفاتورة',
    'checkout.paymentMethod': 'طريقة الدفع',
    'checkout.placeOrder': 'تأكيد الطلب',
    'checkout.optional': 'اختياري',
    'checkout.required': 'مطلوب',
    'checkout.cashOnDelivery': 'الدفع عند الاستلام',
    'checkout.processing': 'جاري المعالجة...',

    // Wishlist
    'wishlist.title': 'المفضلة',
    'wishlist.empty': 'قائمة المفضلة فارغة',
    'wishlist.emptyDescription': 'أضف منتجات لقائمة المفضلة لحفظها لوقت لاحق',
    'wishlist.removeFromWishlist': 'إزالة من المفضلة',
    'wishlist.moveToCart': 'نقل للسلة',

    // Categories
    // Categories keys moved to the end of the section


    // Footer
    'footer.aboutUs': 'من نحن',
    'footer.contactUs': 'اتصل بنا',
    'footer.followUs': 'تابعنا',
    'footer.quickLinks': 'روابط سريعة',
    'footer.customerService': 'خدمة العملاء',
    'footer.shippingPolicy': 'سياسة الشحن',
    'footer.returnPolicy': 'سياسة الإرجاع',
    'footer.privacyPolicy': 'سياسة الخصوصية',
    'footer.termsConditions': 'الشروط والأحكام',
    'footer.faq': 'الأسئلة الشائعة',
    'footer.allRightsReserved': 'جميع الحقوق محفوظة',

    // General
    'general.loading': 'جاري التحميل...',
    'general.error': 'خطأ',
    'general.success': 'نجح',
    'general.cancel': 'إلغاء',
    'general.confirm': 'تأكيد',
    'general.save': 'حفظ',
    'general.edit': 'تعديل',
    'general.delete': 'حذف',
    'general.view': 'عرض',
    'general.close': 'إغلاق',
    'general.next': 'التالي',
    'general.previous': 'السابق',
    'general.search': 'بحث',
    'general.filter': 'تصفية',
    'general.sort': 'ترتيب',
    'general.sortBy': 'ترتيب حسب',
    'general.show': 'إظهار',
    'general.hide': 'إخفاء',
    'general.more': 'المزيد',
    'general.less': 'أقل',
    'general.viewMore': 'عرض المزيد',
    'general.viewLess': 'عرض أقل',
    'general.readMore': 'اقرأ المزيد',
    'general.readLess': 'اقرأ أقل',
    'general.seeAll': 'عرض الكل',
    'general.backToTop': 'العودة للأعلى',
    'general.share': 'مشاركة',
    'general.copy': 'نسخ',
    'general.copied': 'تم النسخ!',

    // Breadcrumb
    'breadcrumb.home': 'الرئيسية',
    'breadcrumb.categories': 'الفئات',

    // Filters & Sorting
    'filter.priceRange': 'نطاق السعر',
    'filter.brand': 'العلامة التجارية',
    'filter.size': 'المقاس',
    'filter.color': 'اللون',
    'filter.availability': 'التوفر',
    'filter.inStockOnly': 'المتوفر فقط',
    'filter.onSale': 'عليه تخفيض',
    'filter.clearAll': 'مسح الكل',
    'sort.featured': 'مميز',
    'sort.priceLowToHigh': 'السعر: من الأقل للأعلى',
    'sort.priceHighToLow': 'السعر: من الأعلى للأقل',
    'sort.newest': 'الأحدث',
    'sort.bestSelling': 'الأكثر مبيعاً',
    'sort.rating': 'الأعلى تقييماً',

    // Messages
    'message.loadingFailed': 'فشل التحميل',
    'message.saveFailed': 'فشل الحفظ',
    'message.deleteConfirm': 'هل أنت متأكد من الحذف؟',
    'message.noResults': 'لا توجد نتائج',
    'message.tryAgain': 'حاول مرة أخرى',

    // Search
    'search.results': 'نتائج البحث',
    'search.resultsFor': 'نتائج البحث عن',
    'search.noResults': 'لا توجد نتائج',
    'search.tryDifferentKeywords': 'جرب كلمات بحث مختلفة',

    // Order
    'order.orderNumber': 'رقم الطلب',
    'order.orderDate': 'تاريخ الطلب',
    'order.orderStatus': 'حالة الطلب',
    'order.orderTotal': 'إجمالي الطلب',
    'order.orderDetails': 'تفاصيل الطلب',
    'order.trackOrder': 'تتبع الطلب',
    'order.new': 'جديد',
    'order.processing': 'قيد المعالجة',
    'order.shipped': 'تم الشحن',
    'order.delivered': 'تم التوصيل',
    'order.cancelled': 'ملغي',

    // Account
    'account.myAccount': 'حسابي',
    'account.orders': 'الطلبات',
    'account.profile': 'الملف الشخصي',
    'account.addresses': 'العناوين',
    'account.logout': 'تسجيل الخروج',

    // About
    // About keys moved to the end of the section


    // Admin specific
    'admin.dashboard': 'لوحة التحكم',
    'admin.products': 'المنتجات',
    'admin.orders': 'الطلبات',
    'admin.customers': 'العملاء',
    'admin.reports': 'التقارير',
    'admin.settings': 'الإعدادات',

    // Home page specific
    'home.specialOffers': 'عروض خاصة',
    'home.specialOffersDesc': 'اكتشف أفضل العروض والخصومات على المنتجات المختارة',
    'home.noOffersAvailable': 'لا توجد عروض حالياً',
    'home.loadMoreOffers': 'عرض المزيد من العروض',
    'home.browseAllProducts': 'تصفح كل المنتجات',
    'home.needHelp': 'هل لديك أسئلة أو تحتاج مساعدة؟',
    'home.needHelpDesc': 'نحن هنا للمساعدة. تواصل معنا عبر WhatsApp أو أي وسيلة اتصال أخرى',
    'home.contactWhatsApp': 'تواصل معنا عبر WhatsApp',
    'home.fastShipping': 'شحن سريع',
    'home.fastShippingDesc': 'التوصيل خلال 3-5 أيام عمل',
    'home.competitivePrices': 'أسعار منافسة',
    'home.competitivePricesDesc': 'أفضل الأسعار في السوق',
    'home.qualityGuarantee': 'ضمان الجودة',
    'home.qualityGuaranteeDesc': 'منتجات أصلية وموثوقة',

    // Hero section custom
    'hero.ezaaryMen': 'إزاري رجالي',
    'hero.ezaaryWomen': 'إزاري نسائي',
    'hero.mostModernClothes': 'أحدث صيحات الموضة',
    'hero.discountUpTo30': 'خصومات تصل الي 30 في المائة لا تنتظر',
    'hero.discountUpTo20': 'خصومات تصل الي 20 في المائة',
    'hero.discoverMore': 'اكتشف المزيد',

    // Footer
    'footer.izaaryDescription': 'إزاري متجرك الموثوق في مصر مع شحن سريع وخدمة عملاء متميزة',
    'footer.quickLinksTitle': 'روابط سريعة',
    'footer.contactTitle': 'تواصل معنا',
    'footer.followTitle': 'تابعنا',
    'footer.newsletter': 'اشترك في نشرتنا البريدية',
    'footer.emailPlaceholder': 'بريدك الإلكتروني',
    'footer.subscribe': 'اشترك',
    'footer.copyright': '© 2024 إزاري. جميع الحقوق محفوظة',
    'footer.location': 'القاهرة، مصر',

    // About page
    'about.title': 'عن إزاري',
    'about.subtitle': 'إزاري.. نجمع بين الجودة والسعر المناسب',
    'about.ourStory': 'من نحن؟',
    'about.mission': 'مهمتنا',
    'about.vision': 'رؤيتنا',
    'about.storyP1': 'منذ تأسيسنا عام 2025، وضعنا هدفاً واحداً نصب أعيننا: توفير ملابس عالية الجودة بأسعار معقولة. اليوم، نحن سعداء بأن نخدم عملاءنا في جميع أنحاء مصر.\nخدمة عملاء مستمرة، تقييم بعد البيع ومتابعة للتوصيل، قد تجد كل واحدة علي حدة في مكان اخر، لكن لا تجدها مجتمعة إلا في إزاري.',
    'about.storyP2': '',
    'about.storyP3': '',
    'about.storyP4': '',
    'about.storyP5': '',
    'about.ourValues': 'لماذا إزاري؟',
    'about.qualityFirst': 'تنوع بلا حدود',
    'about.qualityFirstDesc': 'نقدم أحدث صيحات الموضة الرجالية والنسائية، سواء من مخزوننا المباشر أو عبر شبكة شركائنا الموثوقين لأشهر الماركات العالمية.',
    'about.customerFocus': 'ثقة وأمان',
    'about.customerFocusDesc': 'الشفافية هي أساس تعاملنا.',
    'about.continuousInnovation': 'خدمة ما بعد البيع',
    'about.continuousInnovationDesc': 'تسوق وأنت مطمئن، مع سياسة استبدال واسترجاع مرنة لمدة 15 يوماً.',
    'about.whyChooseUs': '',
    'about.whyReason1': '',
    'about.whyReason2': '',
    'about.whyReason3': '',
    'about.whyReason4': '',
    'about.whyReason5': '',
    'about.whyReason6': 'نحن هنا لنجعل إطلالتك أفضل، كل يوم.',

    // Categories page
    'categories.title': 'جميع الفئات',
    'categories.subtitle': 'اختر من بين مجموعتنا الواسعة من الفئات وجد ما تبحث عنه بسهولة',
    'categories.loadFailed': 'فشل تحميل الفئات',
    'categories.noCategories': 'لا توجد فئات متاحة حالياً',
    'categories.diverseCategories': 'فئات متنوعة',
    'categories.luxuryProducts': 'منتج فاخر',
    'categories.guaranteedQuality': 'جودة مضمونة',

    // Privacy Policy page
    'privacy.title': 'الخصوصية',
    'privacy.paragraph1': 'يقوم المتجر الإلكتروني بالتعامل بشكل احترافي مع مستخدميه من خلال توضيح جميع النقاط التي يلزم للمشتري معرفته، ونهتم بكل تفاصيل الطلب من حين تفعيله وطلبه إلي توصيله وكذلك الخدمات في ما بعد البيع.',
    'privacy.paragraph2': 'كذلك تبني إزاري الهيكل العام للمتجر بشكل يرضي جميع العملاء حيث ينبغي للعميل فتح بضاعته ومعاينتها عند الإستلام ولا مانع إذا لم يجد ما طلبه موجودا أن يرد الطلب، مع اشتراط عند الاسترداد دفع مصاريف الشحن إلا إذا كان الطلب بشكل خاطيء من المتجر فحينها تتحمل إزاري مصاريف الشحن.',
    'privacy.paragraph3': 'ينبغي عليك إضافة رقم الهاتف والبريد الإلكتروني - يعتبر البريد ضروريا أيضا لأنه يرسل عليه رابط تقييم المنتج الذي اشتريته.',
    'privacy.paragraph4': 'نسمح لشركائنا بعرض منتجاتهم الموثوقة لدي منصتنا، يمكنك التواصل لمعرفة تفاصيل أكثر',

    // Shipping Policy page
    'shipping.title': 'سياسات التوصيل والاسترداد',
    'shipping.delivery': 'التوصيل',
    'shipping.deliveryInfo': 'التوصيل  إلي جميع محافظات |مراكز | قري الجمهورية، مع العلم إذا كان الموقع المراد التوصيل إليه نائيا في المحافظة قد يتم التواصل مع المشتري لزيادة مصاريف الشحن علي الاورد فقط.',
    'shipping.deliveryAssiut': 'التوصيل داخل أسيوط:',
    'shipping.deliveryAssiutTime': 'من 1 إلى 3 أيام عمل',
    'shipping.deliveryCairo': 'إلي محافظة القاهرة:',
    'shipping.deliveryCairoTime': 'من 2 إلى 4 أيام عمل',
    'shipping.deliveryAll': 'التوصيل الي جميع محافظات | مراكز | قري الجمهورية',
    'shipping.returnPolicy': 'سياسة الاستبدال والاسترجاع | إزاري',
    'shipping.returnPolicyIntro': 'إزاري تحرص دائما علي رضا العملاء وخدمات ما بعد البيع. لو فيه أي مشكلة في المنتج سواء المقاس أو أي عيب تقدر ترجعه.',
    'shipping.returnConditions': 'شروط الاسترجاع والاستبدال',
    'shipping.returnFirst': 'أولًا',
    'shipping.returnFirst1': 'يمكن استرجاع أو استبدال المنتج خلال 3 أيام من استلام الطلب.',
    'shipping.returnFirst2': 'لازم يكون المنتج بحالته الأصلية (غير مستخدم – غير مغسول)',
    'shipping.returnFirst3': 'لا يتم قبول المرتجعات في حالة:',
    'shipping.returnFirst3a': 'تلف أو إتساخ المنتج بعد الاستلام.',
    'shipping.returnFirst3b': 'منتجات تم تفصيلها أو طباعتها خصيصًا بناءً على طلب العميل.',
    'shipping.returnSecond': 'ثانيًا: خطوات الاستبدال أو الاسترجاع',
    'shipping.returnSecond1': 'تواصل مع خدمة عملاء إزاري عبر واتساب أو صفحة الفيس.',
    'shipping.returnSecond2': 'اذكر رقم الطلب وسبب الاسترجاع أو الاستبدال.',
    'shipping.returnSecond3': 'هنرتب مع شركة الشحن لاستلام المنتج من عندك.',
    'shipping.returnSecond4': 'بعد استلامنا المنتج وفحصه، بنقوم بـ:',
    'shipping.returnSecond4a': 'استبدال المنتج بآخر حسب رغبتك.',
    'shipping.returnSecond4b': 'أو استرجاع المبلغ بنفس وسيلة الدفع المستخدمة (خلال 3 إلى 5 أيام عمل).',
    'shipping.returnThird': 'ثالثًا: تكلفة الشحن',
    'shipping.returnThird1': 'في حالة الاستبدال أو الاسترجاع بسبب خطأ من إزاري (مقاس خاطئ – عيب تصنيع)، نتحمل التكلفة كاملة.',
    'shipping.returnThird2': 'في حالة تغيير رأي العميل أو مقاس غير مناسب تم اختياره خطأ، يتحمل العميل تكلفة الشحن.',
    'shipping.ourGoal': 'هدفنا',
    'shipping.ourGoalText': 'في إزاري، أحد أغلي أولوياتنا رضا العميل. لذلك نسعد بالتواصل معنا للتقييم أو في حالة وجود أي مشكلة.',

    // Cart page
    'cart.title': 'السلة الخاصة بك',
    'cart.emptyTitle': 'السلة الخاصة بك',
    'cart.emptyDescription': 'حالياً لا توجد منتجات في سلتك. ابدأ التسوق واضف بعض المنتجات المميزة!',
    'cart.exploreProducts': 'استكشف المنتجات',
    'cart.continueShopping': 'متابعة التسوق',
    'cart.subtotal': 'الإجمالي',
    'cart.shipping': 'الشحن',
    'cart.shippingFree': 'مجاني',
    'cart.total': 'الإجمالي',
    'cart.completeOrder': 'إتمام الطلب',
    'cart.clearCart': 'تفريغ السلة',
    'cart.available': 'المتاح',
    'cart.pieces': 'قطعة',
    'cart.delete': 'حذف',
    'cart.addMoreForFreeShipping': '💡 أضف {amount} جنيه أخرى للحصول على شحن مجاني!',
    'cart.orderSummary': 'ملخص الطلب',

    // Checkout page
    'checkout.title': 'إتمام الطلب',
    'checkout.productsAndSpecs': 'المنتجات والمواصفات',
    'checkout.unit': 'الوحدة',
    'checkout.selectSize': 'اختر المقاس',
    'checkout.size': 'المقاس',
    'checkout.selectColor': 'اختر اللون',
    'checkout.color': 'اللون',
    'checkout.customerInfo': 'بيانات العميل',
    'checkout.fullName': 'الاسم الكامل',
    'checkout.fullNamePlaceholder': 'أدخل اسمك الكامل',
    'checkout.phone': 'رقم الهاتف',
    'checkout.phonePlaceholder': '01012345678',
    'checkout.phoneExample': 'مثال: 01012345678',
    'checkout.email': 'البريد الإلكتروني (اختياري)',
    'checkout.emailPlaceholder': 'example@email.com',
    'checkout.shippingAddress': 'عنوان الشحن',
    'checkout.governorate': 'المحافظة',
    'checkout.district': 'المركز (اختياري)',
    'checkout.selectDistrict': 'اختر المركز',
    'checkout.village': 'القرية (اختياري)',
    'checkout.selectVillage': 'اختر القرية',
    'checkout.detailedAddress': 'العنوان التفصيلي',
    'checkout.detailedAddressPlaceholder': 'اسم الشارع، رقم العمارة، رقم الشقة، علامات مميزة...',
    'checkout.customAddress': 'عنوان إضافي (إذا كان المركز أو القرية غير موجودة في القائمة)',
    'checkout.customAddressPlaceholder': 'اكتب العنوان الكامل هنا...',
    'checkout.notes': 'ملاحظات إضافية (اختياري)',
    'checkout.notesPlaceholder': 'أي ملاحظات خاصة بالطلب...',
    'checkout.orderSummary': 'ملخص الطلب',
    'checkout.couponCode': 'كود الكوبون',
    'checkout.couponPlaceholder': 'أدخل كود الكوبون',
    'checkout.apply': 'تطبيق',
    'checkout.remove': 'إزالة',
    'checkout.discount': 'خصم',
    'checkout.submitOrder': 'إرسال الطلب',
    'checkout.agreeTerms': 'بالضغط على "إرسال الطلب" فإنك توافق على شروط وأحكام المتجر',
    'checkout.availableInStock': 'المتاح في المخزون',
    'checkout.pieces': 'قطعة',
    'checkout.addMoreForFreeShipping': '💡 أضف {amount} جنيه أخرى للحصول على شحن مجاني!',
    'checkout.promotionalMessage': '🎉 تم تطبيق خصم إضافي {percentage}% لأنك اشتريت قطعتين أو أكثر',
    'checkout.errors.fullNameRequired': 'الرجاء إدخال الاسم الكامل',
    'checkout.errors.phoneRequired': 'الرجاء إدخال رقم الهاتف',
    'checkout.errors.phoneInvalid': 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 010، 011، 012، أو 015',
    'checkout.errors.addressRequired': 'الرجاء إدخال العنوان التفصيلي',
    'checkout.errors.sizeRequired': 'الرجاء اختيار المقاس للوحدة {unit} من {product}',
    'checkout.errors.colorRequired': 'الرجاء اختيار اللون للوحدة {unit} من {product}',
    'checkout.errors.quantityInvalid': 'الكمية يجب أن تكون أكبر من صفر',
    'checkout.errors.stockLimit': 'المتاح في المخزون: {quantity} قطعة فقط',
    'checkout.success.orderPlaced': 'تم إرسال طلبك بنجاح!',
    'checkout.errors.orderFailed': 'حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى.',
    'checkout.coupon.errors.required': 'الرجاء إدخال كود الكوبون',
    'checkout.coupon.errors.invalid': 'كود الكوبون غير صحيح',
    'checkout.coupon.errors.expired': 'كود الكوبون غير صحيح أو منتهي الصلاحية',
    'checkout.coupon.success': 'تم تطبيق الكوبون بنجاح! خصم {percentage}%',

    // Payment Methods
    'payment.selectMethod': 'اختر طريقة الدفع',
    'payment.cashOnDelivery': 'الدفع عند الاستلام',
    'payment.cashOnDeliveryDesc': 'ادفع نقداً عند استلام طلبك',
    'payment.vodafoneCash': 'الدفع عبر فودافون كاش',
    'payment.vodafoneCashDesc': 'تحويل يدوي عبر فودافون كاش',
    'payment.instapay': 'الدفع عبر إنستاباي',
    'payment.instapayDesc': 'تحويل يدوي عبر إنستاباي',
    'payment.instructions': 'تعليمات الدفع',
    'payment.transferAmount': 'يرجى تحويل **{amount} جنيه** عبر **{method}** إلى الرقم التالي:',
    'payment.phoneNumber': 'رقم الهاتف:',
    'payment.uploadScreenshot': 'رفع صورة تأكيد الدفع',
    'payment.screenshotHelper': 'قم برفع صورة شاشة لتأكيد الدفع (الحد الأقصى: 20 ميجابايت)',
    'payment.afterUpload': 'بعد إتمام التحويل، قم برفع صورة شاشة للدفع أدناه.',
    'payment.confirmationMessage': 'بمجرد إرسال الطلب، سيقوم فريق خدمة العملاء لدينا بمراجعة وتأكيد الدفع الخاص بك قريباً.',
    'payment.errors.screenshotRequired': 'الرجاء رفع صورة تأكيد الدفع',
    'payment.errors.fileTooBig': 'حجم الملف يجب ألا يتجاوز 20 ميجابايت',
    'payment.errors.invalidFileType': 'يُسمح فقط بملفات JPG و PNG و JPEG',
    'payment.successMessage': 'شكراً لك! تم استلام طلبك. سيتواصل معك فريق خدمة العملاء قريباً لتأكيد الدفع.',
  },
};


