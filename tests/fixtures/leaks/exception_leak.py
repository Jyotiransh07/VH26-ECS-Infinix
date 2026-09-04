def process(f):
    raise ValueError("error")
    
def test():
    f = open("data.txt")
    process(f)
    f.close()
