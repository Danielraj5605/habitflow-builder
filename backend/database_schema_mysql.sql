-- HabitFlow Database Schema for MySQL
-- This file contains the complete database schema for the HabitFlow application

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50) DEFAULT 'daily',
    weekly_goal INT DEFAULT 7,
    is_active TINYINT(1) DEFAULT 1,
    tags JSON,
    icon VARCHAR(10) DEFAULT '🎯',
    streak INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for habits table
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_is_active ON habits(is_active);
CREATE INDEX idx_habits_created_at ON habits(created_at);

-- Habit logs table for tracking daily completions
CREATE TABLE IF NOT EXISTS habit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    habit_id INT NOT NULL,
    completed_date DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);

-- Create indexes for habit_logs table
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_completed_date ON habit_logs(completed_date);
CREATE INDEX idx_habit_logs_user_habit_date ON habit_logs(user_id, habit_id, DATE(completed_date));

-- Create a unique constraint to prevent duplicate logs for the same habit on the same date
CREATE UNIQUE INDEX idx_unique_habit_log_per_date 
ON habit_logs(user_id, habit_id, DATE(completed_date));

-- Habit Summary table for storing aggregated progress data
CREATE TABLE IF NOT EXISTS habit_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    habit_id INT NOT NULL,
    summary_date DATE NOT NULL,
    completion_rate FLOAT DEFAULT 0.0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    total_completions INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE (user_id, habit_id, summary_date)
);

-- Create indexes for habit_summary table
CREATE INDEX idx_habit_summary_user_id ON habit_summary(user_id);
CREATE INDEX idx_habit_summary_habit_id ON habit_summary(habit_id);
CREATE INDEX idx_habit_summary_summary_date ON habit_summary(summary_date);

-- View for habit statistics (optional)
CREATE OR REPLACE VIEW habit_stats AS
SELECT 
    h.id,
    h.name,
    h.user_id,
    COUNT(hl.id) as total_completions,
    COUNT(CASE WHEN hl.completed_date >= CURDATE() - INTERVAL 7 DAY THEN 1 END) as completions_this_week,
    COUNT(CASE WHEN hl.completed_date >= CURDATE() - INTERVAL 30 DAY THEN 1 END) as completions_this_month,
    MAX(hl.completed_date) as last_completion
FROM habits h
LEFT JOIN habit_logs hl ON h.id = hl.habit_id
WHERE h.is_active = 1
GROUP BY h.id, h.name, h.user_id;