# Setting up the MySQL Database

here are instructions to set up your database using XAMPP (or another MySQL server):

## Option 1: Using XAMPP (Recommended for Windows)

1. **Download and Install XAMPP**:
   - Download from: [https://www.apachefriends.org/download.html](https://www.apachefriends.org/download.html)
   - Install with at least MySQL and phpMyAdmin components

2. **Start MySQL Service**:
   - Open XAMPP Control Panel
   - Click "Start" next to MySQL
   
3. **Create the Database**:
   - Click "Admin" next to MySQL to open phpMyAdmin
   - Click "New" in the left sidebar
   - Enter "molar_mass_db" as the database name
   - Click "Create"

4. **Update .env file** (if password is different):
   - The default XAMPP MySQL credentials are:
     - Username: root
     - Password: (empty - no password)
   - Update your .env file if needed:
     ```
     DATABASE_URL="mysql+pymysql://root:@localhost:3306/molar_mass_db"
     ```

## Option 2: Using Docker

For Docker-based setup (recommended for better isolation and consistency), please refer to the comprehensive guide:

- [DATABASE_SETUP_DOCKER.md](./DATABASE_SETUP_DOCKER.md)

This dedicated guide provides complete step-by-step instructions for setting up MySQL with Docker, including volume persistence for your data.

## Testing Your Connection

After setting up the database, run your FastAPI backend:

```bash
cd backend
uvicorn main:app --reload
```

If the server starts without database errors, your database connection is working!
