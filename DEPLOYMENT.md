# Molar Mass Calculator Deployment Guide

## Prerequisites
- Docker and Docker Compose installed on your deployment server
- Git installed to clone your repository

## Deployment Steps

### 1. Clone your repository
```bash
git clone https://github.com/AnnaNajafiH/ChemCal.git
cd ChemCal
```

### 2. Ensure you're on the main branch
```bash
git checkout main
```

### 3. Create a .env file (optional)
If you want to customize any environment variables:

```bash
touch .env
```

Add any desired environment variables:
```
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=molar_mass_db
MYSQL_USER=molar_user
MYSQL_PASSWORD=your_secure_password
FRONTEND_PORT=80
BACKEND_PORT=8000
```

### 4. Build and start the Docker containers
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
This command will:
- Build the Docker images for the frontend, backend, and database
- Create and start the containers
- Set up the necessary networks

### 5. Initialize the database (first time only)
```bash
docker-compose -f docker-compose.prod.yml exec backend python -c "from database import create_tables; create_tables()"
```
You should see output confirming the database tables were created successfully.

### 6. Test the API endpoint
```bash
curl http://localhost/api/
```
You should see a response like:
```json
{"status":"alive","message":"Molar Mass Calculator API is running"}
```

### 7. Test the molar mass calculation
```bash
curl -X POST http://localhost/api/molar-mass -H "Content-Type: application/json" -d '{"formula":"H2O"}'
```
You should receive a JSON response with the calculated molar mass and chemical properties.

### 8. Verify the deployment
- Frontend should be accessible at: http://localhost
- Backend API should be accessible through: http://localhost/api
- Try entering a chemical formula like "H2O" or "C6H12O6" in the frontend to test the full functionality

## Maintenance

### Stopping the application
```bash
docker-compose -f docker-compose.prod.yml down
```

### Restarting after updates
```bash
# Make sure you're on the main branch
git checkout main

# Pull latest changes
git pull

# Rebuild and restart containers
docker-compose -f docker-compose.prod.yml up -d --build

# Reinitialize database if there were schema changes
docker-compose -f docker-compose.prod.yml exec backend python -c "from database import create_tables; create_tables()"
```

### Viewing logs
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# Follow logs from specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f mysql
```

### Backing up the database
```bash
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u root -p molar_mass_db > molar_mass_backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### Container not starting
Check the logs for the specific container:
```bash
docker-compose -f docker-compose.prod.yml logs backend
```

### Database connection issues
Ensure the MySQL container is running and healthy:
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Rebuilding a specific service
If you need to rebuild just one service:
```bash
docker-compose -f docker-compose.prod.yml up -d --build backend
```

### Restarting a specific service
```bash
docker-compose -f docker-compose.prod.yml restart backend
```

## Development Workflow

If you're working on a feature branch and want to deploy to production:

1. Commit your changes to your feature branch
```bash
git add .
git commit -m "Your descriptive commit message"
git push origin your-feature-branch
```

2. Merge your feature branch into main
```bash
git checkout main
git merge your-feature-branch
git push origin main
```

3. Deploy the updated main branch
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
