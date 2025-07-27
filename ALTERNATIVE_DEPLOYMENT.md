# Alternative Deployment Options

## Backend Standalone Deployment (Railway.app)

1. Sign up for Railway.app
2. Create a new project and select "Deploy from GitHub"
3. Connect to your GitHub repository
4. Add a MySQL database service to your project
5. Configure environment variables:
   - DATABASE_URL=mysql://username:password@host:port/molar_mass_db
6. Add start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Frontend Standalone Deployment (Vercel)

1. Sign up for Vercel
2. Create a new project and import from GitHub
3. Configure build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Configure environment variables:
   - VITE_API_URL=https://your-backend-url.railway.app
5. Deploy

## Update the config.ts to use environment variable

```typescript
// Create or update this file in your frontend src directory
const API_URL = import.meta.env.VITE_API_URL 
  || (import.meta.env.PROD ? '/api' : 'http://localhost:8000');

export default API_URL;
```

## Configure CORS in your backend

Update the FastAPI CORS middleware configuration in main.py:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-url.vercel.app", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
