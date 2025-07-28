# Deployment Documentation: Molar Mass Calculator

## 1. Project Overview

**Project Name:** Molar Mass Calculator  
**Repository:** [ChemCal](https://github.com/AnnaNajafiH/ChemCal)  
**Architecture:** Full-stack application with React frontend and Python FastAPI backend

## 2. Stack Components

- **Frontend:** 
  - React with TypeScript
  - Vite as build tool
  - Tailwind CSS for styling
  - Deployed on Netlify

- **Backend:**
  - Python FastAPI
  - PostgreSQL database (on Render)
  - Docker containerization
  - Deployed on Render

## 3. Deployment Preparation

### Code Adaptations for Deployment

1. **Database Connection Handling**
   - Enhanced `database.py` to support both local and cloud deployments
   - Added support for PostgreSQL (Render) in addition to MySQL (local)
   - Implemented connection string parsing with regex
   - Added automatic database table creation on application startup

2. **Frontend Configuration**
   - Modified `src/config.ts` to use environment variables for API URL
   - Created environment-specific API endpoint configuration

3. **Auto Table Creation**
   - Added code in `main.py` to call `create_tables()` on application startup
   - Created a SQL backup file (`create_tables.sql`) for manual initialization if needed

## 4. Database Deployment on Render

### Steps

1. **Create PostgreSQL Database**
   - Log into [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "PostgreSQL"
   - Configure:
     - Name: `molar-mass-calculator-db`
     - Database: `molar_mass_db`
     - User: `molar_user`
     - Region: (closest to users)
     - Instance Type: Free tier
   - Click "Create Database"

2. **Database Connection Details**
   - After creation, find the "Internal Database URL" in the Connections tab
   - URL format: `postgres://molar_user:password@pg-internal.render.com:5432/molar_mass_db`
   - This URL will be used in the backend environment variables

### Challenges & Solutions

- **MySQL to PostgreSQL Migration**
  - **Challenge:** Original code was using MySQL, but Render only offers PostgreSQL in free tier
  - **Solution:** Added code in `database.py` to handle both database types by detecting and modifying connection strings

- **Database Initialization**
  - **Challenge:** Free tier doesn't allow Shell access for running initialization commands
  - **Solution:** Added automatic table creation on application startup in `main.py`
  - **Backup:** Created `create_tables.sql` as a reference for manual initialization if needed

## 5. Backend Deployment on Render

### Steps

1. **Create Web Service**
   - Log into [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Connect to GitHub repository
   - Configure:
     - Name: `molar-mass-calculator-api`
     - Root Directory: `backend`
     - Runtime: Docker
     - Instance Type: Free tier

2. **Environment Variables**
   - In the "Environment" section, add:
     - `DATABASE_URL`: [Internal PostgreSQL URL from database service]
     - `ENVIRONMENT`: production
     - `DOCKER_ENV`: true

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Challenges & Solutions

- **Docker Configuration**
  - **Challenge:** Docker setup needs to work on both local and cloud
  - **Solution:** `Dockerfile` already properly configured to run in both environments

- **Table Creation Without Shell Access**
  - **Challenge:** Free tier doesn't allow shell access to run initialization commands
  - **Solution:** Added automatic table creation code to `main.py`:
    ```python
    # Create database tables on startup
    create_tables()
    ```

- **CORS Configuration**
  - **Challenge:** Backend needs to accept requests from Netlify domain
  - **Solution:** Already using wide CORS configuration with `allow_origins=["*"]`

## 6. Frontend Deployment on Netlify

### Steps

1. **Create Site**
   - Log into [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub repository

2. **Build Configuration**
   - Configure:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `frontend/dist`

3. **Environment Variables**
   - Under "Advanced build settings", add:
     - Key: `VITE_API_URL`
     - Value: [Render backend URL, e.g., https://molar-mass-calculator-api.onrender.com]

4. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete

### Challenges & Solutions

- **API URL Configuration**
  - **Challenge:** Frontend needs to know backend URL which is different in production
  - **Solution:** Used environment variable `VITE_API_URL` for configuration

## 7. Post-Deployment Verification

1. **Database Verification**
   - Check if tables are automatically created on startup
   - Verify data persistence by saving formulas and checking history

2. **API Testing**
   - Test basic endpoints: `/` (health check), `/molar-mass`, `/history`
   - Verify that formula calculations work correctly
   - Check that history is being saved and retrieved properly

3. **Frontend Testing**
   - Test formula input and calculation
   - Verify formula history display
   - Test on multiple devices to ensure responsive design

## 8. Maintenance Considerations

1. **Database Backups**
   - Render provides automatic backups for PostgreSQL databases
   - Consider setting up scheduled exports for additional safety

2. **Monitoring**
   - Check Render and Netlify dashboards for performance metrics
   - Set up alerts for service downtime if needed

3. **Scaling**
   - Both Render and Netlify offer paid tiers for increased performance if needed
   - Consider optimizing database queries if the history grows large

## 9. Important Notes for Future Reference

1. **Connection Strings**
   - Local development: MySQL via Docker (`mysql+pymysql://molar_user:molar_pass@mysql:3306/molar_mass_db`)
   - Production: PostgreSQL on Render (format: `postgres://user:password@pg-internal.render.com:5432/dbname`)

2. **Environment Variables**
   - Backend needs `DATABASE_URL`, `ENVIRONMENT`, `DOCKER_ENV`
   - Frontend needs `VITE_API_URL`

3. **Automatic Table Creation**
   - Tables are created automatically on application startup
   - No need for manual initialization in free tier

4. **Repository Structure**
   - Backend code in `/backend`
   - Frontend code in `/frontend`
   - Deployment configurations: `render.yaml` and `netlify.toml`

5. **Troubleshooting Common Issues**

   - **Backend Connection Issues:**
     - Check Render logs for database connection errors
     - Verify environment variables are correctly set
     - Check if PostgreSQL service is running

   - **Frontend API Connection:**
     - Verify CORS headers if getting CORS errors
     - Check browser console for network errors
     - Verify the `VITE_API_URL` is set correctly and accessible

   - **Database Issues:**
     - Check if tables were created successfully
     - Verify connection string format is correct
     - Look for SQL errors in the backend logs
