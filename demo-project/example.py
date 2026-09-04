def read_file():
    f = open("data.txt")

    if error:
        return

    print(f.read())
    f.close()
