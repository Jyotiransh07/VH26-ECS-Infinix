def process(f):
    pass
    
def test():
    f = open("data.txt")
    try:
        process(f)
    finally:
        f.close()
