# Deployment to Render

This project has been configured for easy deployment to Render.com, a cloud platform that offers hosting for web applications.

## Quick Deploy

To deploy this application to Render:

1. Click the button below:

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AnnaNajafiH/ChemCal)

2. Follow the prompts to create a new Blueprint instance.

3. Render will automatically deploy the backend API, frontend web interface, and MySQL database.

## Manual Deployment

For step-by-step instructions on manually deploying to Render, see the [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) guide.

## Configuration

The application is configured using the `render.yaml` file in the root directory. This file defines the services, environment variables, and database required for the application.

## Architecture

When deployed on Render, the application consists of:

- A MySQL database for storing formula history
- A FastAPI backend service for calculations and database access
- A static frontend site built with React for user interaction

All services are automatically connected and configured through Render's Blueprint system.
