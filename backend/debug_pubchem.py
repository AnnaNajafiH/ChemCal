import sys
sys.path.append('.')
import requests
import json

# Test with water
cid = 962  # Water's CID
base_url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"

# Get detailed properties
record_url = f"{base_url}/compound/cid/{cid}/JSON"
print(f"Requesting: {record_url}")
response = requests.get(record_url, timeout=30)
data = response.json()

# Save the full response to a file for analysis
with open('pubchem_response.json', 'w') as f:
    json.dump(data, indent=2, fp=f)

# Print just the properties section
if "PC_Compounds" in data and len(data["PC_Compounds"]) > 0:
    compound = data["PC_Compounds"][0]
    if "props" in compound:
        print("Properties found:")
        for prop in compound.get("props", [])[:5]:  # Just print the first 5 for brevity
            print(json.dumps(prop, indent=2))
    else:
        print("No props section found in compound data")
else:
    print("No compound data found")
