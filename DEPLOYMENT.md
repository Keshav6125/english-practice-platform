# Deployment Guide

This guide explains how to deploy the English Practice Platform to production environments, with a focus on Vercel for the frontend and a compatible backend hosting solution.

## 🚀 Deployment Architecture

The application consists of two separate services:
1. **Frontend** - React application (can be deployed to Vercel)
2. **Backend** - Node.js API server (needs separate hosting)

## 🌐 Frontend Deployment (Vercel)

### 1. Prepare for Deployment
1. Ensure all environment variables are set correctly in Vercel dashboard
2. Build the frontend:
   ```bash
   npm run build
   ```

### 2. Deploy to Vercel
1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3. Environment Variables (Vercel Dashboard)
Set these variables in your Vercel project settings:
```
VITE_BACKEND_URL=https://your-backend-url.com/api
```

## ☁️ Backend Deployment Options

Since Vercel is primarily for static sites and serverless functions, you'll need to deploy the backend separately. Here are several options:

### Option 1: Render (Recommended)
1. Create an account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the following build settings:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables:
   ```
   GEMINI_API_KEY=your_actual_api_key
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

### Option 2: Railway
1. Create an account at [railway.app](https://railway.app)
2. Create a new project
3. Deploy from your GitHub repository
4. Set environment variables in the Railway dashboard

### Option 3: Heroku
1. Install Heroku CLI
2. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
3. Deploy:
   ```bash
   git push heroku main
   ```
4. Set environment variables:
   ```bash
   heroku config:set GEMINI_API_KEY=your_actual_api_key
   heroku config:set ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

## 🔧 Environment Configuration

### Production Environment Variables

#### Frontend (.env.production or Vercel)
```
VITE_BACKEND_URL=https://your-backend-production-url.com/api
```

#### Backend (.env.production or hosting platform)
```
PORT=3001
GEMINI_API_KEY=your_production_gemini_api_key
ALLOWED_ORIGINS=https://your-production-frontend.vercel.app,https://your-domain.com
```

## 🔄 CI/CD Setup

### GitHub Actions (Frontend)
Create `.github/workflows/frontend-deploy.yml`:
```yaml
name: Deploy Frontend to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `ALLOWED_ORIGINS` includes your frontend URL
   - Check that the backend is running and accessible

2. **API Key Issues**
   - Verify the `GEMINI_API_KEY` is correctly set in the backend
   - Check that the key has proper permissions

3. **Connection Refused**
   - Ensure the backend server is running
   - Check firewall settings if hosting on a VM

4. **Environment Variables Not Loading**
   - Verify variable names match exactly
   - Check for proper quoting of values with special characters

### Monitoring

1. Add logging to your backend endpoints
2. Use services like Sentry for error tracking
3. Monitor API usage in the Google AI Studio dashboard

## 💰 Cost Considerations

1. **Gemini API Usage**
   - Monitor your usage in Google AI Studio
   - Set up billing alerts to avoid unexpected charges

2. **Hosting Costs**
   - Render: Free tier available with limitations
   - Vercel: Free tier for hobby projects
   - Consider upgrading as your user base grows

## 🔐 Security Best Practices

1. **API Keys**
   - Never commit API keys to version control
   - Use environment variables for all secrets
   - Rotate keys periodically

2. **Rate Limiting**
   - Implement rate limiting on your backend
   - Use services like Cloudflare for DDoS protection

3. **Input Validation**
   - Validate all inputs on the backend
   - Sanitize user data before processing

## 📊 Monitoring and Analytics

1. Add logging to critical endpoints
2. Use Google Analytics for frontend tracking
3. Monitor backend performance with tools like New Relic
4. Set up uptime monitoring for your backend API

---

By following this guide, you should be able to successfully deploy your English Practice Platform to production with proper separation of concerns between frontend and backend services.