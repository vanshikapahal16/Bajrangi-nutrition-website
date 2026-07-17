# Production Deployment Guide
**Bajrangi Nutrition E-Commerce Website**

This guide provides step-by-step instructions for deploying the Bajrangi Nutrition website to production.

---

## Prerequisites

- Node.js 18+ installed
- Git installed
- Firebase account with project created
- Domain name (optional but recommended)
- Hosting platform account (Vercel, Netlify, or similar)

---

## Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Firebase Configuration (Get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bajrangi-nutrition.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bajrangi-nutrition
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bajrangi-nutrition.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Admin Configuration (Comma-separated emails)
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,owner@example.com

# Analytics Configuration (Google Analytics 4)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create new one)
3. Go to Project Settings → General → Your apps → Web app
4. Copy the Firebase configuration values
5. Paste them into your `.env.local` file

---

## Firebase Setup

### 1. Enable Required Firebase Services

**Authentication:**
- Go to Firebase Console → Authentication
- Enable Google Sign-in
- Add authorized domains (your production domain)

**Firestore Database:**
- Go to Firebase Console → Firestore Database
- Create database (if not exists)
- Choose production mode
- Deploy security rules (see below)

**Storage (Optional):**
- Go to Firebase Console → Storage
- Enable storage for product images

### 2. Deploy Firestore Security Rules

**Option 1: Firebase Console**
1. Go to Firebase Console → Firestore Database → Rules
2. Copy contents from `firestore.rules` file
3. Paste and click "Publish"

**Option 2: Firebase CLI**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

### 3. Configure Firebase Authentication

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable Google provider
3. Add your production domain to authorized domains
4. Configure email/password if needed

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Steps:**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Add Environment Variables**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add all variables from `.env.local`
- Add them for Production, Preview, and Development environments

5. **Deploy to Production**
```bash
vercel --prod
```

### Option 2: Netlify

**Steps:**

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build the Project**
```bash
npm run build
```

3. **Deploy**
```bash
netlify deploy --prod
```

4. **Add Environment Variables**
- Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
- Add all required variables

### Option 3: Traditional Hosting

**Steps:**

1. **Build the Project**
```bash
npm run build
```

2. **Upload Files**
- Upload contents of `.next` folder and `public` folder
- Upload `package.json` and `package-lock.json`
- Configure server to run Next.js

3. **Set Environment Variables**
- Configure environment variables on your hosting platform
- Restart the application

---

## Domain Configuration

### Custom Domain Setup

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**Netlify:**
1. Go to Domain Settings
2. Add custom domain
3. Update DNS records

**Firebase Hosting (Alternative):**
```bash
firebase init hosting
firebase deploy --only hosting
```

---

## Post-Deployment Checklist

### Security Verification

- [ ] Firebase security rules deployed
- [ ] Environment variables configured in production
- [ ] Admin emails set correctly
- [ ] HTTPS enforced on domain
- [ ] Firebase Authentication enabled
- [ ] Google Analytics configured

### Functionality Testing

- [ ] Website loads correctly
- [ ] Product catalog displays
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Admin portal accessible
- [ ] Customer authentication works
- [ ] Order creation successful
- [ ] Real-time updates working

### Performance Verification

- [ ] Page load time < 3 seconds
- [ ] Mobile responsive design
- [ ] Images optimized
- [ ] No console errors
- [ ] SEO metadata correct

### Analytics Setup

- [ ] Google Analytics tracking active
- [ ] Firebase Analytics enabled
- [ ] Conversion tracking configured

---

## Monitoring & Maintenance

### Firebase Console Monitoring

1. **Firestore Database**
   - Monitor database usage
   - Check for slow queries
   - Review security rules logs

2. **Authentication**
   - Monitor user sign-ups
   - Check for suspicious activity
   - Review authentication logs

3. **Crashlytics** (Optional)
   - Enable for error tracking
   - Set up crash reporting

### Regular Maintenance Tasks

**Weekly:**
- Check Firebase usage and costs
- Review error logs
- Monitor site performance

**Monthly:**
- Update dependencies
- Review security rules
- Backup database (if needed)
- Test all critical functionality

**Quarterly:**
- Security audit
- Performance optimization
- Feature updates

---

## Troubleshooting

### Common Issues

**Firebase Connection Issues:**
- Verify API keys are correct
- Check Firebase project is active
- Ensure domain is authorized in Firebase Console

**Environment Variables Not Loading:**
- Verify variable names match exactly
- Check platform-specific variable syntax
- Restart application after changes

**Firestore Permission Errors:**
- Verify security rules are deployed
- Check authentication status
- Review user permissions

**Build Errors:**
- Clear cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

---

## Backup & Recovery

### Firebase Data Backup

```bash
# Install Firebase CLI tools
npm install -g firebase-tools

# Export Firestore data
firebase firestore:export --backup-path ./backups

# Import Firestore data (if needed)
firebase firestore:import ./backups
```

### Code Repository Backup

- Ensure git repository is up to date
- Use GitHub/GitLab for code backup
- Tag releases for easy rollback

---

## Security Best Practices

1. **Never commit `.env.local` to git**
2. **Rotate API keys regularly**
3. **Use strong admin passwords**
4. **Enable 2FA on all accounts**
5. **Monitor Firebase console for suspicious activity**
6. **Keep dependencies updated**
7. **Use HTTPS only**
8. **Implement rate limiting**
9. **Regular security audits**
10. **Have incident response plan**

---

## Support & Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Vercel Documentation:** https://vercel.com/docs
- **GitHub Repository:** https://github.com/vanshikapahal16/Bajrangi-nutrition-website

---

## Emergency Contacts

- **Firebase Support:** https://firebase.google.com/support
- **Hosting Platform Support:** Check your platform's documentation
- **Development Team:** [Contact Information]

---

**Last Updated:** July 17, 2026  
**Version:** 1.0  
**Status:** Production Ready
