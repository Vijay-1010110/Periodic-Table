import os
import math

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0a152e"/>
      <stop offset="100%" stop-color="#030712"/>
    </radialGradient>
    <radialGradient id="nucleusGlow" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#00d4ff"/>
      <stop offset="70%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>
    <linearGradient id="orb1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#00d4ff" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="orb2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#a855f7" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#c084fc" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="orb3" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#34d399" stop-opacity="0.9"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background rounded box -->
  <rect width="512" height="512" rx="112" fill="url(#bg)" stroke="#00d4ff" stroke-width="12" stroke-opacity="0.35"/>

  <!-- Orbital Rings -->
  <g filter="url(#glow)">
    <!-- Ring 1 (Cyan, 35 deg) -->
    <ellipse cx="256" cy="256" rx="205" ry="74" fill="none" stroke="url(#orb1)" stroke-width="16" transform="rotate(35 256 256)"/>
    
    <!-- Ring 2 (Purple, -35 deg) -->
    <ellipse cx="256" cy="256" rx="205" ry="74" fill="none" stroke="url(#orb2)" stroke-width="16" transform="rotate(-35 256 256)"/>

    <!-- Ring 3 (Emerald, 90 deg) -->
    <ellipse cx="256" cy="256" rx="205" ry="74" fill="none" stroke="url(#orb3)" stroke-width="16" transform="rotate(90 256 256)"/>
  </g>

  <!-- Nucleus with Multi-Layer Glow -->
  <circle cx="256" cy="256" r="68" fill="#00d4ff" opacity="0.25" filter="url(#glow)"/>
  <circle cx="256" cy="256" r="54" fill="url(#nucleusGlow)" filter="url(#glow)"/>
  
  <!-- "X" Chemistry Core Brand Element -->
  <text x="256" y="278" font-family="'Segoe UI', system-ui, -apple-system, sans-serif" font-weight="900" font-size="62" fill="#ffffff" text-anchor="middle" letter-spacing="1">X</text>

  <!-- Orbiting Quantum Electrons -->
  <circle cx="410" cy="155" r="20" fill="#00d4ff" filter="url(#glow)"/>
  <circle cx="410" cy="155" r="8" fill="#ffffff"/>

  <circle cx="102" cy="357" r="20" fill="#c084fc" filter="url(#glow)"/>
  <circle cx="102" cy="357" r="8" fill="#ffffff"/>

  <circle cx="256" cy="52" r="20" fill="#34d399" filter="url(#glow)"/>
  <circle cx="256" cy="52" r="8" fill="#ffffff"/>
</svg>"""

with open('favicon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

os.makedirs('public', exist_ok=True)
with open('public/favicon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print("Generated favicon.svg and public/favicon.svg")

try:
    from PIL import Image, ImageDraw
    
    def create_png(size, filename):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        s = size / 512.0
        
        bg_color = (10, 21, 46, 255)
        border_color = (0, 212, 255, 120)
        radius = int(112 * s)
        draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=bg_color, outline=border_color, width=max(1, int(12 * s)))
        
        n_r = int(54 * s)
        cx, cy = size // 2, size // 2
        draw.ellipse([cx - n_r, cy - n_r, cx + n_r, cy + n_r], fill=(0, 212, 255, 255), outline=(255, 255, 255, 200), width=max(1, int(4 * s)))
        
        dots = [
            (int(410 * s), int(155 * s), (0, 212, 255, 255)),
            (int(102 * s), int(357 * s), (192, 132, 252, 255)),
            (int(256 * s), int(52 * s), (52, 211, 153, 255))
        ]
        d_r = max(2, int(18 * s))
        for dx, dy, col in dots:
            draw.ellipse([dx - d_r, dy - d_r, dx + d_r, dy + d_r], fill=col)
            
        img.save(filename, format="PNG")
        print(f"Generated {filename}")
        return img

    img512 = create_png(512, 'icon-512.png')
    img512.save('public/icon-512.png')
    
    img192 = create_png(192, 'icon-192.png')
    img192.save('public/icon-192.png')
    
    img180 = create_png(180, 'apple-touch-icon.png')
    img180.save('public/apple-touch-icon.png')
    
    img32 = create_png(32, 'favicon-32x32.png')
    img32.save('public/favicon-32x32.png')
    
    img16 = create_png(16, 'favicon-16x16.png')
    img16.save('public/favicon-16x16.png')
    
    img32.save('favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    img32.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("Generated favicon.ico and public/favicon.ico")

except Exception as e:
    print(f"PIL generation notice: {e}")
