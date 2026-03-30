# Quick Verification Guide

## How to Test the Language Fixes

### Step 1: Clear Browser Cache
**Important:** You MUST clear your browser cache or do a hard refresh to see the changes.

**Methods:**
- **Chrome/Edge:** `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- **Firefox:** `Ctrl + F5` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- **Safari:** `Cmd + Option + R` (Mac)

Or manually:
1. Open browser settings
2. Clear browsing data
3. Select "Cached images and files"
4. Clear data

---

### Step 2: Visit Homepage
Navigate to: `https://ezaary.com`

---

### Step 3: Test English Mode

1. **Look for the language switcher** in the header (top right area)
2. **Click "EN"** button
3. **Verify the following sections are in English:**

#### Hero Section (Top Banner):
- [ ] Title: "Ezaary Men" or "Ezaary Women"
- [ ] Subtitle: "Most modern clothes"
- [ ] Discount button: "Discounts up to 30%" or "Discounts up to 20%"
- [ ] CTA button: "Discover More"

#### Special Offers Section:
- [ ] Title: "Special Offers"
- [ ] Description: "Discover the best offers and discounts on selected products"
- [ ] No offers message: "No offers available now" (if applicable)
- [ ] Button: "Load More Offers" or "Browse All Products"

#### Product Names:
- [ ] Product cards show English names (if `name_en` is filled in admin)
- [ ] If `name_en` is empty, shows Arabic name as fallback

#### Help/CTA Section:
- [ ] Title: "Do you have questions or need help?"
- [ ] Description: "We are here to help. Contact us via WhatsApp..."
- [ ] Button: "Contact us via WhatsApp"

#### Feature Highlights:
- [ ] "Fast Shipping" / "Delivery within 3-5 business days"
- [ ] "Competitive Prices" / "Best prices in the market"
- [ ] "Quality Guarantee" / "Original and reliable products"

#### Footer:
- [ ] "About" description in English
- [ ] Section titles: "Quick Links", "Contact Us", "Follow Us"
- [ ] Newsletter: "Subscribe to our newsletter"
- [ ] Input placeholder: "Your email"
- [ ] Button: "Subscribe"
- [ ] Copyright: "© 2024 Izaary. All rights reserved"
- [ ] Location: "Assiut, Egypt"

---

### Step 4: Test Arabic Mode

1. **Click "AR"** button in header
2. **Verify all content switches back to Arabic:**
   - [ ] Hero section in Arabic
   - [ ] Special offers in Arabic
   - [ ] Product names always show Arabic
   - [ ] Help section in Arabic
   - [ ] Features in Arabic
   - [ ] Footer in Arabic

---

### Step 5: Test Product Hover Effect

1. **Find a product with multiple images** on the homepage
2. **Hover your mouse over the product card**
3. **Verify:**
   - [ ] Image smoothly transitions to the second image
   - [ ] Animation is slow and professional (700ms)
   - [ ] Image slightly zooms (scale effect)
   - [ ] When you move mouse away, it transitions back to first image

**Note:** Products with only ONE image will NOT show this effect (as intended).

---

### Step 6: Test Language Persistence

1. **Click "EN"** to switch to English
2. **Navigate to another page** (e.g., Categories)
3. **Return to homepage**
4. **Verify:** Language is still English (persisted)

---

## Common Issues & Solutions

### Issue: I don't see the EN/AR button
**Solution:** 
- Clear browser cache completely
- Check if JavaScript is enabled
- Try a different browser
- Hard refresh (Ctrl+Shift+R)

### Issue: Content is still in Arabic in English mode
**Solution:**
- Hard refresh the page (Ctrl+Shift+R)
- Clear cache and cookies
- Close and reopen browser
- Wait 1-2 minutes for CDN to update

### Issue: Product names are still in Arabic
**Solution:**
- This is expected if `name_en` is not filled in the admin panel
- The system will fallback to Arabic name if English name is empty
- Go to admin panel and add English names to products

### Issue: Hover effect not working
**Solution:**
- Ensure the product has MORE than one image
- Clear browser cache
- Check if the product actually has multiple images in the database

---

## Admin Panel Verification

### To Add English Product Names:

1. Go to: `https://ezaary.com/admin`
2. Login with admin credentials
3. Click "Products" section
4. Edit any product
5. **Look for these fields:**
   - Product Name (العربية) - existing Arabic field
   - **Product Name (English)** - NEW field
   - Short Description (العربية) - existing Arabic field
   - **Short Description (English)** - NEW field

6. Fill in English name and description
7. Click "Save Product"
8. Verify on the frontend in English mode

---

## Technical Verification

### Check Build Version:
```bash
# SSH into server
cd /var/www/izaar/frontend/izaar
ls -lh dist/spa/assets/

# Should show:
# index-DaLl-Oy2.js (1.1M) - dated Feb 8, 2026
# index-C6gqwCpP.css (76K) - dated Feb 8, 2026
```

### Check Nginx:
```bash
systemctl status nginx
# Should be active (running)
```

### Check Translation Keys in Bundle:
```bash
strings dist/spa/assets/index-DaLl-Oy2.js | grep "home.specialOffers"
# Should output: "home.specialOffers":"Special Offers"
```

---

## Expected Results Summary

✅ **English Mode:**
- All UI elements in English
- Product names in English (with Arabic fallback)
- Hero section uses custom English translations
- Footer completely translated

✅ **Arabic Mode:**
- All content in Arabic
- Product names always in Arabic
- No English text visible

✅ **Hover Effect:**
- Smooth image transition for multi-image products
- 700ms slow-motion animation
- Professional scale effect

✅ **Persistence:**
- Language choice saved in browser
- Persists across page navigation
- Survives browser refresh

---

## Contact for Issues

If you encounter any issues after following all steps:

1. Confirm you've cleared browser cache
2. Try incognito/private browsing mode
3. Test on different browser
4. Check admin panel for English content
5. Verify build date matches Feb 8, 2026

---

**Last Updated:** February 8, 2026
**Build Version:** index-DaLl-Oy2.js
**Status:** ✅ DEPLOYED TO PRODUCTION





