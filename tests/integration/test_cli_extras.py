import subprocess
import os
import json
import sys

def test_cli_scan_sarif_format():
    leak_code = "def test():\n    f = open('data.txt')\n"
    with open("temp_leak_sarif.py", "w") as f:
        f.write(leak_code)
        
    result = subprocess.run([sys.executable, "-m", "leakguard.cli", "scan", "temp_leak_sarif.py", "--format", "sarif"], capture_output=True, text=True)
    os.remove("temp_leak_sarif.py")
    
    assert result.returncode == 1
    data = json.loads(result.stdout)
    assert data["$schema"] == "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json"
    assert "runs" in data
    assert data["runs"][0]["tool"]["driver"]["name"] == "LeakGuard"

def test_cli_invalid_path():
    result = subprocess.run([sys.executable, "-m", "leakguard.cli", "scan", "does_not_exist_path.py"], capture_output=True, text=True)
    assert result.returncode == 2
    assert "does not exist" in result.stdout