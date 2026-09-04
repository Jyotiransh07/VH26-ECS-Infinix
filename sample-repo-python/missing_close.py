import socket

def ping_server():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(("localhost", 8080))
    s.sendall(b"PING")
    # LEAK: No close() call anywhere
    return True
