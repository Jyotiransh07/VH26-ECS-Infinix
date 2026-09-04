def parse_logs():
    f = open("server.log", "r")
    
    # Reassigning the variable holding the resource
    f = open("client.log", "r") # LEAK: server.log reference is lost, never closed
    
    data = f.read()
    f.close()
    return data
