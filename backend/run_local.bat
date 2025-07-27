@echo off
set DATABASE_URL=mysql+pymysql://root:root@localhost:3306/molar_mass_db
echo Using database connection: %DATABASE_URL%
cd /d %~dp0
python -m uvicorn main:app --reload --log-level debug
