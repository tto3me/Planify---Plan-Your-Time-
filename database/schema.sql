
-- Create Database
CREATE DATABASE IF NOT EXISTS planify_db;
USE planify_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table (Linked to User)
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    type ENUM('Task', 'Meeting', 'Course') DEFAULT 'Task',
    status ENUM('todo', 'in-progress', 'completed') DEFAULT 'todo',
    color VARCHAR(20) DEFAULT 'blue',
    reminder VARCHAR(100),
    location_name VARCHAR(255),
    location_address TEXT,
    location_url TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bills Table (Linked to User)
CREATE TABLE IF NOT EXISTS bills (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    dueDate DATE NOT NULL,
    status ENUM('paid', 'pending') DEFAULT 'pending',
    category ENUM('invoice', 'subscription') DEFAULT 'invoice',
    reminder VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Settings Table (Linked to User)
CREATE TABLE IF NOT EXISTS settings (
    user_id VARCHAR(50) PRIMARY KEY,
    darkMode BOOLEAN DEFAULT FALSE,
    language ENUM('fr', 'en') DEFAULT 'fr',
    timeFormat ENUM('24h', '12h') DEFAULT '24h',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
