    CREATE TABLE IF NOT EXISTS post_categories (
    post_id INTEGER,
    category_id INTEGER,
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(ID) ON DELETE CASCADE, 
    FOREIGN KEY (category_id) REFERENCES categories(ID) ON DELETE CASCADE);