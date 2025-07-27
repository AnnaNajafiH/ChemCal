#!/bin/bash
# For local development, set environment variables
export DATABASE_URL="mysql+pymysql://root:root@localhost:3306/molar_mass_db"

# Start the backend server
python -m uvicorn main:app --reload
