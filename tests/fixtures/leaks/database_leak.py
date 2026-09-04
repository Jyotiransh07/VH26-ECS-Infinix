import sqlite3
def test():
    conn = sqlite3.connect("db.sqlite")
    # no close
