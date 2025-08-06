import json
import os
import re
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import FormulaHistory, create_tables, get_db
from pubchem_api import get_chemical_properties

# Initialize FastAPI app
app = FastAPI(
    title="Molar Mass Calculator API", 
    description="API for calculating molar mass of chemical compounds"
)

# Create database tables on startup
create_tables()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load atomic mass data from JSON
try:
    with open("./atomic_masses.json") as file:
        atomic_masses = json.load(file)
except FileNotFoundError:
    # Fallback to direct path if running from different directory
    with open("atomic_masses.json") as file:
        atomic_masses = json.load(file)

def parse_formula(formula):
    try:
        tokens = re.findall(r'[A-Z][a-z]?|\d+|\(|\)', formula)
        if not tokens:
            raise ValueError(f"Invalid formula format: {formula}")
        
        stack = [[]]
        i = 0

        while i < len(tokens):
            token = tokens[i]
            i += 1  # Always increment i after accessing tokens[i]

            if token == '(':
                stack.append([])
            elif token == ')':
                if len(stack) <= 1:
                    raise ValueError(f"Unbalanced parentheses in formula: {formula}")
                    
                group = stack.pop()
                
                # Check for a multiplier after the closing parenthesis
                if i < len(tokens) and tokens[i].isdigit():
                    multiplier = int(tokens[i])
                    i += 1
                else:
                    multiplier = 1
                    
                # Apply the multiplier to all elements in the group
                for elem, count in group:
                    stack[-1].append((elem, count * multiplier))
            elif re.match(r'[A-Z][a-z]?', token):
                element = token
                
                # Check for a count after the element
                if i < len(tokens) and tokens[i].isdigit():
                    count = int(tokens[i])
                    i += 1
                else:
                    count = 1
                    
                stack[-1].append((element, count))
            elif token.isdigit():
                # This handles cases where we have a digit without a preceding element
                raise ValueError(f"Unexpected number in formula: {formula} at position {i-1}")
            else:
                # This should not happen with our regex pattern
                raise ValueError(f"Invalid token in formula: {token}")

        # Check for unbalanced parentheses
        if len(stack) != 1:
            raise ValueError(f"Unbalanced parentheses in formula: {formula}")
            
        return stack[0]  # Returns a list of (element, count) pairs from the top-level group
    except Exception as e:
        # Catch any other unexpected errors and provide a clear message
        print(f"Error parsing formula '{formula}': {str(e)}")
        raise ValueError(f"Error parsing formula: {str(e)}")


def calculate_molar_mass(formula: str) -> float:
    """
    Calculate the molar mass of a chemical formula.
    
    Args:
        formula (str): Chemical formula
        
    Returns:
        float: Calculated molar mass in g/mol
        
    Raises:
        ValueError: If formula contains unknown elements
    """
    parsed = parse_formula(formula)
    total_mass = 0
    for element, count in parsed:
        if element not in atomic_masses:
            raise ValueError(f"Unknown element: {element}")
        total_mass += atomic_masses[element] * count
    return total_mass


# Pydantic models for request/response validation
class FormulaRequest(BaseModel):
    """Request model for formula calculations"""
    formula: str


class FormulaResponse(BaseModel):
    """Response model for formula calculations with physical properties"""
    formula: str
    molar_mass: float
    unit: str
    boiling_point: Optional[str] = None
    melting_point: Optional[str] = None
    density: Optional[str] = None
    state_at_room_temp: Optional[str] = None
    iupac_name: Optional[str] = None
    hazard_classification: Optional[str] = None
    structure_image_url: Optional[str] = None
    structure_image_svg_url: Optional[str] = None
    compound_url: Optional[str] = None


class FormulaHistoryModel(BaseModel):
    """Model for formula history data"""
    id: int
    formula: str
    molar_mass: float
    timestamp: datetime
    boiling_point: Optional[str] = None
    melting_point: Optional[str] = None
    density: Optional[str] = None
    state_at_room_temp: Optional[str] = None
    iupac_name: Optional[str] = None
    hazard_classification: Optional[str] = None
    structure_image_url: Optional[str] = None
    structure_image_svg_url: Optional[str] = None
    compound_url: Optional[str] = None
    
    class Config:
        orm_mode = True

# Validate chemical formula format
def validate_formula(formula):
    # Basic validation to catch obvious errors
    if not formula or not re.match(r'^[A-Za-z0-9\(\)]+$', formula):
        raise ValueError(f"Invalid formula format: {formula}")
    
    # Check for balanced parentheses
    stack = []
    for char in formula:
        if char == '(':
            stack.append(char)
        elif char == ')':
            if not stack:
                raise ValueError(f"Unbalanced parentheses in formula: {formula}")
            stack.pop()
    
    if stack:
        raise ValueError(f"Unbalanced parentheses in formula: {formula}")
    
    return formula

# API endpoint for molar mass calculation
@app.post("/molar-mass", response_model=FormulaResponse)
def get_molar_mass(request: FormulaRequest, db: Session = Depends(get_db), req: Request = None):
    try:
        # Validate formula format first
        validate_formula(request.formula)
        
        # Calculate molar mass
        molar_mass = calculate_molar_mass(request.formula)
        
        # Fetch physical/chemical properties from PubChem API
        properties = get_chemical_properties(request.formula)
        
        # Create result with properties (use values from API if available)
        result = {
            "formula": request.formula,
            "molar_mass": round(molar_mass, 4),
            "unit": "g/mol",
            "boiling_point": properties.get("boiling_point"),
            "melting_point": properties.get("melting_point"),
            "density": properties.get("density"),
            "state_at_room_temp": properties.get("state_at_room_temp"),
            "iupac_name": properties.get("iupac_name"),
            "hazard_classification": properties.get("hazard_classification"),
            "structure_image_url": properties.get("structure_image_url"),
            "structure_image_svg_url": properties.get("structure_image_svg_url"),
            "compound_url": properties.get("compound_url")
        }
        
        # Save to database (non-critical operation)
        _save_to_database(db, request.formula, molar_mass, properties, req)
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


def _save_to_database(db: Session, formula: str, molar_mass: float, properties: Dict, req: Request = None) -> None:
    """
    Helper function to save formula data to database.
    
    Args:
        db: Database session
        formula: Chemical formula
        molar_mass: Calculated molar mass
        properties: Chemical properties dictionary
        req: Request object for client IP tracking
    """
    try:
        client_ip = req.client.host if req else None
        db_formula = FormulaHistory(
            formula=formula,
            molar_mass=round(molar_mass, 4),
            user_ip=client_ip,
            boiling_point=properties.get("boiling_point"),
            melting_point=properties.get("melting_point"),
            density=properties.get("density"),
            state_at_room_temp=properties.get("state_at_room_temp"),
            iupac_name=properties.get("iupac_name"),
            hazard_classification=properties.get("hazard_classification"),
            structure_image_url=properties.get("structure_image_url"),
            structure_image_svg_url=properties.get("structure_image_svg_url"),
            compound_url=properties.get("compound_url")
        )
        db.add(db_formula)
        db.commit()
    except Exception as db_error:
        print(f"Database error (non-critical): {str(db_error)}")


# Get formula history
@app.get("/history", response_model=List[FormulaHistoryModel])
def get_history(limit: int = 10, db: Session = Depends(get_db)):
    formulas = db.query(FormulaHistory).order_by(FormulaHistory.timestamp.desc()).limit(limit).all()
    return formulas


# Update formula in history
@app.put("/history/{formula_id}", response_model=FormulaHistoryModel)
def update_formula(formula_id: int, request: FormulaRequest, db: Session = Depends(get_db)):
    try:
        # Find the formula by ID
        db_formula = db.query(FormulaHistory).filter(FormulaHistory.id == formula_id).first()
        if not db_formula:
            raise HTTPException(status_code=404, detail=f"Formula with ID {formula_id} not found")
        
        # Validate formula format first
        validate_formula(request.formula)
        
        # Calculate new molar mass
        molar_mass = calculate_molar_mass(request.formula)
        
        # Update the formula
        db_formula.formula = request.formula
        db_formula.molar_mass = round(molar_mass, 4)
        db_formula.timestamp = datetime.now()  # Update timestamp to current time
        
        db.commit()
        db.refresh(db_formula)
        
        return db_formula
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating formula: {str(e)}")

# Delete formula from history
@app.delete("/history/{formula_id}")
def delete_formula(formula_id: int, db: Session = Depends(get_db)):
    try:
        # Find the formula by ID
        db_formula = db.query(FormulaHistory).filter(FormulaHistory.id == formula_id).first()
        if not db_formula:
            raise HTTPException(status_code=404, detail=f"Formula with ID {formula_id} not found")
        
        # Delete the formula
        db.delete(db_formula)
        db.commit()
        
        return {"message": f"Formula with ID {formula_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting formula: {str(e)}")


# Simple health check endpoint
@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"status": "alive", "message": "Molar Mass Calculator API is running"}

# Create database tables on startup
@app.on_event("startup")
def startup_db_client():
    """
    Initialize database tables on application startup.
    Provides helpful troubleshooting information in non-production environments.
    """
    try:
        create_tables()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Warning: Could not create database tables: {str(e)}")
        print("The API will still work without database functionality")
        
        # When running locally, provide more helpful error messages
        if not os.environ.get('ENVIRONMENT') == 'production':
            if 'mysql' in str(e):
                print("\nTROUBLESHOOTING TIPS:")
                print("1. Make sure MySQL is running locally")
                print("2. Check that you can connect to MySQL with the credentials in your connection string")
                print("3. If you're using Docker, make sure the MySQL container is running")
                print("4. If you're running the app locally outside Docker but trying to connect to MySQL in Docker,")
                print("   update your connection string to use 'localhost' instead of 'mysql'")
                print("5. Try manually creating the database: CREATE DATABASE molar_mass_db;\n")
