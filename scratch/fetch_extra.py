import json
import urllib.request
import re

url = "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    pt_data = json.loads(response.read().decode())

elements = pt_data['elements']
element_dict = {el['number']: el for el in elements}

js_file = "src/js/01_data.js"
with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Parse the elements array in js_content
# Since the array is large and complex, we can use regex to replace specific nulls or just do string replacement element by element

for z in range(1, 119):
    el = element_dict.get(z)
    if not el:
        continue
    
    # We want to replace nulls in:
    # "hardness": { "brinell": null, "mohs": null, "vickers": null }
    # "modulus": { "bulk": null, "shear": null, "young": null }
    # "abundance": { ... "earthCrust": null ... }
    
    # Bowserinator JSON might have "molar_heat", "density", "melt", "boil"
    # But wait, it might not have "hardness" or "modulus". Let's check what it has.
    pass

print(list(element_dict[26].keys()))
