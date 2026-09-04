def exception_before_close():
    f = open("data.txt")
    process_data(f)
    f.close()
