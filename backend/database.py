from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv
import os


# Load environment variables from .env file
load_dotenv()

# Use environment variables or hardcoded connection string for now (in production, use environment variables)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:password@localhost/molar_mass_db" # fallback
)

# Create SQLAlchemy engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

# Formula history model
class FormulaHistory(Base):
    __tablename__ = "formulas"

    id = Column(Integer, primary_key=True, index=True)
    formula = Column(String(100), index=True)
    molar_mass = Column(Float)
    timestamp = Column(DateTime, default=func.now())
    user_ip = Column(String(45), nullable=True)  # IPv6 addresses can be long

# Function to create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Function to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
