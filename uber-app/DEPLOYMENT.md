# 🚀 Deployment Guide - RideGo Dhaka Ridesharing App

This guide will help you deploy the complete RideGo application to production using Netlify for the frontend and Render/Railway for the backend.

## 📋 Prerequisites

- GitHub repository with your code
- Netlify account (free)
- Render account (free tier available) or Railway account
- Mapbox API key

## 🎯 Deployment Architecture

```
Frontend (React) → Netlify
Backend (Node.js) → Render/Railway
Database → MongoDB Atlas (optional)
```

## 🌐 Frontend Deployment (Netlify)

### Step 1: Prepare for Netlify

1. **Ensure your code is pushed to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify netlify.toml configuration** (already created)
   - Located at: `uber-app/netlify.toml`
   - Configured for React build process

### Step 2: Deploy to Netlify

1. **Go to [Netlify](https://netlify.com) and sign in**

2. **Create New Site**
   - Click "New site from Git"
   - Connect to GitHub
   - Select your repository: `Project-101`

3. **Configure Build Settings**
   - **Base directory**: `uber-app/client`
   - **Build command**: `npm run build`
   - **Publish directory**: `uber-app/client/build`

4. **Set Environment Variables**
   Go to Site Settings → Environment Variables and add:
   ```
   REACT_APP_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoibXpwbGF5eiIsImEiOiJjbWNwdjF5cXAwYnBqMmxzYnN4ZTZkOTVtIn0.n_yE9wLiU49DZgSeOv_Ngg
   REACT_APP_ENV=production
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   REACT_APP_WS_URL=wss://your-backend-url.onrender.com
   ```

5. **Deploy**
   - Click "Deploy Site"
   - Wait for build to complete
   - Your site will be available at: `https://your-site-name.netlify.app`

## 🖥️ Backend Deployment (Render)

### Step 1: Prepare Backend for Render

1. **Create render.yaml** (if using Render)
   ```yaml
   services:
     - type: web
       name: ridego-backend
       env: node
       plan: free
       buildCommand: cd uber-app/server && npm install
       startCommand: cd uber-app/server && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: JWT_SECRET
           generateValue: true
         - key: PORT
           value: 10000
   ```

### Step 2: Deploy to Render

1. **Go to [Render](https://render.com) and sign in**

2. **Create New Web Service**
   - Connect GitHub repository
   - Select `Project-101` repository

3. **Configure Service**
   - **Name**: `ridego-backend`
   - **Environment**: `Node`
   - **Root Directory**: `uber-app/server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=10000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Note your backend URL: `https://ridego-backend.onrender.com`

### Step 3: Update Frontend with Backend URL

1. **Update Netlify Environment Variables**
   - Go back to Netlify site settings
   - Update environment variables:
   ```
   REACT_APP_API_URL=https://ridego-backend.onrender.com
   REACT_APP_WS_URL=wss://ridego-backend.onrender.com
   ```

2. **Trigger Netlify Redeploy**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

## 🗄️ Database Setup (Optional)

For production, you might want to use MongoDB Atlas:

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create free cluster

2. **Update Backend for MongoDB**
   - Add MongoDB connection string to Render environment variables
   - Update server code to use MongoDB instead of in-memory storage

## 🔧 Environment Variables Summary

### Netlify (Frontend)
```
REACT_APP_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoibXpwbGF5eiIsImEiOiJjbWNwdjF5cXAwYnBqMmxzYnN4ZTZkOTVtIn0.n_yE9wLiU49DZgSeOv_Ngg
REACT_APP_ENV=production
REACT_APP_API_URL=https://ridego-backend.onrender.com
REACT_APP_WS_URL=wss://ridego-backend.onrender.com
```

### Render (Backend)
```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
PORT=10000
CORS_ORIGINS=https://your-site-name.netlify.app
```

## 🧪 Testing Deployment

1. **Visit your Netlify URL**
   - Example: `https://ridego-dhaka.netlify.app`

2. **Test Complete Flow**
   - User registration/login
   - Location selection (Dhaka landmarks)
   - Payment method selection
   - Ride booking and real-time tracking
   - Bengali language interface

3. **Check Console for Errors**
   - Open browser developer tools
   - Monitor Network tab for API calls
   - Check WebSocket connection

## 🚨 Troubleshooting

### Common Issues

#### Frontend not loading
- Check Netlify build logs
- Verify environment variables are set
- Ensure build command is correct

#### Backend API errors
- Check Render logs
- Verify environment variables
- Check CORS configuration

#### WebSocket connection failing
- Ensure WSS (secure) is used for HTTPS sites
- Check Render service status
- Verify WebSocket endpoint is accessible

#### Map not displaying
- Verify Mapbox token is correctly set
- Check browser console for Mapbox errors
- Ensure token has proper permissions

### Performance Optimization

1. **Enable Netlify CDN** (automatic)
2. **Use Render caching** (configure in render.yaml)
3. **Optimize images** for faster loading
4. **Enable compression** in backend

## 🔒 Security Checklist

- [ ] JWT secret is strong and secure
- [ ] Environment variables are properly set
- [ ] CORS is configured for production domains
- [ ] HTTPS is enabled (automatic on Netlify/Render)
- [ ] No sensitive data in client code
- [ ] Input validation is enabled
- [ ] Rate limiting is configured

## 📱 Custom Domain (Optional)

### Netlify Custom Domain
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS records

### SSL Certificate
- Automatically provided by Netlify
- No additional configuration needed

## 🔄 Continuous Deployment

Both Netlify and Render will automatically redeploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Automatic deployment triggered
```

## 📊 Monitoring

1. **Netlify Analytics** - Monitor frontend performance
2. **Render Metrics** - Monitor backend performance  
3. **Browser Console** - Monitor client-side errors
4. **Error Tracking** - Consider adding Sentry for production

## 🎉 Success!

Your RideGo Dhaka ridesharing app is now live and ready for users! 🇧🇩🚗

**Frontend**: https://your-site-name.netlify.app
**Backend**: https://ridego-backend.onrender.com

Share your app and gather user feedback for further improvements!