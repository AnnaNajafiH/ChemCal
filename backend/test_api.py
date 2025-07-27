import sys
sys.path.append('.')
from pubchem_api import get_chemical_properties
import json

# Test with water
properties = get_chemical_properties('H2O')
print("Properties for H2O:")
print(json.dumps(properties, indent=2))

# Test with a more complex molecule
properties = get_chemical_properties('C6H12O6')
print("\nProperties for C6H12O6:")
print(json.dumps(properties, indent=2))

# Test with an element
properties = get_chemical_properties('Na')
print("\nProperties for Na:")
print(json.dumps(properties, indent=2))
