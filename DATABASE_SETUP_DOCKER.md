# Setting Up a MySQL Database with Docker for Molar Mass Calculator

This guide provides a step-by-step approach to set up a MySQL database using Docker specifically for the Molar Mass Calculator application.

> **Note:** For a quick overview of all Docker-related files and configurations in this project, see [DOCKER_SUMMARY.md](./DOCKER_SUMMARY.md).

## Step 1: Install Docker

First, make sure you have Docker installed on your system:

- **Windows**: Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **macOS**: Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: Follow the [appropriate instructions](https://docs.docker.com/engine/install/) for your distribution

Verify your installation by running:
```bash
docker --version
```

## Step 2: Create a Volume for Data Persistence

Volumes ensure your data persists even if the container is removed:

```bash
docker volume create molar_mass_db_data
```

## Step 3: Run MySQL Container

### Option A: Run MySQL Container Directly

Use this command to create and start a MySQL container with a named volume:

```bash
docker run --name molar-mass-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=molar_mass_db \
  -e MYSQL_USER=molar_user \
  -e MYSQL_PASSWORD=molar_pass \
  -p 3306:3306 \
  -v molar_mass_db_data:/var/lib/mysql \
  -d mysql:8
```

This command:
- Creates a container named `molar-mass-mysql`
- Sets the root password to "root"
- Creates a database named `molar_mass_db`
- Creates a user `molar_user` with password `molar_pass`
- Maps port 3306 on your host to port 3306 in the container
- Mounts the `molar_mass_db_data` volume to `/var/lib/mysql` in the container
- Runs MySQL 8 in detached mode (background)

### Option B: Use Docker Compose (Recommended)

With Docker Compose, you can manage all services together. Create a file named `docker-compose.yml` in your project root:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8
    container_name: molar-mass-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: molar_mass_db
      MYSQL_USER: molar_user
      MYSQL_PASSWORD: molar_pass
    ports:
      - "3306:3306"
    volumes:
      - molar_mass_db_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  molar_mass_db_data:
    name: molar_mass_db_data
```

Then run:
```bash
docker-compose up -d
```

### Adding phpMyAdmin for Database Management

To easily manage your database through a web interface, you can add phpMyAdmin to your Docker Compose setup:

```yaml
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: molar-mass-phpmyadmin
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
      PMA_ARBITRARY: 1
      MYSQL_ROOT_PASSWORD: root
    ports:
      - "8080:80"
    depends_on:
      - mysql
    restart: unless-stopped
```

This will make phpMyAdmin available at http://localhost:8080 when you run `docker-compose up -d`.

## Step 4: Verify Container is Running

```bash
docker ps
```

You should see your `molar-mass-mysql` container listed as running.

## Step 5: Create Your DATABASE_URL

Based on the container configuration, your DATABASE_URL will be:

```
DATABASE_URL="mysql+pymysql://molar_user:molar_pass@localhost:3306/molar_mass_db"
```

## Step 6: Create or Update the .env File

Create a file named `.env` in the `backend` directory with the following content:

```properties
DATABASE_URL="mysql+pymysql://molar_user:molar_pass@localhost:3306/molar_mass_db"
```

## Step 7: Test the Connection

Start your FastAPI backend:

```bash
cd backend
uvicorn main:app --reload
```

If the server starts without database errors, your connection is working!

## Managing the Database with phpMyAdmin

When using the Docker Compose setup with phpMyAdmin:

1. Access phpMyAdmin at http://localhost:8080
2. Log in with one of the following credentials:
   - Username: root
   - Password: root
   
   Or:
   - Username: molar_user
   - Password: molar_pass
   - Database: molar_mass_db

3. You can use phpMyAdmin to:
   - Browse and search your formula history
   - Run custom SQL queries
   - Export/import data
   - Manage database users and permissions
   - Monitor database performance

## Useful Docker Commands

- **Stop the container**:
  ```bash
  docker stop molar-mass-mysql
  ```

- **Start the container** (after it's been created):
  ```bash
  docker start molar-mass-mysql
  ```

- **Remove the container** (data is preserved in the volume):
  ```bash
  docker rm molar-mass-mysql
  ```

- **Access MySQL CLI** within the container:
  ```bash
  docker exec -it molar-mass-mysql mysql -umolar_user -pmolar_pass molar_mass_db
  ```

- **View container logs**:
  ```bash
  docker logs molar-mass-mysql
  ```

## Troubleshooting

### Port Conflict

If port 3306 is already in use, change the port mapping:
```bash
docker run --name molar-mass-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=molar_mass_db -e MYSQL_USER=molar_user -e MYSQL_PASSWORD=molar_pass -p 3307:3306 -v molar_mass_db_data:/var/lib/mysql -d mysql:8
```

Then update your DATABASE_URL to use port 3307:
```
DATABASE_URL="mysql+pymysql://molar_user:molar_pass@localhost:3307/molar_mass_db"
```

### Connection Issues

If you're using Docker Desktop on Windows or macOS and have connection issues, ensure Docker Desktop is running and that virtualization is enabled in your BIOS.

### Container Doesn't Start

Check the container logs for detailed error messages:
```bash
docker logs molar-mass-mysql
```
