import sqlite3

def get_connection():
    conn = sqlite3.connect("pathsense.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS career_path (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT,
            goal TEXT,
            chosen_role TEXT,
            roadmap TEXT
        )
    """)
    conn.commit()
    conn.close()