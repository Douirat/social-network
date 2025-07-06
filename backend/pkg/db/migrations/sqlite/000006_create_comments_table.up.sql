     -- Create a table to hold comments' data:
      CREATE TABLE IF NOT EXISTS comments (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at TEXT,
    -- LikeCount INTEGER DEFAULT 0,
    -- DislikeCount INTEGER DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users (ID) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts (ID) ON DELETE CASCADE
);