import pandas as pd
import json
import requests
import io

headers = {'User-Agent': 'Mozilla/5.0'}

# Fetch Elastic properties (Young, Shear, Bulk Modulus)
url_elastic = "https://en.wikipedia.org/wiki/Elastic_properties_of_the_elements_(data_page)"
html_elastic = requests.get(url_elastic, headers=headers).text
dfs_elastic = pd.read_html(io.StringIO(html_elastic))

# Fetch Hardnesses (Mohs, Vickers, Brinell)
url_hardness = "https://en.wikipedia.org/wiki/Hardnesses_of_the_elements_(data_page)"
html_hardness = requests.get(url_hardness, headers=headers).text
dfs_hardness = pd.read_html(io.StringIO(html_hardness))

# Extract Young, Bulk, Shear
df_young = dfs_elastic[0]
df_bulk = dfs_elastic[2]
df_shear = dfs_elastic[3]

# Extract Hardness
df_hard = dfs_hardness[1] # first is a notice table

properties = {}

def clean_val(v):
    if pd.isna(v) or v == '' or str(v).strip() == '' or str(v).lower() == 'nan':
        return None
    try:
        import re
        m = re.search(r'([\d\.]+)', str(v))
        if m:
            return float(m.group(1))
    except:
        pass
    return None

def extract_modulus(df, mod_key):
    for idx, row in df.iterrows():
        try:
            z = row.iloc[0]
            if not str(z).isdigit(): continue
            z = int(z)
            val = clean_val(row.iloc[4]) # WEL[1] column is at index 4
            if not pd.isna(val):
                if z not in properties:
                    properties[z] = {"modulus": {"bulk": None, "shear": None, "young": None}, "hardness": {"brinell": None, "mohs": None, "vickers": None}}
                properties[z]["modulus"][mod_key] = val
        except Exception as e:
            pass

extract_modulus(df_young, "young")
extract_modulus(df_bulk, "bulk")
extract_modulus(df_shear, "shear")

for idx, row in df_hard.iterrows():
    try:
        z = row.iloc[0]
        if not str(z).isdigit(): continue
        z = int(z)
        mohs = clean_val(row.iloc[3])
        vickers = clean_val(row.iloc[4])
        brinell = clean_val(row.iloc[5])
        
        if z not in properties:
            properties[z] = {
                "modulus": {"bulk": None, "shear": None, "young": None},
                "hardness": {"brinell": None, "mohs": None, "vickers": None}
            }
            
        properties[z]["hardness"]["mohs"] = mohs
        properties[z]["hardness"]["vickers"] = vickers
        properties[z]["hardness"]["brinell"] = brinell
    except Exception as e:
        pass

# Now update 01_data.js
with open("src/js/01_data.js", "r", encoding="utf-8") as f:
    content = f.read()

import re
json_match = re.search(r"const elementsData = (\[.*?\]);", content, re.DOTALL)
if json_match:
    elements = json.loads(json_match.group(1))
    
    for el in elements:
        z = el["atomicNumber"]
        if z in properties:
            el["hardness"] = properties[z]["hardness"]
            el["modulus"] = properties[z]["modulus"]
            
    updated_json = json.dumps(elements, indent=4)
    # Fix the format back to js
    new_content = content[:json_match.start(1)] + updated_json + content[json_match.end(1):]
    
    with open("src/js/01_data.js", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Successfully updated 01_data.js")
else:
    print("Could not find JSON in 01_data.js")
