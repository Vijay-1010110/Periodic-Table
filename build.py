import os
import glob
import re
import datetime

def generate_seo_tags():
    try:
        with open('src/js/01_data.js', 'r', encoding='utf-8') as f:
            data_js = f.read()
            
        names = re.findall(r'"name":\s*"(.*?)"', data_js)
        categories = list(set(re.findall(r'"category":\s*"(.*?)"', data_js)))
        
        keywords = ["Periodic Table", "Interactive", "Chemistry", "Isotopes", "Electron Configuration", "3D Orbitals", "Decay Emulator", "Science", "Elements"]
        keywords.extend(names)
        keywords.extend(categories)
        
        keywords = sorted(list(set([k for k in keywords if k and k != "null"])))
        
        meta_keywords = f'<meta name="keywords" content="{", ".join(keywords)}">\n'
        
        schema = """<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "PeriodicaX - Definitive Periodic Table",
  "url": "https://interactive-periodic-table.web.app",
  "description": "A visually stunning, interactive periodic table featuring 3D electron orbitals and an advanced isotope decay emulator.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All"
}
</script>"""
        return meta_keywords + schema
    except Exception as e:
        print(f"Error generating SEO tags: {e}")
        return ""

def generate_sitemap_and_robots():
    if not os.path.exists('public'):
        os.makedirs('public')
    sitemap = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://interactive-periodic-table.web.app/</loc>
      <lastmod>{datetime.datetime.now().strftime("%Y-%m-%d")}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
   </url>
</urlset>"""
    with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap)
        
    robots = """User-agent: *
Allow: /

Sitemap: https://interactive-periodic-table.web.app/sitemap.xml"""
    with open('public/robots.txt', 'w', encoding='utf-8') as f:
        f.write(robots)

def build():
    print("Building project...")
    
    if not os.path.exists('public'):
        os.makedirs('public')
        
    with open('src/index.html', 'r', encoding='utf-8') as f:
        final_html = f.read()

    css_files = sorted(glob.glob('src/css/*.css'))
    css_content = ""
    for cf in css_files:
        print(f"Adding {cf}")
        with open(cf, 'r', encoding='utf-8') as f:
            css_content += f"\n/* {os.path.basename(cf)} */\n" + f.read()
    
    js_files = [
        'src/js/01_data.js',
        'src/js/04_isotopes_data.js',
        'src/js/05_isotopes.js',
        'src/js/06_compounds_data.js',
        'src/js/07_compounds.js',
        'src/js/08_reactions.js',
        'src/js/09_crystals_data.js',
        'src/js/10_crystals.js',
        'src/js/02_main.js',
        'src/js/03_orbitals.js'
    ]
    js_content = ""
    for jf in js_files:
        print(f"Adding {jf}")
        with open(jf, 'r', encoding='utf-8') as f:
            js_content += f"\n// {os.path.basename(jf)}\n" + f.read()

    css_tag = f"<style>\n{css_content}\n</style>"
    js_tag = f"<script>\n{js_content}\n</script>"

    final_html = final_html.replace('<!-- CSS_INJECT -->', css_tag)
    
    # We will remove the old script tags if they are in the HTML directly
    final_html = re.sub(r'<script src="js/.*\.js"></script>', '', final_html)
    
    final_html = final_html.replace('</head>', f'{js_tag}\n</head>')
    
    seo_tags = generate_seo_tags()
    final_html = final_html.replace('</head>', f'{seo_tags}\n</head>')

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
        
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
        
    print("Build successful! Created public/index.html and index.html")
    
    generate_sitemap_and_robots()
    print("Generated sitemap.xml and robots.txt in public/")

if __name__ == '__main__':
    build()
