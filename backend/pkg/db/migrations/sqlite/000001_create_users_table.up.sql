    -- create users table:
    CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nick_name TEXT UNIQUE NOT NULL,
    age INTEGER CHECK(age > 0 AND age < 100),
    gender TEXT NOT NULL, 
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    privacy_level INT DEFAULT 0);  -- 0: public, 1: private, 2: friends-only;