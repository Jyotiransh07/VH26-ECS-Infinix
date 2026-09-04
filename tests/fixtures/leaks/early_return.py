def early_return(error):
    f = open("data.txt")

    if error:
        return

    f.close()
