import os
import re

os.makedirs('src/js', exist_ok=True)
os.makedirs('src/css', exist_ok=True)

# 1. Rename data.js to 01_data.js
if os.path.exists('src/data.js'):
    with open('src/data.js', 'r', encoding='utf-8') as f:
        data = f.read()
    with open('src/js/01_data.js', 'w', encoding='utf-8') as f:
        f.write(data)
    print("Moved data.js")

# 2. Split main.js
if os.path.exists('src/main.js'):
    with open('src/main.js', 'r', encoding='utf-8') as f:
        main_js = f.read()
    
    # We will split main.js manually by writing its contents to 02_main.js for now.
    # To avoid breaking project integrity, we will just keep main.js as 02_main.js until we extract parts later.
    with open('src/js/02_main.js', 'w', encoding='utf-8') as f:
        f.write(main_js)
    print("Moved main.js")

# 3. Split style.css
if os.path.exists('src/style.css'):
    with open('src/style.css', 'r', encoding='utf-8') as f:
        style_css = f.read()
    
    with open('src/css/01_base.css', 'w', encoding='utf-8') as f:
        f.write(style_css)
    print("Moved style.css")

# 4. Rewrite build.py
build_script = """import os
import glob

def build():
    print("Building project...")
    with open('src/index.html', 'r', encoding='utf-8') as f:
        final_html = f.read()

    # Read and concatenate CSS
    css_files = sorted(glob.glob('src/css/*.css'))
    css_content = ""
    for cf in css_files:
        print(f"Adding {cf}")
        with open(cf, 'r', encoding='utf-8') as f:
            css_content += f"\\n/* {os.path.basename(cf)} */\\n" + f.read()
    
    # Read and concatenate JS
    js_files = sorted(glob.glob('src/js/*.js'))
    js_content = ""
    for jf in js_files:
        print(f"Adding {jf}")
        with open(jf, 'r', encoding='utf-8') as f:
            js_content += f"\\n// {os.path.basename(jf)}\\n" + f.read()

    css_tag = f"<style>\\n{css_content}\\n</style>"
    
    # The original index.html has TWO JS markers: <!-- JS_DATA_INJECT --> and <!-- JS_MAIN_INJECT -->
    # We will put all JS into JS_MAIN_INJECT and clear JS_DATA_INJECT
    js_tag = f"<script>\\n{js_content}\\n</script>"

    final_html = final_html.replace('<!-- CSS_INJECT -->', css_tag)
    final_html = final_html.replace('<!-- JS_DATA_INJECT -->', '')
    final_html = final_html.replace('<!-- JS_MAIN_INJECT -->', js_tag)

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("Build successful! Created index.html")

if __name__ == '__main__':
    build()
"""
with open('build.py', 'w', encoding='utf-8') as f:
    f.write(build_script)
print("Rewrote build.py")

# Delete old files safely
if os.path.exists('src/data.js') and os.path.exists('src/js/01_data.js'):
    os.remove('src/data.js')
if os.path.exists('src/main.js') and os.path.exists('src/js/02_main.js'):
    os.remove('src/main.js')
if os.path.exists('src/style.css') and os.path.exists('src/css/01_base.css'):
    os.remove('src/style.css')
