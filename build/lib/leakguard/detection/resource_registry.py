import yaml
from typing import Dict, List, Any

class ResourceRegistry:
    def __init__(self):
        self.rules = []
        
    def load_from_yaml(self, path: str):
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
            self.rules = data.get('resources', [])
            
    def get_acquisition_rules(self) -> Dict[str, str]:
        """
        Returns a mapping of acquisition function names (e.g., 'open', 'socket.socket')
        to their resource type names (e.g., 'file', 'socket').
        """
        mapping = {}
        for rule in self.rules:
            res_name = rule.get('name')
            for acq in rule.get('acquire', []):
                mapping[acq] = res_name
        return mapping

    def get_release_rules(self) -> Dict[str, List[str]]:
        """
        Returns a mapping of resource types to their release function names.
        """
        mapping = {}
        for rule in self.rules:
            res_name = rule.get('name')
            releases = rule.get('release', [])
            mapping[res_name] = releases
        return mapping
