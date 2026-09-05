import boto3
import pymongo
import paramiko
from kubernetes import client

def test_aws_s3_leak():
    # LeakGuard will flag 'boto3.client' because it is never closed
    s3 = boto3.client('s3')
    print(s3.list_buckets())

def test_mongodb_leak():
    # LeakGuard will flag 'pymongo.MongoClient' because it is never closed
    db = pymongo.MongoClient("mongodb://localhost:27017/")
    print(db.list_database_names())

def test_ssh_leak(error_occurred=True):
    # LeakGuard will flag this as a path-sensitive leak due to early return
    ssh = paramiko.SSHClient()
    ssh.connect('192.168.1.1', username='admin')
    
    if error_occurred:
        return  # Bypasses the cleanup!
        
    ssh.close()

def test_kubernetes_leak():
    # From the custom rule you just added!
    k8s = client.ApiClient()
    print("Talking to K8s API...")
    # Missing k8s.close()
