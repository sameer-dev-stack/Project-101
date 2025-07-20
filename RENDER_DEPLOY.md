# 🚀 Deploy Backend to Render

## Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

## Step 2: Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Select **"Build and deploy from a Git repository"**
3. Connect your GitHub account if not already connected
4. Choose repository: **"Project-101"**
5. Click **"Connect"**

## Step 3: Configure Build Settings
- **Name**: `ridesharing-backend`
- **Environment**: `Node`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Build Command**: `cd uber-app/server && npm install`
- **Start Command**: `cd uber-app/server && npm start`

## Step 4: Set Environment Variables
Add these environment variables:
- **NODE_ENV**: `production`
- **JWT_SECRET**: `your-super-secret-jwt-key-here-make-it-long-and-random`
- **CORS_ORIGIN**: `https://ridesharing-101.netlify.app`

## Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Your backend will be live at: `https://ridesharing-backend-xxxx.onrender.com`

## Step 6: Update Frontend
Once deployed, I'll update your Netlify environment variables to use the new backend URL.

## 🎯 What You'll Get:
- ✅ Complete authentication system
- ✅ Real-time WebSocket ridesharing features  
- ✅ Production-ready backend
- ✅ CORS configured for your Netlify frontend
- ✅ Rate limiting and security headers
- ✅ Health check endpoint

## ⚡ Ready to Deploy?
Just follow the steps above, and let me know your backend URL when it's deployed!