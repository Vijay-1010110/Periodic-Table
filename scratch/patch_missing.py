import re
import json
import mendeleev

# Data dictionaries
mohs_hardness = {
    3: 0.6, 4: 5.5, 5: 9.3, 6: 0.5,
    11: 0.5, 12: 2.0, 13: 2.75, 14: 6.5, 15: 0.5, 16: 2.0,
    19: 0.4, 20: 1.5, 21: 3.0, 22: 6.0, 23: 7.0, 24: 8.5, 25: 6.0, 26: 4.0, 27: 5.0, 28: 4.0, 29: 3.0, 30: 2.5, 31: 1.5, 32: 6.0, 33: 3.5, 34: 2.0,
    37: 0.3, 38: 1.5, 39: 3.0, 40: 5.0, 41: 6.0, 42: 5.5, 43: 5.0, 44: 6.5, 45: 6.0, 46: 4.75, 47: 2.5, 48: 2.0, 49: 1.2, 50: 1.5, 51: 3.0, 52: 2.25,
    55: 0.2, 56: 1.25, 57: 2.5, 58: 2.5, 59: 2.5, 60: 2.5, 61: 2.5, 62: 2.5, 63: 2.5, 64: 2.5, 65: 2.5, 66: 2.5, 67: 2.5, 68: 2.5, 69: 2.5, 70: 2.5, 71: 2.5,
    72: 5.5, 73: 6.5, 74: 7.5, 75: 7.0, 76: 7.0, 77: 6.5, 78: 3.5, 79: 2.5, 80: 0.0, 81: 1.2, 82: 1.5, 83: 2.25,
    90: 3.0, 92: 6.0
}

youngs_modulus_gpa = {
    4: 287, 5: 400, 6: 1050,
    12: 45, 13: 70, 14: 162,
    20: 20, 21: 74, 22: 116, 23: 128, 24: 279, 25: 198, 26: 211, 27: 209, 28: 200, 29: 130, 30: 108, 32: 103, 33: 8, 34: 10,
    38: 16, 39: 25, 40: 68, 41: 105, 42: 329, 43: 322, 44: 447, 45: 380, 46: 121, 47: 83, 48: 50, 49: 11, 50: 50, 51: 55, 52: 43,
    56: 13,
    57: 36, 58: 33, 59: 37, 60: 41, 62: 49, 63: 18, 64: 54, 65: 55, 66: 61, 67: 64, 68: 69, 69: 74, 70: 23, 71: 68,
    72: 78, 73: 186, 74: 411, 75: 463, 76: 560, 77: 528, 78: 168, 79: 78, 81: 8, 82: 16, 83: 32,
    90: 71, 92: 208, 94: 96
}

# Read JS file
js_file = "src/js/01_data.js"
with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

# We can use regex to find each block and replace
for z in range(1, 119):
    try:
        el = mendeleev.element(z)
        abun = el.abundance_crust
    except:
        abun = None

    mohs = mohs_hardness.get(z, None)
    young = youngs_modulus_gpa.get(z, None)

    # Format values for regex substitution
    abun_str = f"{abun}" if abun is not None else "null"
    mohs_str = f"{mohs}" if mohs is not None else "null"
    young_str = f"{young}" if young is not None else "null"

    # Regex patterns
    # We want to replace "mohs": null, with "mohs": <mohs_str>, for the specific element
    # But since JSON is not strictly formatted we should replace based on atomicNumber context
    
    # Let's extract the array elements
    # Instead of full regex, find atomicNumber": Z,
    marker = f'"atomicNumber": {z},'
    idx = js_content.find(marker)
    if idx == -1:
        continue
    
    end_idx = js_content.find('"atomicNumber":', idx + 10)
    if end_idx == -1:
        end_idx = len(js_content)
        
    chunk = js_content[idx:end_idx]
    
    # Replace in chunk
    chunk = re.sub(r'"mohs":\s*(null|[\d\.]+)', f'"mohs": {mohs_str}', chunk)
    chunk = re.sub(r'"young":\s*(null|[\d\.]+)', f'"young": {young_str}', chunk)
    chunk = re.sub(r'"earthCrust":\s*(null|[\d\.]+)', f'"earthCrust": {abun_str}', chunk)
    
    js_content = js_content[:idx] + chunk + js_content[end_idx:]

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Patched hardness, modulus, and abundance successfully.")
