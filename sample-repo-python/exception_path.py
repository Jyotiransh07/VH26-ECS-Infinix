import sqlite3

def get_user_data(db_path, user_id):
    conn = sqlite3.connect(db_path)
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id=?", (user_id,))
        if user_id < 0:
            raise ValueError("Invalid user ID") # LEAK: Exception skips close()
            
        data = cursor.fetchone()
        conn.close()
        return data
    except sqlite3.OperationalError:
        print("DB Error")
        # LEAK: conn is not closed in this except block either if reached
