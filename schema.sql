DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS focus_sessions;
DROP TABLE IF EXISTS notes;

CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE focus_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    duration_minutes INTEGER NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'Study',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    ai_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data for a polished demo experience out-of-the-box
INSERT INTO tasks (title, category, completed) VALUES 
('Review Operating System Lecture Notes', 'Study', 0),
('Solve 3 Data Structure Problems in C++', 'Coding', 1),
('Complete Web Development Project Submission', 'Hackathon', 0),
('Read Chapter 4 of Intro to Algorithms', 'Reading', 0);

INSERT INTO notes (content, ai_summary) VALUES 
('Covered memory management, virtual memory allocation, and page fault handling strategies today.', 
 '• Key Focus: Memory Management & Page Faults\n• Core Concept: Virtual Memory Allocation\n• Action: Practice page replacement algorithms');