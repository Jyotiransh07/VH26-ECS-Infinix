def safe_context_manager():
    with open("data.txt") as f:
        data = f.read()
