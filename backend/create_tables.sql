-- PostgreSQL table creation script
CREATE TABLE IF NOT EXISTS formula_history (
    id SERIAL PRIMARY KEY,
    formula VARCHAR(255) NOT NULL,
    molar_mass FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
