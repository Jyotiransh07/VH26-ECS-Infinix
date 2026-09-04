import sqlite3

def query_safe(db_path):
    conn = sqlite3.connect(db_path)
    try:
        if not db_path:
            raise ValueError("No DB path")
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
    finally:
        conn.close() # SAFE: Always executed
