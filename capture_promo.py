import asyncio
import json
import urllib.request
import websockets
import time
import subprocess
import os

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

def capture_screen(output_path):
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    subprocess.run(['adb', 'shell', 'screencap', '-p', '/sdcard/promo_temp.png'], check=True)
    subprocess.run(['adb', 'pull', '/sdcard/promo_temp.png', output_path], check=True)
    print(f'Captured screenshot -> {output_path}')

if __name__ == '__main__':
    info = asyncio.run(eval_js("JSON.stringify({href: location.href, title: document.title})"))
    print("WebView info:", info)
