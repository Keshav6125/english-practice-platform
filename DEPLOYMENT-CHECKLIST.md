# Deployment Checklist

Follow this checklist to ensure successful deployment of the English Practice Platform.

## ✅ Pre-deployment Checklist

### 🔑 API Keys & Environment Variables
- [ ] Gemini API key obtained from Google AI Studio
- [ ] Frontend `.env` file configured with `VITE_BACKEND_URL`
- [ ] Backend `.env` file configured with `GEMINI_API_KEY` and `ALLOWED_ORIGINS`

### 📁 Code Preparation
- [ ] Latest code committed and pushed to repository
- [ ] All tests passing locally
- [ ] Build process completes without errors
- [ ] No sensitive information in code or logs

### 🧪 Testing
- [ ] Frontend builds successfully with `npm run build`
- [ ] Backend starts without errors
- [ ] API endpoints respond correctly
- [ ] Health check passes
- [ ] End-to-end functionality tested locally

## ☁️ Deployment Steps

### 1. Backend Deployment
- [ ] Choose hosting platform (Render, Railway, Heroku, etc.)
- [ ] Configure environment variables on hosting platform:
  - `GEMINI_API_KEY` (your actual API key)
  - `ALLOWED_ORIGINS` (your frontend URLs)
  - `PORT` (if required by hosting platform)
- [ ] Deploy backend code
- [ ] Verify backend is running and accessible
- [ ] Run health check: `BACKEND_URL=https://your-backend-url.com npm run health`

### 2. Frontend Deployment (Vercel)
- [ ] Connect GitHub repository to Vercel
- [ ] Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `dist/`
- [ ] Set environment variables in Vercel dashboard:
  - `VITE_BACKEND_URL` (your backend URL)
- [ ] Deploy frontend
- [ ] Verify deployment is successful

### 3. Integration Testing
- [ ] Visit deployed frontend URL
- [ ] Test conversation initialization
- [ ] Test conversation flow
- [ ] Test feedback generation
- [ ] Verify no CORS errors in browser console
- [ ] Check network tab for successful API calls

## 🔍 Post-deployment Verification

### Backend Verification
- [ ] Health endpoint returns 200 OK: `GET /api/health`
- [ ] Initialize conversation endpoint works: `POST /api/initialize-conversation`
- [ ] Generate response endpoint works: `POST /api/generate-response`
- [ ] Generate feedback endpoint works: `POST /api/generate-feedback`

### Frontend Verification
- [ ] Application loads without errors
- [ ] Scenario selection works
- [ ] Practice session starts correctly
- [ ] Voice recording functions
- [ ] AI responses appear in conversation
- [ ] Feedback report generates after session

## 🚨 Common Issues and Solutions

### API Key Issues
**Problem**: "API key not valid" errors
**Solution**: 
- Verify `GEMINI_API_KEY` is correctly set in backend environment
- Check that the API key has proper permissions
- Ensure no extra spaces or characters in the key

### CORS Errors
**Problem**: "Blocked by CORS policy" in browser console
**Solution**:
- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Ensure the backend is using the correct CORS configuration
- Check that the frontend is using the correct backend URL

### Connection Refused
**Problem**: "Failed to fetch" or "ECONNREFUSED" errors
**Solution**:
- Verify backend server is running
- Check that the backend URL is correct
- Ensure proper firewall settings if hosting on a VM

### Environment Variables Not Loading
**Problem**: Variables appear as undefined
**Solution**:
- Verify variable names match exactly
- Check for proper syntax in .env files
- Ensure variables are set in the hosting platform's dashboard

## 📊 Monitoring Setup

### Google AI Studio
- [ ] Set up billing alerts
- [ ] Monitor API usage
- [ ] Check for any errors in the dashboard

### Application Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure logging for debugging

## 🔐 Security Checklist

### API Keys
- [ ] API key stored only on backend
- [ ] No API keys in frontend code or version control
- [ ] API key has minimal required permissions

### Rate Limiting
- [ ] Implement rate limiting on backend
- [ ] Configure appropriate limits for your use case

### Input Validation
- [ ] Validate all inputs on backend
- [ ] Sanitize user data
- [ ] Implement proper error handling

## 🆘 Rollback Plan

If deployment fails:
1. Revert to previous working version
2. Identify and fix the issue
3. Test locally
4. Re-deploy with fixes

## 📞 Support Contacts

- **Backend Issues**: Check server logs and hosting platform dashboard
- **Frontend Issues**: Check browser console and network tab
- **API Issues**: Check Google AI Studio dashboard for errors
- **Deployment Issues**: Check hosting platform documentation

---

✅ Deployment complete! Your English Practice Platform is now secure and ready for users.