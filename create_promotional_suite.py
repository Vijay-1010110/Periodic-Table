import asyncio
import time
import subprocess
import os
import shutil
import urllib.request
import json
import websockets

SCREENSHOTS_DIR = 'promotional_material/screenshots'
ANIMATIONS_DIR = 'promotional_material/animations'
PEER_SCREENSHOTS = r'd:\Antigravity projects\Periodica-App\promotional_material\screenshots'
PEER_ANIMATIONS = r'd:\Antigravity projects\Periodica-App\promotional_material\animations'

os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(ANIMATIONS_DIR, exist_ok=True)
os.makedirs(PEER_SCREENSHOTS, exist_ok=True)
os.makedirs(PEER_ANIMATIONS, exist_ok=True)

WS_URL = None

def get_ws_url():
    global WS_URL
    res = urllib.request.urlopen('http://localhost:9222/json').read()
    targets = json.loads(res.decode('utf-8'))
    for t in targets:
        if 'localhost' in t.get('url', ''):
            WS_URL = t['webSocketDebuggerUrl']
            return WS_URL
    WS_URL = targets[0]['webSocketDebuggerUrl']
    return WS_URL

async def eval_js(js_code):
    ws_url = get_ws_url()
    async with websockets.connect(ws_url, max_size=10**8) as ws:
        msg = {
            'id': int(time.time()*1000) % 1000000,
            'method': 'Runtime.evaluate',
            'params': {
                'expression': js_code,
                'returnByValue': True,
                'awaitPromise': True
            }
        }
        await ws.send(json.dumps(msg))
        resp = await ws.recv()
        data = json.loads(resp)
        result = data.get('result', {}).get('result', {})
        return result.get('value')

def ensure_foreground():
    subprocess.run(['adb', 'shell', 'am start -n com.periodica.app/.MainActivity'], shell=True, stdout=subprocess.DEVNULL)
    subprocess.run(['adb', 'shell', 'settings put system accelerometer_rotation 0 && settings put system user_rotation 1'], shell=True, stdout=subprocess.DEVNULL)

async def capture_shot(filename, setup_js=None, delay=1.8):
    ensure_foreground()
    out_path = os.path.join(SCREENSHOTS_DIR, filename)
    print(f"\n[SCREENSHOT] Capturing: {filename}")
    if setup_js:
        await eval_js(setup_js)
        await asyncio.sleep(delay)
    
    subprocess.run(['adb', 'shell', 'screencap', '-p', '/sdcard/promo_temp.png'], check=True)
    subprocess.run(['adb', 'pull', '/sdcard/promo_temp.png', out_path], check=True)
    shutil.copy2(out_path, os.path.join(PEER_SCREENSHOTS, filename))
    print(f" -> Saved {out_path} ({os.path.getsize(out_path)} bytes)")

async def record_clip(output_base_name, duration_sec, setup_js=None, live_action_js=None):
    ensure_foreground()
    mp4_out = os.path.join(ANIMATIONS_DIR, f"{output_base_name}.mp4")
    gif_out = os.path.join(ANIMATIONS_DIR, f"{output_base_name}.gif")
    
    print(f"\n[VIDEO CLIP] Recording: {output_base_name} ({duration_sec}s)")
    if setup_js:
        await eval_js(setup_js)
        await asyncio.sleep(1.2)
        
    proc = subprocess.Popen([
        'adb', 'shell', 'screenrecord', 
        '--time-limit', str(duration_sec), 
        '--bit-rate', '12000000', 
        '/sdcard/promo_anim.mp4'
    ])
    await asyncio.sleep(0.5)

    if live_action_js:
        await eval_js(live_action_js)
        
    proc.wait()
    await asyncio.sleep(0.8)

    subprocess.run(['adb', 'pull', '/sdcard/promo_anim.mp4', mp4_out], check=True)
    subprocess.run(['adb', 'shell', 'rm', '/sdcard/promo_anim.mp4'], check=True)
    print(f" -> Saved MP4: {mp4_out} ({os.path.getsize(mp4_out)} bytes)")

    print(f" -> Generating optimized GIF via ffmpeg...")
    subprocess.run([
        'ffmpeg', '-y', '-i', mp4_out,
        '-vf', 'fps=15,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
        gif_out
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f" -> Saved GIF: {gif_out} ({os.path.getsize(gif_out)} bytes)")

    shutil.copy2(mp4_out, os.path.join(PEER_ANIMATIONS, f"{output_base_name}.mp4"))
    shutil.copy2(gif_out, os.path.join(PEER_ANIMATIONS, f"{output_base_name}.gif"))

async def unlock_pro():
    await eval_js('''
        (() => {
            localStorage.setItem('periodica_is_pro', 'true');
            localStorage.setItem('periodica_pro_tier', 'true');
            localStorage.setItem('periodica_tier', 'pro');
            if (window.PeriodicaBilling && window.PeriodicaBilling.setProUser) {
                window.PeriodicaBilling.setProUser(true);
            }
            if (typeof updateTierUI === 'function') updateTierUI();
            const modal = document.getElementById('pro-paywall-modal');
            if (modal) modal.style.display = 'none';
        })()
    ''')

if __name__ == '__main__':
    print("Promotional suite helper loaded.")
