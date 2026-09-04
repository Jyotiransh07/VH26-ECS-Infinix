import subprocess
import os
import json
import sys

def test_cli_help():
    result = subprocess.run([sys.executable, "-m", "leakguard.cli", "--help"], capture_output=True, text=True)
    assert result.returncode == 0
    assert "LeakGuard" in result.stdout

def test_cli_scan_safe_file():
    # Create a temporary safe file
    safe_code = "def test():\n    with open('data.txt') as f:\n        pass\n"
    with open("temp_safe.py", "w") as f:
        f.write(safe_code)
        
    result = subprocess.run([sys.executable, "-m", "leakguard.cli", "scan", "temp_safe.py"], capture_output=True, text=True)
    os.remove("temp_safe.py")
    
    assert result.returncode == 0
    assert "LeakGuard Passed!" in result.stdout

def test_cli_scan_leak_file():
    # Create a temporary leaking file
    leak_code = "def test():\n    f = open('data.txt')\n"
    with open("temp_leak.py", "w") as f:
        f.write(leak_code)
        
    result = subprocess.run([sys.executable, "-m", "leakguard.cli", "scan", "temp_leak.py"], capture_output=True, text=True)
    os.remove("temp_leak.py")
    
    assert result.returncode == 1
    assert "DEFINITE" in result.stdout
    assert "RESOURCE LEAK" in result.stdout

def test_cli_scan_json_format():
    leak_code = "def test():\n    f = open('data.txt')\n"
    with open("temp_leak_json.py", "w") as f:
        f.write(leak_code)
        
    result = subprocess.run([sys.executable, "-m", "leakguard.cli", "scan", "temp_leak_json.py", "--format", "json"], capture_output=True, text=True)
    os.remove("temp_leak_json.py")
    
    assert result.returncode == 1
    data = json.loads(result.stdout)
    assert data["summary"]["definite_leaks"] == 1
    assert data["findings"][0]["variable_name"] == "f"
