import os

def build():
    # Read files
    with open('src/index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    with open('src/style.css', 'r', encoding='utf-8') as f:
        css_content = f.read()
    with open('src/data.js', 'r', encoding='utf-8') as f:
        data_content = f.read()
    with open('src/main.js', 'r', encoding='utf-8') as f:
        js_content = f.read()

    # Inject contents
    css_tag = f"<style>\n{css_content}\n</style>"
    data_tag = f"<script>\n{data_content}\n</script>"
    js_tag = f"<script>\n{js_content}\n</script>"

    final_html = html_content.replace('<!-- CSS_INJECT -->', css_tag)
    final_html = final_html.replace('<!-- JS_DATA_INJECT -->', data_tag)
    final_html = final_html.replace('<!-- JS_MAIN_INJECT -->', js_tag)

    # Write output
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(final_html)

    print("Build successful! Created index.html")

if __name__ == '__main__':
    build()
