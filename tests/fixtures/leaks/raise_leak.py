def raise_before_close(condition):
    f = open("data.txt")

    if condition:
        raise ValueError("Invalid")

    f.close()
