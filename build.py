import os
import glob
import shutil
import subprocess

def build():
    print("========================================")
    print("   Building Periodica Web App Bundle    ")
    print("========================================")
    
    if not os.path.exists('public'):
        os.makedirs('public')
        
    with open('src/index.html', 'r', encoding='utf-8') as f:
        final_html = f.read()

    # Bundle all CSS files
    css_files = sorted(glob.glob('src/css/*.css'))
    css_content = ""
    for cf in css_files:
        print(f" bundling CSS: {cf}")
        with open(cf, 'r', encoding='utf-8') as f:
            css_content += f"\n/* {os.path.basename(cf)} */\n" + f.read()
    
    # Bundle all JS files in correct dependency order
    js_files = [
        'src/js/00_config.js',
        'src/js/13_platform.js',
        'src/js/14_native_services.js',
        'src/js/15_perf_debugger.js',
        'src/js/01_data.js',
        'src/js/16_wasm_engine.js',
        'src/js/17_canvas_grid.js',
        'src/js/04_isotopes_data.js',
        'src/js/05_isotopes.js',
        'src/js/06_compounds_data.js',
        'src/js/07_compounds.js',
        'src/js/08_reactions.js',
        'src/js/09_crystals_data.js',
        'src/js/10_crystals.js',
        'src/js/11_compare.js',
        'src/js/12_quiz.js',
        'src/js/19_legend_concepts.js',
        'src/js/02_main.js',
        'src/js/03_orbitals.js',
        'src/js/18_mcp_bridge.js',
        'src/js/20_pro_billing.js',
        'src/js/21_environment_pressure_sim.js',
        'src/js/22_chain_reaction_sim.js',
        'src/js/23_decay_particle_sim.js',
        'src/js/24_molecule_physics_sim.js',
        'src/js/25_simulation_controls.js'
    ]
    js_content = ""
    for jf in js_files:
        print(f" bundling JS: {jf}")
        with open(jf, 'r', encoding='utf-8') as f:
            js_content += f"\n// {os.path.basename(jf)}\n" + f.read()

    css_tag = f"<style>\n{css_content}\n</style>"
    js_tag = f"<script>\n{js_content}\n</script>"

    final_html = final_html.replace('<!-- CSS_INJECT -->', css_tag)
    final_html = final_html.replace('</head>', f'{js_tag}\n</head>')

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(final_html)
        
    print("Bundle created at public/index.html")
    
    # Copy essential app static assets
    files_to_copy = [
        'manifest.json',
        'favicon.ico', 'favicon.svg', 'favicon-16x16.png', 
        'favicon-32x32.png', 'apple-touch-icon.png', 
        'icon-192.png', 'icon-512.png', 'version.json'
    ]
    
    for file in files_to_copy:
        if os.path.exists(file):
            shutil.copy(file, f'public/{os.path.basename(file)}')

    if os.path.exists('assets'):
        shutil.copytree('assets', 'public/assets', dirs_exist_ok=True)
    
    print("Copied icons, manifest, and assets to public/")
    print("Web bundle ready for deployment.")

if __name__ == '__main__':
    build()
