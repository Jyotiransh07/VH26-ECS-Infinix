def basic_file_leak():
    f = open("data.txt")
    data = f.read()
    print(data)
