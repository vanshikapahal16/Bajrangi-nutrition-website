# Firebase Setup Guide
**Bajrangi Nutrition E-Commerce Website**

This guide provides detailed instructions for setting up Firebase for the Bajrangi Nutrition website.

---

## Prerequisites

- Firebase account (free tier is sufficient)
- Google account for authentication
- Basic understanding of Firebase console

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `bajrangi-nutrition`
4. Accept Firebase terms
5. Disable Google Analytics for now (can enable later)
6. Click "Create project"
7. Wait for project creation (may take 1-2 minutes)

---

## Step 2: Enable Authentication

### Enable Google Sign-In

1. Go to Firebase Console → Authentication
2. Click "Get Started"
3. Select "Sign-in method" tab
4. Click on "Google"
5. Enable Google Sign-In toggle
6. Enter a project support email
7. Click "Save"

### Configure Authorized Domains

1. In Authentication → Settings
2. Scroll to "Authorized domains"
3. Add your development domain: `localhost:3000`
4. Add your production domain: `your-domain.com`
5. Click "Add domain"

---

## Step 3: Create Firestore Database

### Create Database

1. Go to Firebase Console → Firestore Database
2. Click "Create database"
3. Choose location: Select nearest to your users (e.g., `asia-south1`)
4. Choose "Start in production mode"
5. Click "Enable"

### Deploy Security Rules

**Option 1: Firebase Console**
1. Go to Firestore Database → Rules tab
2. Copy the contents from `firestore.rules` file in your project
3. Paste into the rules editor
4. Click "Publish"

**Option 2: Firebase CLI**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project directory
cd d:\bajrangi
firebase init

# Select options:
# - Firestore: Configure Firestore Security Rules
# - Hosting: Configure files for Firebase Hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### Create Initial Collections

The application will automatically create collections when first used:
- `products` - Product inventory
- `orders` - Customer orders
- `customers` - Customer profiles
- `coupons` - Discount codes
- `reviews` - Product reviews
- `marquee` - Header text

---

## Step 4: Get Firebase Configuration

### Get Web App Configuration

1. Go to Firebase Console → Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Web app" (</> icon)
4. Enter app name: `Bajrangi Nutrition Web`
5. Check "Also set up Firebase Hosting for this app" (optional)
6. Click "Register app"
7. Copy the Firebase configuration object

### Configuration Format

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bajrangi-nutrition.firebaseapp.com",
  projectId: "bajrangi-nutrition",
  storageBucket: "bajrangi-nutrition.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

---

## Step 5: Configure Environment Variables

### Update .env.local

Add the Firebase configuration to your `.env.local` file:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bajrangi-nutrition.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bajrangi-nutrition
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bajrangi-nutrition.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Add Admin Configuration

```bash
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,owner@example.com
```

---

## Step 6: Enable Firebase Storage (Optional)

### Create Storage Bucket

1. Go to Firebase Console → Storage
2. Click "Get Started"
3. Choose security rules: Start in production mode
4. Choose location: Same as Firestore
5. Click "Enable"

### Configure Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Step 7: Test Firebase Connection

### Verify Connection

1. Start your development server:
```bash
npm run dev
```

2. Open browser console
3. Look for "🔥 Firebase initialized" message
4. Check for any Firebase errors

### Test Authentication

1. Open the website
2. Click on admin portal
3. Try Google Sign-In
4. Verify authentication works

### Test Database Operations

1. Add a product via admin portal
2. Check Firestore Console → Firestore Database
3. Verify product appears in `products` collection
4. Test customer order creation
5. Verify order appears in `orders` collection

---

## Step 8: Configure Firebase Analytics (Optional)

### Enable Google Analytics

1. Go to Firebase Console → Project Settings
2. Integrations tab
3. Click "Google Analytics"
4. Link or create Analytics account
5. Enable Analytics

### Get Measurement ID

1. Go to Google Analytics Console
2. Admin → Property Settings
3. Copy Measurement ID (format: G-XXXXXXXXXX)
4. Add to `.env.local`:
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Step 9: Security Configuration

### Configure API Key Restrictions

1. Go to Google Cloud Console
2. Select your Firebase project
3. APIs & Services → Credentials
4. Find your Firebase API key
5. Click edit (pencil icon)
6. Set application restrictions:
   - HTTP referrers: Add your domain
   - IP addresses: (leave empty for web)
7. Set API restrictions: Select Firebase APIs

### Enable App Check (Recommended)

For enhanced security, enable Firebase App Check:

1. Go to Firebase Console → App Check
2. Register your web app
3. Add App Check to your application
4. Configure reCAPTCHA

---

## Step 10: Monitoring Setup

### Enable Monitoring

1. Go to Firebase Console → Monitoring
2. Enable performance monitoring
3. Set up crash reporting
4. Configure alerts

### Set Up Alerts

1. Firebase Console → Project Settings → Notifications
2. Configure email alerts for:
   - Authentication failures
   - Database errors
   - Usage limits
   - Billing alerts

---

## Troubleshooting

### Common Firebase Issues

**"Firebase: No Firebase App '[DEFAULT]' has been created"**
- Verify Firebase config is correct
- Check environment variables are loaded
- Ensure Firebase is initialized before use

**"Permission denied" errors**
- Verify Firestore rules are deployed
- Check user authentication status
- Review security rules for correct permissions

**"Network request failed"**
- Check internet connection
- Verify Firebase project is active
- Check API key restrictions

**"Auth/popup-blocked"**
- Enable popups in browser
- Check browser extensions
- Try incognito mode

---

## Firebase CLI Commands

### Useful Commands

```bash
# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Deploy all Firebase resources
firebase deploy

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Hosting
firebase deploy --only hosting

# View Firestore data
firebase firestore:read

# Export Firestore data
firebase firestore:export --backup-path ./backups

# Import Firestore data
firebase firestore:import ./backups
```

---

## Firebase Console Links

- **Firebase Console:** https://console.firebase.google.com/
- **Project:** https://console.firebase.google.com/project/bajrangi-nutrition
- **Authentication:** https://console.firebase.google.com/project/bajrangi-nutrition/authentication
- **Firestore:** https://console.firebase.google.com/project/bajrangi-nutrition/firestore
- **Storage:** https://console.firebase.google.com/project/bajrangi-nutrition/storage
- **Analytics:** https://console.firebase.google.com/project/bajrangi-nutrition/analytics

---

## Cost Management

### Free Tier Limits

- **Authentication:** 10,000 verifications/month
- **Firestore:** 50K reads, 20K writes/day
- **Storage:** 5GB
- **Hosting:** 10GB/month
- **Functions:** 125K invocations/month

### Monitoring Usage

1. Firebase Console → Project Settings → Usage
2. Monitor daily usage
3. Set up alerts for limits
4. Upgrade plan if needed

---

## Security Best Practices

1. **Never commit Firebase credentials to git**
2. **Use environment variables for all secrets**
3. **Enable Firebase security rules**
4. **Regularly rotate API keys**
5. **Monitor Firebase console for suspicious activity**
6. **Use Firebase App Check for additional security**
7. **Implement rate limiting in your application**
8. **Keep Firebase SDK updated**

---

## Support Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Firebase Support:** https://firebase.google.com/support
- **Firebase Community:** https://firebase.google.com/community
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/firebase

---

**Last Updated:** July 17, 2026  
**Version:** 1.0  
**Status:** Production Ready
