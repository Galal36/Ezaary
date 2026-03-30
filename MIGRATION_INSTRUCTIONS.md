# Database Migration Required - Payment Methods Feature

## Issue
The migration failed due to insufficient database privileges:
```
psycopg2.errors.InsufficientPrivilege: must be owner of table store_order
```

## What Needs to Be Done

The database user needs permissions to:
1. Add columns to `store_order` table
2. Create new `store_paymentnumber` table

## Option 1: Run Migration with Superuser (Recommended)

### Step 1: Update Database Connection Settings
Temporarily update `.env` file with database superuser credentials:

```env
DB_USER=postgres  # or your superuser name
DB_PASSWORD=<superuser_password>
```

### Step 2: Run Migration
```bash
cd /var/www/izaar/backend
source venv/bin/activate
cd backend
python manage.py migrate
```

### Step 3: Restore Original Database User
Change `.env` back to the regular database user.

## Option 2: Grant Permissions to Current User

If you prefer to keep the current database user, grant it ownership or necessary permissions:

```sql
-- Connect as superuser (postgres) to the database
psql -U postgres -d izaar_db

-- Grant ownership of the table to the app user
ALTER TABLE store_order OWNER TO <your_app_db_user>;

-- OR grant specific privileges
GRANT ALL PRIVILEGES ON TABLE store_order TO <your_app_db_user>;
GRANT ALL PRIVILEGES ON SCHEMA public TO <your_app_db_user>;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO <your_app_db_user>;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO <your_app_db_user>;
```

Then run the migration:
```bash
python manage.py migrate
```

## Option 3: Apply SQL Manually

If you cannot run Django migrations, apply these SQL changes directly:

```sql
-- Add payment_method column to store_order
ALTER TABLE store_order 
ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cash_on_delivery' NOT NULL;

-- Add payment_screenshot column to store_order  
ALTER TABLE store_order 
ADD COLUMN payment_screenshot VARCHAR(100) NULL;

-- Create PaymentNumber table
CREATE TABLE store_paymentnumber (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_type VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    account_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX store_paymentnumber_payment_type_is_active_idx 
ON store_paymentnumber(payment_type, is_active);

-- Mark migration as applied in Django
INSERT INTO django_migrations (app, name, applied) 
VALUES ('store', '0006_order_payment_method_order_payment_screenshot_and_more', CURRENT_TIMESTAMP);
```

## Migration File Details

**Migration Name**: `0006_order_payment_method_order_payment_screenshot_and_more.py`

**Location**: `/var/www/izaar/backend/backend/store/migrations/`

**What It Does**:
1. Adds `payment_method` field to Order model (default: 'cash_on_delivery')
2. Adds `payment_screenshot` field to Order model (allows NULL)
3. Creates `PaymentNumber` model with all necessary fields and indexes

## Verification

After running the migration, verify it worked:

```bash
python manage.py showmigrations store
```

You should see:
```
store
 [X] 0001_initial
 [X] 0002_...
 [X] 0003_...
 [X] 0004_...
 [X] 0005_...
 [X] 0006_order_payment_method_order_payment_screenshot_and_more
```

## Next Steps After Migration

1. **Add Payment Numbers** via Django admin:
   - Go to: `/admin/store/paymentnumber/`
   - Add Vodafone Cash number(s)
   - Add Instapay number(s)

2. **Test the API**:
   ```bash
   curl https://ezaary.com/api/payment-numbers/
   ```
   Should return the payment numbers you added.

3. **Deploy Frontend Changes**:
   - Update `Checkout.tsx` with the payment method UI
   - See: `/var/www/izaar/frontend/izaar/PAYMENT_METHODS_IMPLEMENTATION.md`

## Security Note

After applying the migration with superuser, remember to:
1. Change the database credentials back to the regular app user
2. Restart the Django application
3. Verify the app can still read/write orders normally

## Support

If you encounter issues:
1. Check database logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`
2. Verify user permissions: `\dp store_order` in psql
3. Check Django migration status: `python manage.py showmigrations`

## Contact

For assistance with this migration, contact your database administrator or DevOps team.


