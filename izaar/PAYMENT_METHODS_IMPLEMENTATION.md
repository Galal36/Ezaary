# Payment Methods Implementation Guide

## Overview
This guide explains how to add manual payment methods (Pay on Delivery, Vodafone Cash, Instapay) to the checkout page.

## Backend Changes (✅ COMPLETED)

### 1. Models Updated
- Added `payment_method` field to Order model with choices: `cash_on_delivery`, `vodafone_cash`, `instapay`
- Added `payment_screenshot` FileField for payment proof
- Created `PaymentNumber` model to store payment phone numbers

### 2. Serializers Updated
- OrderCreateSerializer now handles file uploads via multipart/form-data
- Validates payment screenshot when required
- Checks file size (max 20MB) and file type (jpg, png, jpeg)

### 3. API Endpoints
- `/api/payment-numbers/` - List all active payment numbers
- `/api/payment-numbers/?payment_type=vodafone_cash` - Filter by payment type
- Orders endpoint now accepts multipart/form-data for file uploads

### 4. Migration Created
- Migration file: `0006_order_payment_method_order_payment_screenshot_and_more.py`
- Run: `python manage.py migrate` to apply changes

## Frontend Changes (IN PROGRESS)

### 1. Translations Added (✅ COMPLETED)
All payment-related translations have been added to `LanguageContext.tsx` in both Arabic and English.

### 2. API Client Updated (✅ COMPLETED)
- `orders.create()` now handles FormData for file uploads
- Added `paymentNumbers` API module
- Detects payment_screenshot and automatically uses FormData

### 3. Checkout Page Updates (⚠️ NEEDS IMPLEMENTATION)

Add the following to `Checkout.tsx`:

#### A. Add State Variables (after line 55)

```typescript
// Payment method state
const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'vodafone_cash' | 'instapay'>('cash_on_delivery');
const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
const [paymentNumbers, setPaymentNumbers] = useState<any[]>([]);
const [screenshotError, setScreenshotError] = useState('');
```

#### B. Add Imports (at top of file)

```typescript
import { paymentNumbers as paymentNumbersApi } from "@/lib/api-client";
import { CreditCard, Upload, CheckCircle2 } from "lucide-react";
```

#### C. Fetch Payment Numbers (add to useEffect hooks)

```typescript
// Fetch payment numbers based on selected payment method
useEffect(() => {
  const fetchPaymentNumbers = async () => {
    if (paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay') {
      try {
        const numbers = await paymentNumbersApi.list(paymentMethod);
        setPaymentNumbers(numbers);
      } catch (error) {
        console.error('Failed to fetch payment numbers:', error);
      }
    }
  };

  fetchPaymentNumbers();
}, [paymentMethod]);
```

#### D. File Upload Handler

```typescript
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  setScreenshotError('');
  
  if (!file) {
    setPaymentScreenshot(null);
    return;
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    setScreenshotError(t('payment.errors.invalidFileType'));
    setPaymentScreenshot(null);
    return;
  }

  // Validate file size (20MB)
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    setScreenshotError(t('payment.errors.fileTooBig'));
    setPaymentScreenshot(null);
    return;
  }

  setPaymentScreenshot(file);
};
```

#### E. Update validateForm() Function

Add this validation before the existing validations:

```typescript
// Validate payment screenshot for manual payment methods
if (paymentMethod !== 'cash_on_delivery' && !paymentScreenshot) {
  toast.error(t('payment.errors.screenshotRequired'));
  return false;
}
```

#### F. Update handleSubmit() Function

Update the order data preparation to include payment method and screenshot:

```typescript
// Prepare backend order format
const backendOrderData = {
  customer_name: name,
  customer_phone: phone,
  customer_email: email || null,
  governorate: "أسيوط",
  district: selectedDistrict?.name || district || "مدينة أسيوط",
  village: village || "",
  detailed_address: detailedAddress || customAddress,
  customer_notes: notes || "",
  subtotal: finalSubtotal,
  discount_amount: discountAmount,
  coupon_code: appliedCoupon?.coupon?.code || null,
  shipping_cost: shipping,
  total: finalSubtotal + shipping,
  payment_method: paymentMethod,
  payment_screenshot: paymentScreenshot, // Add this line
  items: orderItems,
};
```

#### G. Add Payment Method Section (Insert after Shipping Address section, before the Right Side Order Summary)

```typescript
{/* Payment Method */}
<div className="bg-card rounded-lg shadow-sm p-6">
  <div className="flex items-center gap-2 mb-6">
    <CreditCard className="w-5 h-5 text-primary" />
    <h2 className="text-xl font-bold text-foreground">{t('payment.selectMethod')}</h2>
  </div>

  <div className="space-y-4">
    {/* Payment Method Selection */}
    <div className="space-y-3">
      {/* Cash on Delivery */}
      <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
        paymentMethod === 'cash_on_delivery' 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50'
      }`}>
        <input
          type="radio"
          name="paymentMethod"
          value="cash_on_delivery"
          checked={paymentMethod === 'cash_on_delivery'}
          onChange={(e) => setPaymentMethod(e.target.value as any)}
          className="mt-1"
        />
        <div className="mr-3 flex-1">
          <div className="font-medium text-foreground">{t('payment.cashOnDelivery')}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {t('payment.cashOnDeliveryDesc')}
          </div>
        </div>
      </label>

      {/* Vodafone Cash */}
      <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
        paymentMethod === 'vodafone_cash' 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50'
      }`}>
        <input
          type="radio"
          name="paymentMethod"
          value="vodafone_cash"
          checked={paymentMethod === 'vodafone_cash'}
          onChange={(e) => setPaymentMethod(e.target.value as any)}
          className="mt-1"
        />
        <div className="mr-3 flex-1">
          <div className="font-medium text-foreground">{t('payment.vodafoneCash')}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {t('payment.vodafoneCashDesc')}
          </div>
        </div>
      </label>

      {/* Instapay */}
      <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
        paymentMethod === 'instapay' 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50'
      }`}>
        <input
          type="radio"
          name="paymentMethod"
          value="instapay"
          checked={paymentMethod === 'instapay'}
          onChange={(e) => setPaymentMethod(e.target.value as any)}
          className="mt-1"
        />
        <div className="mr-3 flex-1">
          <div className="font-medium text-foreground">{t('payment.instapay')}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {t('payment.instapayDesc')}
          </div>
        </div>
      </label>
    </div>

    {/* Payment Instructions for Manual Methods */}
    {(paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay') && (
      <div className="mt-6 space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">{t('payment.instructions')}</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              {t('payment.transferAmount')
                .replace('{amount}', finalTotal.toLocaleString(language === 'en' ? 'en-US' : 'ar-EG'))
                .replace('{method}', paymentMethod === 'vodafone_cash' ? t('payment.vodafoneCash') : t('payment.instapay'))}
            </p>
            
            {/* Payment Numbers */}
            {paymentNumbers.length > 0 && (
              <div className="mt-3 space-y-2">
                {paymentNumbers.map((number) => (
                  <div key={number.id} className="flex items-center gap-2 bg-white p-2 rounded border border-blue-300">
                    <span className="font-bold text-blue-900">{number.phone_number}</span>
                    {number.account_name && (
                      <span className="text-sm text-blue-700">({number.account_name})</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="mt-3">{t('payment.afterUpload')}</p>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <Label htmlFor="paymentScreenshot">
            {t('payment.uploadScreenshot')} <span className="text-red-500">*</span>
          </Label>
          <div className="mt-2">
            <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary">
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {paymentScreenshot ? paymentScreenshot.name : t('payment.screenshotHelper')}
                </span>
              </div>
              <input
                id="paymentScreenshot"
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
              />
            </label>
          </div>
          {screenshotError && (
            <p className="text-sm text-red-500 mt-1">{screenshotError}</p>
          )}
          {paymentScreenshot && !screenshotError && (
            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('payment.screenshotHelper')}</span>
            </div>
          )}
        </div>

        {/* Confirmation Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            {t('payment.confirmationMessage')}
          </p>
        </div>
      </div>
    )}
  </div>
</div>
```

#### H. Update Success Message

In the handleSubmit function, after successful order creation, show different messages:

```typescript
if (paymentMethod === 'cash_on_delivery') {
  toast.success(t('checkout.success.orderPlaced'));
} else {
  toast.success(t('payment.successMessage'));
}
```

## Admin Configuration

### Adding Payment Numbers (Django Admin or API)

To add payment numbers, you can either:

1. **Via Django Admin:**
   - Navigate to `/admin/store/paymentnumber/`
   - Click "Add Payment Number"
   - Fill in the details:
     - Payment Type: vodafone_cash or instapay
     - Phone Number: The actual number customers should transfer to
     - Account Name: (Optional) Name of the account holder
     - Is Active: Checked
     - Display Order: 0 (or higher for ordering)

2. **Via API (programmatically):**
```python
from store.models import PaymentNumber

# Vodafone Cash
PaymentNumber.objects.create(
    payment_type='vodafone_cash',
    phone_number='01066688234',
    account_name='Izaary Store',
    is_active=True,
    display_order=0
)

# Instapay
PaymentNumber.objects.create(
    payment_type='instapay',
    phone_number='01012345678',
    account_name='Izaary Store',
    is_active=True,
    display_order=0
)
```

## Testing Checklist

- [ ] Can select payment method
- [ ] Instructions show for manual payment methods
- [ ] Payment numbers are fetched and displayed
- [ ] File upload validates file type (jpg, png, jpeg only)
- [ ] File upload validates file size (max 20MB)
- [ ] Order submits successfully with cash on delivery (no screenshot)
- [ ] Order submits successfully with Vodafone Cash (with screenshot)
- [ ] Order submits successfully with Instapay (with screenshot)
- [ ] Error shown if screenshot missing for manual methods
- [ ] Order confirmation message is appropriate for payment method
- [ ] Admin can see payment method and screenshot in order details
- [ ] Works in both Arabic and English

## Production Deployment

1. Run migrations:
```bash
python manage.py migrate
```

2. Add payment numbers via Django admin

3. Update frontend code in `Checkout.tsx` with the sections above

4. Test thoroughly in staging environment

5. Deploy to production

## Notes

- Payment screenshots are stored in `media/payment_screenshots/`
- Ensure media files are properly configured in production
- Orders with manual payment methods start as 'pending' and need admin review
- Consider adding email notifications to admin when manual payment orders are received


