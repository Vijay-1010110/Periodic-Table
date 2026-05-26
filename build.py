import os
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
            css_content += f"\n/* {os.path.basename(cf)} */\n" + f.read()
    
    # Read and concatenate JS
    js_files = [
        'src/js/01_data.js',
        'src/js/04_isotopes_data.js',
        'src/js/05_isotopes.js',
        'src/js/02_main.js',
        'src/js/03_orbitals.js'
    ]
    js_content = ""
    for jf in js_files:
        print(f"Adding {jf}")
        with open(jf, 'r', encoding='utf-8') as f:
            js_content += f"\n// {os.path.basename(jf)}\n" + f.read()

    css_tag = f"<style>\n{css_content}\n</style>"
    
    # The original index.html has TWO JS markers: <!-- JS_DATA_INJECT --> and <!-- JS_MAIN_INJECT -->
    # We will put all JS into JS_MAIN_INJECT and clear JS_DATA_INJECT
    js_tag = f"<script>\n{js_content}\n</script>"

    final_html = final_html.replace('<!-- CSS_INJECT -->', css_tag)
    final_html = final_html.replace('<!-- JS_DATA_INJECT -->', '')
    final_html = final_html.replace('<!-- JS_MAIN_INJECT -->', js_tag)

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("Build successful! Created index.html")

if __name__ == '__main__':
    build()
