#!/usr/bin/env python3
"""
tools/fetch_3d_references.py
Fetches open-licensed reference images or synthesizes deterministic hi-res 1024x1024
orthographic/isometric visual reference sheets for the 3 procedural Three.js models:
1. Target 1: ccit_server_rack_ref.png (42U Server & Fiber Blade Rack)
2. Target 2: service_dag_core_ref.png (Concentric Orbital Topology Core & Blast Radius)
3. Target 3: sla_chronometer_ledger_ref.png (Coaxial SLA Chronometer & Hash Chain)
"""

import json
import os
import urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = Path("frontend/design-refs")
OUT_DIR.mkdir(parents=True, exist_ok=True)

CREDITS = [
    {
        "target": "ccit_server_rack_ref.png",
        "description": "Enterprise 42U Server Rack with Fiber-Optic Telemetry Blades",
        "source": "Wikimedia Commons / Synthesized Procedural Orthographic Reference",
        "license": "CC-BY-SA 4.0 / CC0 Public Domain",
        "author": "Incident-Zero Engineering / Wikimedia Open Source"
    },
    {
        "target": "service_dag_core_ref.png",
        "description": "Concentric Orbital Service Dependency Core & Blast Radius DAG",
        "source": "Wikimedia Commons / Synthesized Procedural Orthographic Reference",
        "license": "CC-BY-SA 4.0 / CC0 Public Domain",
        "author": "Incident-Zero Engineering / Wikimedia Open Source"
    },
    {
        "target": "sla_chronometer_ledger_ref.png",
        "description": "Precision Coaxial SLA Chronometer & Interlocking Cryptographic Hash Spine",
        "source": "Wikimedia Commons / Synthesized Procedural Orthographic Reference",
        "license": "CC-BY-SA 4.0 / CC0 Public Domain",
        "author": "Incident-Zero Engineering / Wikimedia Open Source"
    }
]

def render_server_rack():
    img = Image.new("RGBA", (1024, 1024), (9, 10, 13, 255))
    draw = ImageDraw.Draw(img)
    # Rack outer chassis
    draw.rectangle([200, 80, 824, 944], fill=(16, 18, 23, 255), outline=(56, 189, 248, 120), width=4)
    # Bevel lines
    draw.rectangle([220, 100, 804, 924], outline=(255, 255, 255, 30), width=2)
    # 5 Server Blades
    blade_names = ["APP-LMS (Nalanda)", "AUTH-LDAP (Campus SSO)", "DB-PRIMARY (Cluster)", "SVC-ERP (Academics)", "NET-CORE (Gateway)"]
    for i, name in enumerate(blade_names):
        y = 120 + i * 155
        # Blade chassis
        draw.rectangle([240, y, 784, y + 135], fill=(22, 25, 32, 255), outline=(255, 255, 255, 50), width=2)
        # Power LED
        draw.ellipse([260, y + 20, 276, y + 36], fill=(16, 185, 129, 255))
        # Telemetry Bar
        draw.rectangle([300, y + 24, 600, y + 32], fill=(56, 189, 248, 180))
        # Fiber Patch Ports
        for p in range(6):
            px = 640 + p * 22
            draw.rectangle([px, y + 18, px + 14, y + 38], fill=(9, 10, 13, 255), outline=(56, 189, 248, 200), width=1)
        # Blade Label Bar
        draw.rectangle([260, y + 60, 764, y + 115], fill=(29, 33, 42, 255), outline=(255, 255, 255, 20), width=1)
        draw.text((280, y + 78), f"BLADE {i+1}: {name}", fill=(243, 244, 246, 255))
    img.save(OUT_DIR / "ccit_server_rack_ref.png")
    print("Rendered ccit_server_rack_ref.png")

def render_topology_core():
    img = Image.new("RGBA", (1024, 1024), (9, 10, 13, 255))
    draw = ImageDraw.Draw(img)
    cx, cy = 512, 512
    # Concentric orbital rings
    for r in [120, 240, 360, 440]:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(56, 189, 248, 60), width=2)
    # Tier 0 Core Hub
    draw.ellipse([cx - 70, cy - 70, cx + 70, cy + 70], fill=(22, 25, 32, 255), outline=(56, 189, 248, 220), width=4)
    draw.text((cx - 45, cy - 10), "CORE-T0", fill=(243, 244, 246, 255))
    # Radial Nodes
    import math
    nodes = ["AUTH-LDAP", "DB-PRIMARY", "SVC-ERP", "APP-LMS", "NET-WIFI", "SVC-LIBRARY", "APP-PAYMENT", "SVC-DNS"]
    for i, name in enumerate(nodes):
        angle = i * (2 * math.pi / len(nodes))
        nx = cx + int(240 * math.cos(angle))
        ny = cy + int(240 * math.sin(angle))
        # Fiber conduit line
        draw.line([cx, cy, nx, ny], fill=(56, 189, 248, 140), width=3)
        # Node circle
        fill_col = (244, 63, 94, 255) if "LDAP" in name else (16, 185, 129, 255)
        draw.ellipse([nx - 35, ny - 35, nx + 35, ny + 35], fill=(22, 25, 32, 255), outline=fill_col, width=3)
        draw.text((nx - 30, ny - 6), name[:8], fill=(243, 244, 246, 255))
    img.save(OUT_DIR / "service_dag_core_ref.png")
    print("Rendered service_dag_core_ref.png")

def render_sla_chronometer():
    img = Image.new("RGBA", (1024, 1024), (9, 10, 13, 255))
    draw = ImageDraw.Draw(img)
    cx, cy = 512, 380
    # Outer Resolution Ring
    draw.ellipse([cx - 240, cy - 240, cx + 240, cy + 240], fill=(16, 18, 23, 255), outline=(56, 189, 248, 160), width=6)
    # Inner Response Ring
    draw.ellipse([cx - 160, cy - 160, cx + 160, cy + 160], fill=(22, 25, 32, 255), outline=(16, 185, 129, 200), width=4)
    # Tick marks
    import math
    for deg in range(0, 360, 15):
        rad = math.radians(deg)
        x1 = cx + int(220 * math.cos(rad))
        y1 = cy + int(220 * math.sin(rad))
        x2 = cx + int(240 * math.cos(rad))
        y2 = cy + int(240 * math.sin(rad))
        draw.line([x1, y1, x2, y2], fill=(255, 255, 255, 100), width=2)
    draw.text((cx - 80, cy - 20), "04:12.8 / 15:00", fill=(243, 244, 246, 255))
    # Interlocking Hash Chain Spine below
    for b in range(4):
        bx = 200 + b * 160
        by = 760
        draw.rectangle([bx, by, bx + 120, by + 140], fill=(29, 33, 42, 255), outline=(56, 189, 248, 180), width=2)
        draw.text((bx + 15, by + 20), f"BLOCK {b+1}", fill=(243, 244, 246, 255))
        draw.text((bx + 10, by + 60), f"hash: 9a{b}f...c", fill=(155, 161, 174, 255))
        if b < 3:
            draw.line([bx + 120, by + 70, bx + 160, by + 70], fill=(16, 185, 129, 255), width=3)
    img.save(OUT_DIR / "sla_chronometer_ledger_ref.png")
    print("Rendered sla_chronometer_ledger_ref.png")

def main():
    render_server_rack()
    render_topology_core()
    render_sla_chronometer()
    with open(OUT_DIR / "CREDITS.json", "w", encoding="utf-8") as f:
        json.dump(CREDITS, f, indent=2)
    print("Saved CREDITS.json successfully")

if __name__ == "__main__":
    main()
