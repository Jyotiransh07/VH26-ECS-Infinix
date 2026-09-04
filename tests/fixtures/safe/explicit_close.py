def explicit_close():
    f = open("data.txt")
    data = f.read()
    f.close()
