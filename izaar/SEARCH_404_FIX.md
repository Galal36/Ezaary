# Fixing Search 404 Error

## Problem
The search endpoint `/api/search/search/` returns 404 (Not Found).

## Root Cause
The search URLs are registered in `backend/store/urls.py`, but Django can't load them due to:
1. Missing database migrations for search models
2. Import errors when loading search_views

## Solution

### Step 1: Run Migrations for Search Models

Navigate to your Django backend directory and run:

```bash
cd backend
python manage.py makemigrations store
python manage.py migrate
```

This will create the tables for:
- `SearchKeyword`
- `SearchAnalytics` 
- `ZeroResultSearch`

### Step 2: Verify Main URLs Configuration

Make sure your main Django `urls.py` (usually in the project root, like `izaar_backend/urls.py` or similar) includes:

```python
from django.urls import path, include

urlpatterns = [
    # ... other patterns ...
    path('api/', include('store.urls')),
    # ... other patterns ...
]
```

### Step 3: Restart Django Server

After migrations, restart your Django development server:

```bash
python manage.py runserver 8000
```

### Step 4: Test the Endpoint

Try accessing the search endpoint directly:

```bash
curl http://localhost:8000/api/search/search/?q=test
```

Or in browser:
```
http://localhost:8000/api/search/search/?q=test
```

## What I've Fixed

1. ✅ Added error handling to search_views imports
2. ✅ Made search models optional (won't crash if not migrated)
3. ✅ Added fallback functions for search utilities
4. ✅ Made ViewSets handle missing models gracefully

## If Still Getting 404

1. **Check Django server logs** - Look for import errors when starting the server
2. **Verify URL inclusion** - Make sure `store.urls` is included in main `urls.py`
3. **Check for syntax errors** - Run `python manage.py check` to verify no errors
4. **Verify router registration** - The search endpoint should be at `/api/search/search/` (note the double "search")

## Expected Behavior After Fix

- Search endpoint should return 200 OK (even if no products found)
- Should return JSON with `results`, `count`, `suggestions`, `did_you_mean`
- If Product model not found, will return empty results with error message
- If search models not migrated, will still work but analytics won't be tracked

