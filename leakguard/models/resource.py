from enum import Enum, auto
from dataclasses import dataclass
import ast
from leakguard.models.location import Location

class ResourceState(Enum):
    UNOPENED = auto()
    OPEN = auto()
    CLOSED = auto()
    ESCAPED = auto()
    UNKNOWN = auto()

class Ownership(Enum):
    LOCAL = auto()
    TRANSFERRED = auto()
    UNKNOWN = auto()

class Confidence(Enum):
    SAFE = auto()
    DEFINITE = auto()
    LIKELY = auto()
    UNKNOWN = auto()

@dataclass
class Resource:
    id: int
    variable_name: str
    resource_type: str
    acquisition_node: ast.AST
    location: Location
    state: ResourceState = ResourceState.UNOPENED
    ownership: Ownership = Ownership.LOCAL
    confidence: Confidence = Confidence.UNKNOWN
