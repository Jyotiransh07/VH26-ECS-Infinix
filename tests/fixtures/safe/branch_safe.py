def both_branches_close(condition):
    f = open("data.txt")

    if condition:
        f.close()
    else:
        f.close()
