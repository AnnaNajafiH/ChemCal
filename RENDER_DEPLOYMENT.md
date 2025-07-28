# Molar Mass Calculator - Render Deployment Guide

This document provides step-by-step instructions for deploying the Molar Mass Calculator application on Render.com.

## Prerequisites

1. A GitHub account with your repository pushed
2. A Render.com account (sign up at https://render.com)
3. Your code prepared for deployment

## Deployment Process

### Step 1: Push your code to GitHub

First, ensure all the changes we've made are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "Prepare application for Render deployment"
git push origin main
```

### Step 2: Set up Your Render Account

1. Sign up for a Render account at https://render.com if you don't have one already
2. Verify your email address
3. Connect your GitHub account to Render from the Render dashboard

### Step 3: Create a New Blueprint on Render

1. Log in to your Render dashboard
2. Click on the "New" button
3. Select "Blueprint" from the dropdown menu
4. Select your GitHub repository (yourName/ChemCal)
5. Render will automatically detect the `render.yaml` file we created
6. Review the services it will create (backend API, frontend, and database)
7. Click "Apply Blueprint"

### Step 4: Wait for Deployment

1. Render will now start building and deploying your services
2. This process may take 5-10 minutes for the initial deployment
3. You can monitor the progress in the Render dashboard

### Step 5: Initialize the Database

After deployment is complete:

1. Go to your backend service in the Render dashboard
2. Open the "Shell" tab
3. Run the following command to create the database tables:
   ```
   python -c "from database import create_tables; create_tables()"
   ```

### Step 6: Access Your Application

1. Once deployment is complete, click on the URL for your frontend service
2. Your application should now be live on the internet!
3. Test it by entering a chemical formula like "H2O"

## URLs and Access

- Frontend: Your frontend will be available at `https://molar-mass-calculator-frontend.onrender.com`
- Backend API: Your API will be available at `https://molar-mass-calculator-api.onrender.com`

## Maintenance and Updates

### Updating Your Application

When you make changes to your code:

1. Commit and push your changes to GitHub
2. Render will automatically detect the changes and deploy them
3. For database schema changes, you may need to manually run migrations

### Monitoring

1. Use the Render dashboard to monitor your services
2. Check logs if there are any issues
3. Set up alerts in Render for critical events

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check the database connection string in the environment variables
   - Ensure the database service is running

2. **Build Failures**:
   - Check the build logs in the Render dashboard
   - Ensure your package.json has all the required dependencies

3. **Runtime Errors**:
   - Check the service logs for error messages
   - You may need to SSH into the service for deeper debugging

## Alternative: Frontend on Netlify, Backend on Render

If you prefer to deploy your frontend on Netlify while keeping the backend on Render:

1. Deploy the backend and database to Render using the steps above
2. Create a new Netlify account at https://netlify.com
3. Link your GitHub repository to Netlify
4. Set up the following build configuration:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
   - Environment variables: Set `VITE_API_URL` to your Render backend URL

This approach can offer better performance for the frontend with Netlify's global CDN, while still leveraging Render's excellent container support for your backend.

## Costs and Scaling

- The free tier on Render should be sufficient for development and light usage
- As your application grows, you may need to upgrade to paid plans
- Consider setting up usage alerts to avoid unexpected charges
