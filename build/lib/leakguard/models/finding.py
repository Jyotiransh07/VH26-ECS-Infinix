from dataclasses import dataclass
from typing import List
from leakguard.models.location import Location
from leakguard.models.resource import Confidence

@dataclass
class Finding:
    file: str
    resource_type: str
    variable_name: str
    acquisition_location: Location
    reason: str
    severity: str
    confidence: Confidence
    path: List[Location]
    suggestion: str
    
    def __str__(self):
        path_str = " -> ".join([str(loc.line) for loc in self.path]) + " -> EXIT" if self.path else "EXIT"
        
        return (f"[{self.severity}] {self.confidence.name} RESOURCE LEAK\n\n"
                f"File: {self.file}\n"
                f"Line: {self.acquisition_location.line}\n\n"
                f"Resource:\n"
                f"    {self.resource_type.capitalize()} '{self.variable_name}'\n\n"
                f"Opened:\n"
                f"    line {self.acquisition_location.line}\n\n"
                f"Leaking path:\n"
                f"    {path_str}\n\n"
                f"Reason:\n"
                f"    {self.reason}\n\n"
                f"Suggestion:\n"
                f"    {self.suggestion}")
