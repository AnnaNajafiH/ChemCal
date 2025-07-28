# Deploying Backend to Render

This directory contains the backend API for the Molar Mass Calculator. The API is built with FastAPI and uses a MySQL database to store formula history.

## API Endpoints

- `GET /`: Health check endpoint
- `POST /molar-mass`: Calculate molar mass of a chemical formula
- `GET /history`: Get formula calculation history
- `PUT /history/{formula_id}`: Update a formula in history
- `DELETE /history/{formula_id}`: Delete a formula from history

## Deployment

This backend is configured for deployment on Render.com. The `Dockerfile` is set up to build and run the API in a container.

### Environment Variables

- `DATABASE_URL`: Connection string for the database
- `ENVIRONMENT`: Set to `production` for production deployments
- `DOCKER_ENV`: Set to `true` to indicate the app is running in Docker

### Post-Deployment Steps

After the application is deployed, you need to initialize the database:

1. Go to the "Shell" tab in your Render dashboard
2. Run the command: `python -c "from database import create_tables; create_tables()"`

## Connection to Frontend

This backend API will be consumed by a frontend application deployed on Netlify. Make sure to set the appropriate CORS headers if needed.
