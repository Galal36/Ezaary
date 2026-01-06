-- Create database for Izaar E-Commerce
-- Run this script with: psql -U postgres -f create_db.sql

-- Drop database if exists (WARNING: This will delete all data!)
-- DROP DATABASE IF EXISTS izaar_db;

-- Create database
CREATE DATABASE izaar_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE izaar_db TO postgres;

\c izaar_db

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Display success message
\echo 'Database izaar_db created successfully!'
\echo 'You can now run Django migrations: python manage.py migrate'





