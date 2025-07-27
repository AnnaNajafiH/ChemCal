"""
PubChem API integration for fetching physical and chemical properties of compounds.
"""
import requests
import logging
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PubChemAPI:
    """
    Class to interact with the PubChem PUG REST API.
    """
    BASE_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
    
    @staticmethod
    def fetch_compound_properties(formula: str) -> Dict[str, Any]:
        """
        Fetch chemical and physical properties for a compound based on its formula.
        
        Args:
            formula (str): Chemical formula (e.g., "H2O", "C6H12O6")
            
        Returns:
            Dict[str, Any]: Dictionary containing physical and chemical properties
        """
        try:
            # Step 1: Try to get the CID (PubChem Compound ID) based on the formula
            cid_url = f"{PubChemAPI.BASE_URL}/compound/name/{formula}/cids/JSON"
            
            logger.info(f"Requesting CID for formula: {formula}")
            response = requests.get(cid_url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if "IdentifierList" not in data or "CID" not in data["IdentifierList"] or not data["IdentifierList"]["CID"]:
                logger.warning(f"No compound ID found for formula: {formula}")
                return {}
                
            cid = data["IdentifierList"]["CID"][0]
            logger.info(f"Found CID {cid} for formula: {formula}")
            
            # Step 2: Fetch properties using the CID
            properties = PubChemAPI._fetch_properties_by_cid(cid)
            
            # Step 3: Add image URLs
            properties["structure_image_url"] = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/PNG"
            # SVG format seems to have issues, so we'll just use PNG for now
            properties["structure_image_svg_url"] = None
            properties["compound_url"] = f"https://pubchem.ncbi.nlm.nih.gov/compound/{cid}"
            
            return properties
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching data from PubChem: {str(e)}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return {}
    
    @staticmethod
    def _fetch_properties_by_cid(cid: int) -> Dict[str, Any]:
        """
        Fetch chemical properties from PubChem using a compound ID.
        
        Args:
            cid (int): PubChem Compound ID
            
        Returns:
            Dict[str, Any]: Dictionary containing physical and chemical properties
        """
        properties = {}
        
        try:
            # Fetch basic properties including IUPAC name
            prop_url = f"{PubChemAPI.BASE_URL}/compound/cid/{cid}/property/MolecularFormula,MolecularWeight,IUPACName,XLogP,TPSA,InChIKey/JSON"
            
            logger.info(f"Requesting properties for CID: {cid}")
            response = requests.get(prop_url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if "PropertyTable" in data and "Properties" in data["PropertyTable"] and data["PropertyTable"]["Properties"]:
                prop_data = data["PropertyTable"]["Properties"][0]
                properties.update({
                    "iupac_name": prop_data.get("IUPACName"),
                })
            
            # Use the PUGView data to get physical properties
            pugview_url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/{cid}/JSON"
            
            logger.info(f"Requesting PUGView data for CID: {cid}")
            response = requests.get(pugview_url, timeout=15)  # Longer timeout as this can be a larger payload
            response.raise_for_status()
            
            data = response.json()
            if "Record" in data and "Section" in data["Record"]:
                # Find the Physical Properties section
                for section in data["Record"]["Section"]:
                    if section.get("TOCHeading") == "Chemical and Physical Properties":
                        if "Section" in section:
                            for subsection in section["Section"]:
                                # Experimental properties contain most of what we want
                                if subsection.get("TOCHeading") == "Experimental Properties":
                                    if "Section" in subsection:
                                        for prop_section in subsection["Section"]:
                                            prop_name = prop_section.get("TOCHeading", "")
                                            
                                            # Extract values based on property name
                                            if "Information" in prop_section:
                                                for info in prop_section["Information"]:
                                                    if "Value" in info and "StringWithMarkup" in info["Value"] and info["Value"]["StringWithMarkup"]:
                                                        value = info["Value"]["StringWithMarkup"][0].get("String", "")
                                                        
                                                        if prop_name == "Boiling Point" and value:
                                                            properties["boiling_point"] = value
                                                        elif prop_name == "Melting Point" and value:
                                                            properties["melting_point"] = value
                                                        elif prop_name == "Density" and value:
                                                            properties["density"] = value
                                                        elif prop_name == "Physical Description" and value:
                                                            properties["state_at_room_temp"] = value
                # Get Safety and Hazards information
                for section in data["Record"]["Section"]:
                    if section.get("TOCHeading") == "Safety and Hazards":
                        if "Section" in section:
                            for subsection in section["Section"]:
                                if subsection.get("TOCHeading") == "GHS Classification":
                                    if "Information" in subsection:
                                        for info in subsection["Information"]:
                                            if "Value" in info and "StringWithMarkup" in info["Value"] and info["Value"]["StringWithMarkup"]:
                                                value = info["Value"]["StringWithMarkup"][0].get("String", "")
                                                if value:
                                                    properties["hazard_classification"] = value
            
            logger.info(f"Successfully retrieved properties for CID: {cid}")
            
            # Use simpler state description if we found it in the physical description
            if "state_at_room_temp" in properties:
                desc = properties["state_at_room_temp"].lower()
                if "gas" in desc:
                    properties["state_at_room_temp"] = "Gas"
                elif "liquid" in desc:
                    properties["state_at_room_temp"] = "Liquid"
                elif "solid" in desc or "crystal" in desc or "powder" in desc:
                    properties["state_at_room_temp"] = "Solid"
            
            return properties
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching properties from PubChem: {str(e)}")
            return properties
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return properties

def get_chemical_properties(formula: str) -> Dict[str, Any]:
    """
    Convenience function to fetch properties for a chemical formula.
    
    Args:
        formula (str): Chemical formula
        
    Returns:
        Dict[str, Any]: Dictionary containing properties
    """
    return PubChemAPI.fetch_compound_properties(formula)
