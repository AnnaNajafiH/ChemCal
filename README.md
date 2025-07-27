# Molar Mass Calculator

A full-stack web application that calculates the molar mass of chemical compounds.

> **Note:** For a guide to all documentation files in this project, see [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md)

## Features

- Calculate molar mass of any chemical formula (e.g., H2O, C6H12O6, Ca(OH)2)
- Support for complex formulas with nested parentheses
- Return key physical and chemical properties (boiling point, melting point, density, etc.)
- Save calculations to history (requires MySQL database)
- View calculation history

## Tech Stack

- **Backend**: Python with FastAPI
- **Frontend**: React with TypeScript and Tailwind CSS v3
- **Database**: MySQL (optional) with SQLAlchemy ORM

## Project Structure

```
molar_mass_calculator/
├── atomic_masses.json      # JSON data file with atomic masses
├── molar_mass_calculator.py # Original Python script
├── backend/                # FastAPI backend
│   ├── main.py            # Main API endpoints
│   ├── database.py        # Database models and connection
│   └── requirements.txt   # Python dependencies
└── frontend/              # React frontend
    ├── src/              # Source code
    │   ├── components/   # React components
    │   ├── App.tsx       # Main application component
    │   └── ...
    ├── package.json      # Node.js dependencies
    └── ...
```

## Setup and Installation

### Prerequisites

- Python 3.10+
- Node.js 16+
- MySQL (optional)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up the database:
   
   **Option A: Local MySQL Server**
   - Create a MySQL database named `molar_mass_db`
   - Create a `.env` file in the backend directory if it doesn't exist
   - Configure the database connection in `.env` file:
     ```
     DATABASE_URL="mysql+pymysql://username:password@localhost:3306/molar_mass_db"
     ```
   - Replace `username` and `password` with your MySQL credentials
   - Default port for MySQL is 3306, change if your setup is different
   
   **Option B: Docker MySQL Container** (Recommended)
   - Follow the detailed guide in [DATABASE_SETUP_DOCKER.md](./DATABASE_SETUP_DOCKER.md)
   - This provides a containerized MySQL database with proper volume persistence
   
   Note: The `.env` file is in `.gitignore` to keep your database credentials secure
   
4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The React app will be available at http://localhost:5173 (or another port if 5173 is in use)

## Troubleshooting

### Tailwind CSS Not Applying Styles

If Tailwind CSS classes are not being applied to your components, follow these steps:

1. **Check Tailwind Version Compatibility**: 
   - This project uses Tailwind CSS v3.3.3, which is more stable for this setup
   - Avoid using Tailwind CSS v4+ as it has a different configuration approach

2. **Fix PostCSS Configuration**:
   - Ensure you have only one PostCSS configuration file (either `postcss.config.js` or `postcss.config.mjs`)
   - The correct configuration for Tailwind v3 should look like:
     ```javascript
     export default {
       plugins: {
         tailwindcss: {},
         autoprefixer: {},
       },
     }
     ```

3. **Tailwind Configuration**:
   - Make sure `tailwind.config.js` has the correct content paths:
     ```javascript
     /** @type {import('tailwindcss').Config} */
     export default {
       content: [
         "./index.html",
         "./src/**/*.{js,ts,jsx,tsx}",
       ],
       darkMode: 'class',
       theme: {
         extend: {},
       },
       plugins: [],
     }
     ```

4. **Reinstall Dependencies** if needed:
   ```bash
   npm uninstall tailwindcss postcss autoprefixer
   npm install -D tailwindcss@3.3.3 postcss autoprefixer
   npx tailwindcss init -p
   ```

5. **Check CSS File**: Ensure your main CSS file includes the Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

These steps should resolve most issues with Tailwind CSS styling not being applied to your components.

## Running the Application

### Option 1: Run Services Locally

After completing the setup process:

1. Start the backend server (from the backend directory):
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at http://localhost:8000

2. Start the frontend server (from the frontend directory):
   ```bash
   npm run dev
   ```
   The React app will be available at http://localhost:5173

3. Open your browser and go to http://localhost:5173 to use the application

### Option 2: Run with Docker Compose (Recommended)

This project includes a `docker-compose.yml` file to run all services together:

1. Make sure Docker Desktop is running

2. Run the entire stack with one command from the project root:
   ```bash
   docker-compose up -d
   ```

3. Access the application at http://localhost:5173

4. Access phpMyAdmin at http://localhost:8080
   - Username: root
   - Password: root
   - Alternatively, use:
     - Username: molar_user
     - Password: molar_pass

5. To stop all services:
   ```bash
   docker-compose down
   ```

6. To stop all services and remove the volumes:
   ```bash
   docker-compose down -v
   ```

Note: The first time you run Docker Compose, it will build the images which may take a few minutes.

## API Endpoints

- `GET /` - Health check endpoint
- `POST /molar-mass` - Calculate molar mass and return physical/chemical properties
- `GET /history` - Get calculation history (requires database)
- `PUT /history /{formula_id}` - To Edit 
- `DELETE /history /{formula_id}` - To Delete 

### Key Physical/Chemical Properties

Along with the molar mass, the `/molar-mass` endpoint now returns additional information if available:
- Boiling point
- Melting point
- Density
- State at room temperature
- IUPAC name
- Any hazard classification (optional, if available)

These properties are automatically fetched from the [PubChem PUG REST API](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest), which provides comprehensive chemical data for known compounds. The API lookup is performed using the chemical formula or name as input.

## Database Information

### Schema

The application uses the following database schema:

```sql
CREATE TABLE formulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    formula VARCHAR(100) INDEX,
    molar_mass FLOAT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_ip VARCHAR(45),
    boiling_point VARCHAR(100),
    melting_point VARCHAR(100),
    density VARCHAR(100),
    state_at_room_temp VARCHAR(50),
    iupac_name VARCHAR(255),
    hazard_classification VARCHAR(255)
);
```

### Database Management

- You can manage the database using phpMyAdmin at http://localhost:8080 when running with Docker Compose
- Login credentials:
  - Username: root
  - Password: root
  - Database: molar_mass_db

### Note About Database Usage

- The formula history feature requires a MySQL database connection
- If the database connection fails, the application will still calculate molar masses but won't save the history
- The database is automatically initialized when the backend starts if tables don't exist

## Database Setup with Docker (Recommended)

For detailed instructions on setting up the database with Docker, please refer to:

- [DATABASE_SETUP_DOCKER.md](./DATABASE_SETUP_DOCKER.md): Complete step-by-step guide for setting up MySQL with Docker
- [DOCKER_SUMMARY.md](./DOCKER_SUMMARY.md): Overview of all Docker-related configurations in this project

These guides provide detailed instructions for:
- Installing Docker
- Creating persistent volumes for data storage
- Running MySQL in Docker
- Configuring your DATABASE_URL
- Managing Docker containers
- Troubleshooting common issues

## License

MIT
