# Database Access & Backup Information

## Where is your data stored?

Your Bajrangi Nutrition website uses a **dual-state database system**:

### 1. Firebase Cloud Database (Primary)
- **Location**: Google Firebase Firestore
- **Access**: https://console.firebase.google.com/
- **Collections**:
  - `products` - All supplement products
  - `orders` - Customer orders
  - `coupons` - Discount coupons
  - `reviews` - Product reviews

### 2. Local Storage (Fallback)
- **Location**: Browser's localStorage
- **Access**: Browser Developer Tools → Application → Local Storage
- **Keys**:
  - `bajrangi_products` - Product catalog
  - `bajrangi_orders` - Order history
  - `bajrangi_coupons` - Coupon codes
  - `bajrangi_reviews` - Customer reviews

## How to access your data if website crashes?

### Option 1: Firebase Console (Recommended)
1. Go to https://console.firebase.google.com/
2. Select your project (bajrangi-nutrition-website)
3. Navigate to **Firestore Database**
4. View all collections and data
5. Export data as JSON if needed

### Option 2: Browser Local Storage
1. Open website in browser
2. Press F12 to open Developer Tools
3. Go to **Application** tab
4. Click **Local Storage** on left sidebar
5. Select your domain
6. View/copy data from keys

### Option 3: Admin Portal Backup
1. Login to Admin Portal
2. Go to **System Backup** tab
3. Export all data as JSON file
4. Store backup file safely

## Firebase Configuration
Your Firebase credentials are stored in `.env.local` file:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Data Recovery Steps
If website crashes or data is lost:

1. **Check Firebase Console** - Data should still be there if Firebase was configured
2. **Check Local Storage** - If using fallback mode, data is in browser
3. **Restore from Backup** - Use Admin Portal → System Backup → Import
4. **Re-seed Products** - Use Admin Portal to manually add products again

## Important Notes
- Firebase is the primary database and persists across devices
- Local Storage is browser-specific and can be cleared
- Always keep regular backups using Admin Portal
- Firebase data is accessible from anywhere with internet
- Local Storage data is lost if browser cache is cleared
