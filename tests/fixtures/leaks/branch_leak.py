def branch_leak(condition):
    f = open("data.txt")

    if condition:
        f.close()
