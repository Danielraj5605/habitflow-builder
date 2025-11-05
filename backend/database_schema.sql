-- HabitFlow Database Schema for Neon PostgreSQL
-- This file contains the complete database schema for the HabitFlow application

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50) DEFAULT 'daily',
    weekly_goal INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT TRUE,
    tags JSONB DEFAULT '[]'::jsonb,
    icon VARCHAR(10) DEFAULT '🎯',
    streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for habits table
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_is_active ON habits(is_active);
CREATE INDEX IF NOT EXISTS idx_habits_created_at ON habits(created_at);

-- Habit logs table for tracking daily completions
CREATE TABLE IF NOT EXISTS habit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    completed_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for habit_logs table
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_completed_date ON habit_logs(completed_date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_habit_date ON habit_logs(user_id, habit_id, completed_date);

-- Create a unique constraint to prevent duplicate logs for the same habit on the same date
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_habit_log_per_date 
ON habit_logs(user_id, habit_id, DATE(completed_date));

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at timestamps
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;
CREATE TRIGGER update_habits_updated_at 
    BEFORE UPDATE ON habits 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional - remove in production)
-- INSERT INTO users (email, hashed_password) VALUES 
-- ('demo@habitflow.com', '$2b$12$example_hashed_password');

-- Habit summary table for tracking progress metrics
CREATE TABLE IF NOT EXISTS habit_summary (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    completion_rate FLOAT DEFAULT 0.0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, habit_id, summary_date)
);

-- Create indexes for habit_summary table
CREATE INDEX IF NOT EXISTS idx_habit_summary_user_id ON habit_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_summary_habit_id ON habit_summary(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_summary_date ON habit_summary(summary_date);

-- Trigger for habit_summary updated_at
DROP TRIGGER IF EXISTS update_habit_summary_updated_at ON habit_summary;
CREATE TRIGGER update_habit_summary_updated_at 
    BEFORE UPDATE ON habit_summary 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- View for habit statistics (optional)
CREATE OR REPLACE VIEW habit_stats AS
SELECT 
    h.id,
    h.name,
    h.user_id,
    COUNT(hl.id) as total_completions,
    COUNT(CASE WHEN hl.completed_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as completions_this_week,
    COUNT(CASE WHEN hl.completed_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as completions_this_month,
    MAX(hl.completed_date) as last_completion
FROM habits h
LEFT JOIN habit_logs hl ON h.id = hl.habit_id
WHERE h.is_active = TRUE
GROUP BY h.id, h.name, h.user_id;
