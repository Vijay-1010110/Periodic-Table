import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    "https://raw.githubusercontent.com/wellerlab/periodic_table_json/master/periodic_table.json",
    "https://raw.githubusercontent.com/andrejewski/periodic-table/master/data.json"
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode())
        print(f"URL: {url}")
        if isinstance(data, list) and len(data) > 0:
            print("Keys:", list(data[0].keys()))
        elif isinstance(data, dict):
            first_key = list(data.keys())[0]
            print("Keys:", list(data[first_key].keys()))
    except Exception as e:
        print(e)
