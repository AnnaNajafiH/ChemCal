import re
import json
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

# Import the database models
from database import FormulaHistory, get_db, create_tables

app = FastAPI(title="Molar Mass Calculator API", 
              description="API for calculating molar mass of chemical compounds")

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
    tokens = re.findall(r'[A-Z][a-z]?|\d+|\(|\)', formula)
    stack = [[]]
    i = 0

    while i < len(tokens):
        token = tokens[i]

        if token == '(':
            stack.append([])
        elif token == ')':
            group = stack.pop()
            i += 1
            multiplier = int(tokens[i]) if i < len(tokens) and tokens[i].isdigit() else 1
            if i < len(tokens) and tokens[i].isdigit():
                i += 1
            for elem, count in group:
                stack[-1].append((elem, count * multiplier))
            continue
        elif re.match(r'[A-Z][a-z]?', token):
            element = token
            i += 1
            count = int(tokens[i]) if i < len(tokens) and tokens[i].isdigit() else 1
            if i < len(tokens) and tokens[i].isdigit():
                i += 1
            stack[-1].append((element, count))
            continue
        else:
            i += 1

    return stack[0]

def calculate_molar_mass(formula):
    parsed = parse_formula(formula)
    total_mass = 0
    for element, count in parsed:
        if element not in atomic_masses:
            raise ValueError(f"Unknown element: {element}")
        total_mass += atomic_masses[element] * count
    return total_mass

# Pydantic models for request/response validation
class FormulaRequest(BaseModel):
    formula: str

class FormulaResponse(BaseModel):
    formula: str
    molar_mass: float
    unit: str

class FormulaHistoryModel(BaseModel):
    id: int
    formula: str
    molar_mass: float
    timestamp: datetime
    
    class Config:
        orm_mode = True

# API endpoint for molar mass calculation
@app.post("/molar-mass", response_model=FormulaResponse)
def get_molar_mass(request: FormulaRequest, db: Session = Depends(get_db), req: Request = None):
    try:
        molar_mass = calculate_molar_mass(request.formula)
        result = {
            "formula": request.formula,
            "molar_mass": round(molar_mass, 4),
            "unit": "g/mol"
        }
        
        # Try to save in database but don't fail if database is not available
        try:
            client_ip = req.client.host if req else None
            db_formula = FormulaHistory(
                formula=request.formula,
                molar_mass=round(molar_mass, 4),
                user_ip=client_ip
            )
            db.add(db_formula)
            db.commit()
        except Exception as db_error:
            print(f"Database error (non-critical): {str(db_error)}")
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# Save formula to history
@app.post("/save")
def save_formula(request: FormulaRequest, db: Session = Depends(get_db), req: Request = None):
    try:
        molar_mass = calculate_molar_mass(request.formula)
        
        client_ip = req.client.host if req else None
        db_formula = FormulaHistory(
            formula=request.formula,
            molar_mass=round(molar_mass, 4),
            user_ip=client_ip
        )
        db.add(db_formula)
        db.commit()
        db.refresh(db_formula)
        
        return {"message": "Formula saved successfully", "id": db_formula.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving formula: {str(e)}")

# Get formula history
@app.get("/history", response_model=List[FormulaHistoryModel])
def get_history(limit: int = 10, db: Session = Depends(get_db)):
    formulas = db.query(FormulaHistory).order_by(FormulaHistory.timestamp.desc()).limit(limit).all()
    return formulas

# Simple health check endpoint
@app.get("/")
def read_root():
    return {"status": "alive", "message": "Molar Mass Calculator API is running"}

# Create database tables on startup
@app.on_event("startup")
def startup_db_client():
    try:
        create_tables()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Warning: Could not create database tables: {str(e)}")
        print("The API will still work without database functionality")
