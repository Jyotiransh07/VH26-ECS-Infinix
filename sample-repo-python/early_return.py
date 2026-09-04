def process_data(data_path):
    f = open(data_path, 'r')
    
    if not data_path:
        print("No path provided")
        return  # LEAK: Early return skips f.close()
        
    data = f.read()
    print("Processed:", len(data))
    f.close()
