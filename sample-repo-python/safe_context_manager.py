def process_safe(data_path):
    with open(data_path, 'r') as f:
        if not data_path:
            return # SAFE: Context manager handles close
        data = f.read()
        return data
