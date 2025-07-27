import sys
sys.path.append('.')
import requests
import json
from pubchem_api import PubChemAPI

# Test compounds
test_compounds = ["H2O", "C6H12O6", "NaCl"]

for formula in test_compounds:
    print(f"\n--- Testing formula: {formula} ---")
    properties = PubChemAPI.fetch_compound_properties(formula)
    
    if not properties:
        print(f"No properties found for {formula}")
        continue
        
    print("Properties found:")
    for key, value in properties.items():
        print(f"{key}: {value}")
        
    # Check if structure image URLs are working
    if "structure_image_url" in properties:
        image_url = properties["structure_image_url"]
        print(f"\nTesting image URL: {image_url}")
        try:
            response = requests.head(image_url, timeout=5)
            if response.status_code == 200:
                print(f"✅ Image URL is valid (status code: {response.status_code})")
            else:
                print(f"❌ Image URL returned status code: {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing image URL: {str(e)}")
            
    if "structure_image_svg_url" in properties:
        svg_url = properties["structure_image_svg_url"]
        print(f"\nTesting SVG URL: {svg_url}")
        try:
            response = requests.head(svg_url, timeout=5)
            if response.status_code == 200:
                print(f"✅ SVG URL is valid (status code: {response.status_code})")
            else:
                print(f"❌ SVG URL returned status code: {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing SVG URL: {str(e)}")
