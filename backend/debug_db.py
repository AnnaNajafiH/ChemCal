import sys
sys.path.append('.')
from sqlalchemy import inspect, create_engine, MetaData, text
import os

# For local debugging
print(f"Current DATABASE_URL: {os.environ.get('DATABASE_URL', 'Not set')}")
os.environ["DATABASE_URL"] = "mysql+pymysql://root:root@localhost:3306/molar_mass_db"
print(f"New DATABASE_URL: {os.environ.get('DATABASE_URL')}")

from database import Base, SQLALCHEMY_DATABASE_URL

def main():
    db_url = SQLALCHEMY_DATABASE_URL
    print(f"Database URL: {db_url}")
    
    try:
        # Create engine and connect
        engine = create_engine(db_url)
        connection = engine.connect()
        print("Connection succeeded!")
        
        # Get all table names
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        print(f"Tables: {table_names}")
        
        # Check columns in 'formulas' table
        if 'formulas' in table_names:
            columns = inspector.get_columns('formulas')
            print("Columns in 'formulas':")
            for column in columns:
                print(f"{column['name']}: {column['type']}")
            
            # Check for specific columns
            column_names = [col['name'] for col in columns]
            for expected_col in ['structure_image_url', 'structure_image_svg_url', 'compound_url']:
                if expected_col in column_names:
                    print(f"{expected_col}: {next((col['type'] for col in columns if col['name'] == expected_col), None)}")
                else:
                    print(f"{expected_col} NOT in table")
        
        connection.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
