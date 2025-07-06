
    -- create categories table :
    CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    c_name TEXT UNIQUE NOT NULL);

    -- insert inside categories
    INSERT OR IGNORE  INTO categories (c_name) VALUES ('Sport');
    INSERT OR IGNORE INTO categories (c_name) VALUES ('Culture');
    INSERT OR IGNORE INTO categories (c_name) VALUES ('Technology');
    INSERT OR IGNORE INTO categories (c_name) VALUES ('Coding');