def finally_close():
    f = open("data.txt")

    try:
        process_data(f)
    finally:
        f.close()
