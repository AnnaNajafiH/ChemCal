from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv
import os


# Load environment variables from .env file
load_dotenv()

# Hard-coded connection string for local development
# For Docker, the environment variable DATABASE_URL should be set
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:root@localhost:3306/molar_mass_db"
)

print(f"Connecting to database with: {SQLALCHEMY_DATABASE_URL}")

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
    boiling_point = Column(String(100), nullable=True)
    melting_point = Column(String(100), nullable=True)
    density = Column(String(100), nullable=True)
    state_at_room_temp = Column(String(50), nullable=True)
    iupac_name = Column(String(255), nullable=True)
    hazard_classification = Column(String(255), nullable=True)

# Function to create all tables
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print(f"Database tables created successfully using connection: {SQLALCHEMY_DATABASE_URL}")
    except Exception as e:
        print(f"Failed to create database tables: {str(e)}")
        print(f"Connection string used: {SQLALCHEMY_DATABASE_URL}")
        print("Please check your database connection settings and ensure MySQL is running")
        raise

# Function to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
