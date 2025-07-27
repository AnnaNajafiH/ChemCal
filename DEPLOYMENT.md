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

### 2. Create a .env file (optional)
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

### 3. Build and start the Docker containers
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Initialize the database (first time only)
```bash
docker-compose -f docker-compose.prod.yml exec backend python -c "from database import create_tables; create_tables()"
```

### 5. Verify the deployment
- Frontend should be accessible at: http://your-server-ip
- Backend API should be accessible through: http://your-server-ip/api

## Maintenance

### Stopping the application
```bash
docker-compose -f docker-compose.prod.yml down
```

### Restarting after updates
```bash
# Pull latest changes
git pull

# Rebuild and restart containers
docker-compose -f docker-compose.prod.yml up -d --build
```

### Viewing logs
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# Follow logs from specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Backing up the database
```bash
docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u root -p molar_mass_db > molar_mass_backup_$(date +%Y%m%d).sql
```
