# Docker Setup Summary for Molar Mass Calculator

## Files Created or Modified

1. **docker-compose.yml**
   - Main Docker Compose configuration for running all services together
   - Includes MySQL, backend, frontend, and phpMyAdmin services
   - Sets up persistent volumes for data storage

2. **backend/Dockerfile**
   - Containerization configuration for the FastAPI backend
   - Uses Python 3.10 as the base image
   - Installs dependencies and runs the API server

3. **frontend/Dockerfile**
   - Containerization configuration for the React frontend
   - Uses Node.js 18 as the base image
   - Installs dependencies and runs the development server

4. **DATABASE_SETUP_DOCKER.md**
   - Comprehensive guide for setting up a MySQL database with Docker
   - Step-by-step instructions with explanations
   - Troubleshooting tips for common issues

5. **README.md**
   - Added Docker Compose instructions for running the application
   - Added reference to the Docker database setup guide
   - Enhanced the database setup section with options

6. **frontend/vite.config.ts**
   - Added proxy configuration for API communication
   - Enabled host binding to '0.0.0.0' for Docker compatibility

## Quick Start Guide

### Running the Entire Application with Docker Compose

```bash
# From the project root directory
docker-compose up -d
```

This will:
1. Start a MySQL container with a persistent volume
2. Build and start the FastAPI backend container
3. Build and start the React frontend container
4. Start phpMyAdmin for database management
5. Configure all necessary networking between containers

Access the application components:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- phpMyAdmin (database UI): http://localhost:8080

### Accessing the Database through phpMyAdmin

1. Open your browser and navigate to http://localhost:8080
2. Login with one of these credentials:
   - Username: `root`, Password: `root` (full admin access)
   - Username: `molar_user`, Password: `molar_pass` (limited to molar_mass_db)

### Running Only the Database with Docker

If you want to run just the database in Docker but the application locally:

```bash
# From the project root directory
docker run --name molar-mass-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=molar_mass_db \
  -e MYSQL_USER=molar_user \
  -e MYSQL_PASSWORD=molar_pass \
  -p 3306:3306 \
  -v molar_mass_db_data:/var/lib/mysql \
  -d mysql:8
```

Then update your `.env` file in the backend directory:
```
DATABASE_URL="mysql+pymysql://molar_user:molar_pass@localhost:3306/molar_mass_db"
```

## Useful Commands

- View all running containers: 
  ```bash
  docker ps
  ```

- View container logs:
  ```bash
  docker logs molar-mass-mysql
  docker logs molar-mass-backend
  docker logs molar-mass-frontend
  ```

- Stop all services:
  ```bash
  docker-compose down
  ```

- Remove all containers and volumes:
  ```bash
  docker-compose down -v
  ```

- Rebuild and restart services after making changes:
  ```bash
  docker-compose up -d --build
  ```
