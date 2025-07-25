# Molar Mass Calculator

A full-stack web application that calculates the molar mass of chemical compounds.

## Features

- Calculate molar mass of any chemical formula (e.g., H2O, C6H12O6, Ca(OH)2)
- Support for complex formulas with nested parentheses
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

2. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. If using MySQL (optional), create a new database and update the database URL in `database.py`:
   ```python
   SQLALCHEMY_DATABASE_URL = "mysql+pymysql://username:password@localhost/molar_mass_db"
   ```

4. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to `http://localhost:5173`

## API Endpoints

- `GET /` - Health check endpoint
- `POST /molar-mass` - Calculate molar mass
- `GET /history` - Get calculation history (requires database)
- `POST /save` - Explicitly save a formula to history (requires database)

## Database Schema

```sql
CREATE TABLE formulas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    formula VARCHAR(100) INDEX,
    molar_mass FLOAT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_ip VARCHAR(45)
);
```

## License

MIT
# ChemCal
