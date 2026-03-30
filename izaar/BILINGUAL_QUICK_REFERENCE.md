# Quick Reference: Bilingual Support

## For Developers

### 1. Add Translations to a Component

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return <button>{t('product.addToCart')}</button>;
}
```

### 2. Display Product Names

```typescript
import { useProductLocalization } from '@/hooks/useProductLocalization';

function ProductCard({ product }) {
  const { getProductName, getProductDescription } = useProductLocalization();
  
  return (
    <div>
      <h2>{getProductName(product)}</h2>
      <p>{getProductDescription(product)}</p>
    </div>
  );
}
```

### 3. Format Numbers/Prices

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function PriceDisplay({ amount }) {
  const { language, t } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'ar-EG';
  
  return (
    <span>
      {amount.toLocaleString(locale)} {t('product.egp')}
    </span>
  );
}
```

### 4. Add New Translation Keys

Edit `/client/contexts/LanguageContext.tsx`:

```typescript
const translations: Record<Language, Record<string, string>> = {
  en: {
    // ... existing keys
    'mySection.newKey': 'New English Text',
  },
  ar: {
    // ... existing keys
    'mySection.newKey': 'نص عربي جديد',
  },
};
```

---

## For Content Admins

### Adding Products with English Support

1. Navigate to `/admin/products`
2. Click "Add New Product"
3. **Required Arabic Fields:**
   - اسم المنتج (بالعربية) - Product name in Arabic
   - الوصف المختصر (بالعربية) - Product description in Arabic
4. **Optional English Fields:**
   - Product Name (English) - English product name
   - Product Description (English) - English description
5. Click "Save Product"

**Important Notes:**
- Arabic fields are always required
- English fields are optional but recommended for international customers
- If English fields are empty, Arabic names will show to English users
- Both languages use the same images and specifications

---

## Available Translation Keys

### Common Keys
- `nav.home` - Home
- `nav.categories` - Categories
- `product.addToCart` - Add to Cart
- `product.addToWishlist` - Add to Wishlist
- `product.inStock` - In Stock
- `product.outOfStock` - Out of Stock
- `product.price` - Price
- `product.description` - Description
- `product.egp` - EGP (currency)
- `cart.title` - Shopping Cart
- `checkout.title` - Checkout
- `general.loading` - Loading...

### Full List
See `/client/contexts/LanguageContext.tsx` for complete list of 150+ keys.

---

## Testing

### Browser Console
```javascript
// Check current language
localStorage.getItem('language')

// Change language programmatically
localStorage.setItem('language', 'ar')
localStorage.setItem('language', 'en')

// Reload page after change
location.reload()
```

### Language Switching
1. Open website
2. Look for EN/AR button in header
3. Click to toggle
4. Verify all text updates
5. Reload page - language should persist

---

## Troubleshooting

### Product names not switching?
- Check if `name_en` field is filled in admin
- Verify data mapper includes `name_en`
- Check component uses `getProductName()` helper

### Translation not working?
- Verify key exists in `translations` object
- Check spelling of translation key
- Ensure `useLanguage` hook is imported

### Direction not switching?
- LanguageProvider should wrap entire app
- Check document.documentElement.dir in dev tools
- Verify no CSS overriding direction

---

## Best Practices

1. **Always use `t()` for UI text** - Never hardcode Arabic or English
2. **Use `getProductName()` for product names** - Ensures proper fallback
3. **Format numbers with locale** - Use `toLocaleString(locale)`
4. **Add translations in pairs** - Always add both EN and AR
5. **Test both languages** - Verify layout and text in both directions
6. **Keep keys organized** - Use namespaces (e.g., `product.*`, `cart.*`)

---

## Component Checklist

When creating a new component with text:

- [ ] Import `useLanguage` hook
- [ ] Use `t()` for all UI strings
- [ ] Use `getProductName()` for product names
- [ ] Format prices with locale
- [ ] Add RTL-safe CSS (if needed)
- [ ] Test in both languages
- [ ] Verify no hardcoded text

---

## Quick Commands

```bash
# Frontend directory
cd /var/www/izaar/frontend/izaar

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

---

## Key Files

| File | Purpose |
|------|---------|
| `/client/contexts/LanguageContext.tsx` | Translation system & provider |
| `/client/components/LanguageSwitcher.tsx` | Language toggle button |
| `/client/hooks/useProductLocalization.ts` | Product name/desc helpers |
| `/client/lib/data-mappers.ts` | API data mapping |
| `BILINGUAL_IMPLEMENTATION.md` | Full documentation |

---

## Support

For detailed implementation info, see `BILINGUAL_IMPLEMENTATION.md`

For adding new features, follow the patterns in existing components.

For questions, review the LanguageContext.tsx implementation.


