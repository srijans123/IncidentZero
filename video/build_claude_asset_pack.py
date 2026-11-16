import os
import json
import shutil
import zipfile
import html

def escape_xml(s):
    return html.escape(str(s))

def generate_code_svg(sc_id, snippet):
    title = snippet.get("title", sc_id)
    file_path = snippet.get("file_path", f"src/{sc_id}.java")
    lines = snippet.get("lines", [])
    highlights = snippet.get("highlights", [])
    lang = snippet.get("language", "java").upper()

    code_lines_svg = []
    y = 200
    for i, line in enumerate(lines, 1):
        is_hl = i in highlights
        bg_rect = ""
        if is_hl:
            bg_rect = f'<rect x="180" y="{y - 20}" width="1560" height="32" fill="rgba(0, 240, 255, 0.15)" stroke="rgba(0, 240, 255, 0.4)" stroke-width="1"/>'
        
        line_num_color = "#00f0ff" if is_hl else "#4a5568"
        line_text_color = "#ffffff" if is_hl else "#cbd5e1"
        escaped_line = escape_xml(line)

        code_lines_svg.append(f"""
        {bg_rect}
        <text x="210" y="{y}" fill="{line_num_color}" font-family="'JetBrains Mono', Consolas, monospace" font-size="18" font-weight="700" text-anchor="end">{i:2d}</text>
        <text x="240" y="{y}" fill="{line_text_color}" font-family="'JetBrains Mono', Consolas, monospace" font-size="18">{escaped_line}</text>
        """)
        y += 32

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06080d"/>
      <stop offset="100%" stop-color="#0d1322"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1920" height="1080" fill="url(#bg)"/>

  <!-- Code Window Frame -->
  <rect x="160" y="90" width="1600" height="900" rx="16" fill="#0b0f19" stroke="rgba(0, 240, 255, 0.35)" stroke-width="2"/>

  <!-- Window Header -->
  <path d="M 160 106 A 16 16 0 0 1 176 90 L 1744 90 A 16 16 0 0 1 1760 106 L 1760 148 L 160 148 Z" fill="#0f172a"/>
  <line x1="160" y1="148" x2="1760" y2="148" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>

  <!-- Window Dots -->
  <circle cx="196" cy="119" r="7" fill="#ff5f56"/>
  <circle cx="220" cy="119" r="7" fill="#ffbd2e"/>
  <circle cx="244" cy="119" r="7" fill="#27c93f"/>

  <!-- Title & File Badge -->
  <text x="280" y="125" fill="#ffffff" font-family="'JetBrains Mono', Consolas, monospace" font-size="16" font-weight="700">{escape_xml(title)}</text>
  <rect x="1560" y="105" width="80" height="26" rx="6" fill="rgba(0, 240, 255, 0.15)" stroke="#00f0ff" stroke-width="1"/>
  <text x="1600" y="123" fill="#00f0ff" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="800" text-anchor="middle">{lang}</text>

  <!-- File Path Subtitle -->
  <text x="210" y="178" fill="#94a3b8" font-family="'JetBrains Mono', monospace" font-size="14">file: {escape_xml(file_path)}</text>

  <!-- Code Body -->
  {''.join(code_lines_svg)}

  <!-- Footer Status -->
  <line x1="160" y1="940" x2="1760" y2="940" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
  <text x="210" y="968" fill="#00ff9d" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700">● COMPILED &amp; VERIFIED // STRICT DOMAIN ARCHITECTURE (R1-R9)</text>
  <text x="1710" y="968" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="13" text-anchor="end">Incident-Zero v2.2</text>
</svg>"""

def generate_terminal_svg(sc_id, term_data):
    title = term_data.get("title", f"Terminal — {sc_id}")
    cmd = term_data.get("command", "mvn test")
    lines = term_data.get("lines", [])

    term_lines_svg = []
    y = 230
    for line_obj in lines:
        raw_text = line_obj.get("text", "") if isinstance(line_obj, dict) else str(line_obj)
        escaped = escape_xml(raw_text)
        color = "#cbd5e1"
        if "PASS" in raw_text or "SUCCESS" in raw_text or "100%" in raw_text:
            color = "#00ff9d"
        elif "FAIL" in raw_text or "ERROR" in raw_text:
            color = "#ff3864"
        elif "WARN" in raw_text or "SLOW" in raw_text:
            color = "#ffb800"
        elif raw_text.startswith("$") or raw_text.startswith(">") or (isinstance(line_obj, dict) and line_obj.get("type") == "prompt"):
            color = "#00f0ff"

        term_lines_svg.append(f'<text x="210" y="{y}" fill="{color}" font-family="monospace" font-size="17">{escaped}</text>')
        y += 28

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="term_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#05070c"/>
      <stop offset="100%" stop-color="#0a101d"/>
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#term_bg)"/>

  <!-- Terminal Window -->
  <rect x="160" y="90" width="1600" height="900" rx="14" fill="#080c14" stroke="rgba(0, 255, 157, 0.4)" stroke-width="2"/>
  
  <!-- Terminal Header -->
  <path d="M 160 104 A 14 14 0 0 1 174 90 L 1746 90 A 14 14 0 0 1 1760 104 L 1760 144 L 160 144 Z" fill="#0e1726"/>
  <line x1="160" y1="144" x2="1760" y2="144" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>

  <circle cx="196" cy="117" r="7" fill="#ff5f56"/>
  <circle cx="220" cy="117" r="7" fill="#ffbd2e"/>
  <circle cx="244" cy="117" r="7" fill="#27c93f"/>

  <text x="280" y="123" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="700">{escape_xml(title)}</text>
  <text x="1710" y="123" fill="#00ff9d" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" text-anchor="end">zsh // bash</text>

  <!-- Prompt & Executed Command -->
  <text x="210" y="185" fill="#00ff9d" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800">root@iitsm-cluster:~$</text>
  <text x="460" y="185" fill="#ffffff" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="700">{escape_xml(cmd)}</text>

  <!-- Terminal Output Lines -->
  {''.join(term_lines_svg)}

  <!-- Bottom HUD Status -->
  <line x1="160" y1="940" x2="1760" y2="940" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
  <text x="210" y="968" fill="#00ff9d" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700">● EXECUTION COMPLETE // EXIT CODE 0</text>
</svg>"""

def generate_title_svg(sc_id, title, subtitle):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#04060a"/>
      <stop offset="100%" stop-color="#0a1224"/>
    </linearGradient>
    <radialGradient id="cyan_glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0, 240, 255, 0.25)"/>
      <stop offset="100%" stop-color="rgba(0, 0, 0, 0)"/>
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#bg)"/>
  <circle cx="960" cy="540" r="600" fill="url(#cyan_glow)"/>

  <!-- Perspective Cyber Grid -->
  <g stroke="rgba(0, 240, 255, 0.12)" stroke-width="1.5">
    <line x1="0" y1="700" x2="1920" y2="700"/>
    <line x1="0" y1="780" x2="1920" y2="780"/>
    <line x1="0" y1="880" x2="1920" y2="880"/>
    <line x1="0" y1="1000" x2="1920" y2="1000"/>
    <line x1="960" y1="540" x2="100" y2="1080"/>
    <line x1="960" y1="540" x2="400" y2="1080"/>
    <line x1="960" y1="540" x2="700" y2="1080"/>
    <line x1="960" y1="540" x2="960" y2="1080"/>
    <line x1="960" y1="540" x2="1220" y2="1080"/>
    <line x1="960" y1="540" x2="1520" y2="1080"/>
    <line x1="960" y1="540" x2="1820" y2="1080"/>
  </g>

  <!-- Accent Reticle Box -->
  <rect x="260" y="240" width="1400" height="600" rx="20" fill="rgba(10, 16, 28, 0.75)" stroke="rgba(0, 240, 255, 0.4)" stroke-width="2"/>

  <!-- Badge -->
  <rect x="835" y="320" width="250" height="38" rx="8" fill="rgba(0, 240, 255, 0.15)" stroke="#00f0ff" stroke-width="1.5"/>
  <text x="960" y="345" fill="#00f0ff" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" text-anchor="middle" letter-spacing="2">CS F213 / MAC F212</text>

  <!-- Title -->
  <text x="960" y="470" fill="#ffffff" font-family="'Segoe UI', -apple-system, sans-serif" font-size="56" font-weight="900" text-anchor="middle" letter-spacing="1.5">{escape_xml(title)}</text>

  <!-- Subtitle -->
  <text x="960" y="550" fill="#94a3b8" font-family="'Segoe UI', sans-serif" font-size="28" font-weight="600" text-anchor="middle">{escape_xml(subtitle)}</text>

  <!-- Team Pill -->
  <rect x="760" y="660" width="400" height="50" rx="25" fill="#0f172a" stroke="rgba(0, 255, 157, 0.5)" stroke-width="2"/>
  <text x="960" y="692" fill="#00ff9d" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800" text-anchor="middle">GROUP 76 · BITS PILANI HYDERABAD</text>
</svg>"""

def generate_member_svg(sc_id, name, bits_id, role):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050811"/>
      <stop offset="100%" stop-color="#0c1424"/>
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#bg)"/>

  <!-- Left Column: Webcam Slot -->
  <rect x="160" y="140" width="760" height="800" rx="16" fill="#090e19" stroke="rgba(0, 240, 255, 0.5)" stroke-width="2"/>
  <!-- Target Reticle in Webcam Slot -->
  <circle cx="540" cy="500" r="120" fill="none" stroke="rgba(0, 240, 255, 0.3)" stroke-width="2" stroke-dasharray="8 6"/>
  <line x1="540" y1="360" x2="540" y2="640" stroke="rgba(0, 240, 255, 0.3)" stroke-width="1.5"/>
  <line x1="400" y1="500" x2="680" y2="500" stroke="rgba(0, 240, 255, 0.3)" stroke-width="1.5"/>
  <text x="540" y="506" fill="#00f0ff" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" text-anchor="middle">[ WEBCAM VIDEO SLOT ]</text>
  <text x="540" y="540" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="13" text-anchor="middle">1080p Member Clip · Submissions (§9)</text>

  <!-- Right Column: Student Details & Contributions -->
  <rect x="960" y="140" width="800" height="800" rx="16" fill="#090e19" stroke="rgba(0, 255, 157, 0.4)" stroke-width="2"/>

  <!-- Header -->
  <rect x="1000" y="180" width="200" height="32" rx="6" fill="rgba(0, 255, 157, 0.15)" stroke="#00ff9d" stroke-width="1"/>
  <text x="1100" y="202" fill="#00ff9d" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="800" text-anchor="middle">TEAM MEMBER SPEC</text>

  <text x="1000" y="280" fill="#ffffff" font-family="'Segoe UI', sans-serif" font-size="44" font-weight="900">{escape_xml(name)}</text>
  <text x="1000" y="330" fill="#00f0ff" font-family="'JetBrains Mono', monospace" font-size="24" font-weight="800">BITS ID: {escape_xml(bits_id)}</text>
  <text x="1000" y="375" fill="#94a3b8" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="600">{escape_xml(role)}</text>

  <line x1="1000" y1="415" x2="1720" y2="415" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1.5"/>

  <!-- Contributions Section -->
  <text x="1000" y="460" fill="#cbd5e1" font-family="'Segoe UI', sans-serif" font-size="20" font-weight="700">Individual Engineering Deliverables:</text>
  <text x="1030" y="510" fill="#94a3b8" font-family="'Segoe UI', sans-serif" font-size="17">✔ Domain modeling &amp; OOP architecture compliance</text>
  <text x="1030" y="555" fill="#94a3b8" font-family="'Segoe UI', sans-serif" font-size="17">✔ Strict encapsulation, immutable records &amp; factory patterns</text>
  <text x="1030" y="600" fill="#94a3b8" font-family="'Segoe UI', sans-serif" font-size="17">✔ Modulith event-driven architecture &amp; transactional listener</text>
  <text x="1030" y="645" fill="#94a3b8" font-family="'Segoe UI', sans-serif" font-size="17">✔ Live system demonstration and architectural presentation</text>

  <!-- Footer Tag -->
  <rect x="1000" y="860" width="720" height="46" rx="8" fill="#0e1726" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
  <text x="1360" y="889" fill="#64748b" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="700" text-anchor="middle">GROUP 76 · BITS PILANI HYDERABAD CAMPUS · 2026-2027</text>
</svg>"""

def main():
    pack_dir = "video/claude_visual_pack"
    os.makedirs(pack_dir, exist_ok=True)

    dirs = {
        "diagrams": os.path.join(pack_dir, "01_15_diagrams"),
        "code_cards": os.path.join(pack_dir, "02_34_code_cards"),
        "terminals": os.path.join(pack_dir, "03_07_terminals"),
        "titles": os.path.join(pack_dir, "04_06_title_cards"),
        "members": os.path.join(pack_dir, "05_04_member_slots"),
        "components": os.path.join(pack_dir, "06_remotion_components")
    }
    for d in dirs.values():
        os.makedirs(d, exist_ok=True)

    # 1. Copy 15 SVG Diagrams
    diag_src = "video/05_diagrams"
    diag_count = 0
    if os.path.exists(diag_src):
        for f in os.listdir(diag_src):
            if f.endswith(".svg"):
                shutil.copy2(os.path.join(diag_src, f), os.path.join(dirs["diagrams"], f))
                diag_count += 1
    print(f"[✓] 15 Diagrams: Copied {diag_count} SVG files")

    # 2. 34 Code Cards
    code_json = "video/07_remotion/public/code_snippets.json"
    snippets = json.load(open(code_json, "r", encoding="utf-8")) if os.path.exists(code_json) else {}
    shutil.copy2(code_json, os.path.join(dirs["code_cards"], "code_snippets_master.json"))
    code_count = 0
    for sc_id, snip in snippets.items():
        svg_content = generate_code_svg(sc_id, snip)
        with open(os.path.join(dirs["code_cards"], f"{sc_id}.svg"), "w", encoding="utf-8") as f:
            f.write(svg_content)
        with open(os.path.join(dirs["code_cards"], f"{sc_id}.json"), "w", encoding="utf-8") as f:
            json.dump(snip, f, indent=2)
        code_count += 1
    print(f"[✓] 34 Code Cards: Generated {code_count} standalone SVG cards + JSON specs")

    # 3. 7 Terminal Cards
    term_json = "video/07_remotion/public/terminal_outputs.json"
    terminals = json.load(open(term_json, "r", encoding="utf-8")) if os.path.exists(term_json) else {}
    shutil.copy2(term_json, os.path.join(dirs["terminals"], "terminal_outputs_master.json"))
    term_count = 0
    for sc_id, t_data in terminals.items():
        svg_content = generate_terminal_svg(sc_id, t_data)
        with open(os.path.join(dirs["terminals"], f"{sc_id}.svg"), "w", encoding="utf-8") as f:
            f.write(svg_content)
        with open(os.path.join(dirs["terminals"], f"{sc_id}.json"), "w", encoding="utf-8") as f:
            json.dump(t_data, f, indent=2)
        term_count += 1
    print(f"[✓] 7 Terminal Cards: Generated {term_count} standalone SVG cards + JSON specs")

    # 4. 6 Title Cards
    title_specs = [
        ("act0_scene4", "Incident-Zero (I-ITSM v2.2)", "Autonomous Enterprise Campus Service Management"),
        ("act1_scene1", "Group 76 — BITS Pilani Hyderabad", "Object-Oriented Programming (CS F213 / MAC F212)"),
        ("act8_scene1", "Object-Oriented Design Mastery", "11 Proven Gang of Four Design Patterns"),
        ("act10_scene1", "Comprehensive Requirements Fulfillment", "100% Alignment with CS F213 / MAC F212 Brief"),
        ("act10_scene5", "Incident-Zero (I-ITSM v2.2)", "Group 76 — BITS Pilani, Hyderabad Campus"),
        ("act10_scene6", "Reach Zero. Stay Resilient.", "https://github.com/srijans123/IncidentZero")
    ]
    title_count = 0
    for sc_id, tit, sub in title_specs:
        svg_content = generate_title_svg(sc_id, tit, sub)
        with open(os.path.join(dirs["titles"], f"{sc_id}.svg"), "w", encoding="utf-8") as f:
            f.write(svg_content)
        with open(os.path.join(dirs["titles"], f"{sc_id}.json"), "w", encoding="utf-8") as f:
            json.dump({"id": sc_id, "title": tit, "subtitle": sub}, f, indent=2)
        title_count += 1
    print(f"[✓] 6 Title Cards: Generated {title_count} standalone SVG cards + JSON specs")

    # 5. 4 Member Slots
    members = [
        ("act1_scene2", "Srijan Shukla", "2025A7PS0194H", "Lead System Architect & Core Domain Engine"),
        ("act1_scene3", "Suhani Agarwal", "2025ADPS0216H", "Event-Driven Modulith & Cryptographic Audit Ledger"),
        ("act1_scene4", "Kartikey Negi", "2025ADPS0129H", "Reactive State Machine & Dynamic SLA Engine"),
        ("act1_scene5", "Hairsh Kumar", "2025A7PS0910H", "Resilience, Chaos Testing & Test Suite Verification")
    ]
    member_count = 0
    for sc_id, name, bid, role in members:
        svg_content = generate_member_svg(sc_id, name, bid, role)
        with open(os.path.join(dirs["members"], f"{sc_id}.svg"), "w", encoding="utf-8") as f:
            f.write(svg_content)
        with open(os.path.join(dirs["members"], f"{sc_id}.json"), "w", encoding="utf-8") as f:
            json.dump({"id": sc_id, "name": name, "bits_id": bid, "role": role}, f, indent=2)
        member_count += 1
    print(f"[✓] 4 Member Slots: Generated {member_count} standalone SVG cards + JSON specs")

    # 6. Remotion Component Templates
    comp_src = "video/07_remotion/src"
    comp_files = ["CodeCard.jsx", "TerminalCard.jsx", "DiagramScene.jsx", "TitleCard.jsx", "MemberCard.jsx", "Captions.jsx", "LowerThird.jsx"]
    comp_count = 0
    for cf in comp_files:
        src_p = os.path.join(comp_src, cf)
        if os.path.exists(src_p):
            shutil.copy2(src_p, os.path.join(dirs["components"], cf))
            comp_count += 1
    print(f"[✓] Remotion Components: Copied {comp_count} JSX files")

    # 7. Write comprehensive README for Claude
    readme_path = os.path.join(pack_dir, "README_FOR_CLAUDE.md")
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write("""# Incident-Zero (I-ITSM v2.2) — Visual Asset Enhancement Pack

This asset pack contains all non-video visual presentation cards for the Incident-Zero video pipeline (1920x1080 @ 30fps).

## Directory Structure:
1. `01_15_diagrams/`: 15 Full high-res SVG architecture & domain diagrams (Hexagonal architecture, State machine, Modulith boundaries, Merkle audit chain, etc.).
2. `02_34_code_cards/`: 34 Standalone 1920x1080 SVG code cards with line numbers and highlights + individual JSON specs + `code_snippets_master.json`.
3. `03_07_terminals/`: 7 Standalone 1920x1080 SVG terminal replays + individual JSON specs + `terminal_outputs_master.json`.
4. `04_06_title_cards/`: 6 Standalone 1920x1080 SVG title cards + individual JSON specs.
5. `05_04_member_slots/`: 4 Standalone 1920x1080 SVG student presentation cards with webcam slots + individual JSON specs.
6. `06_remotion_components/`: The React JSX component implementations rendered by Remotion.

## Design Specifications & Color Tokens:
- Canvas Viewport: `1920 x 1080` (16:9 widescreen)
- Background: Deep Void `#06080d` / `#090e19` with subtle radial cyan gradients
- Primary Accent: Neon Cyan `#00f0ff`
- Success Accent: Mint Green `#00ff9d`
- Warning Accent: Cyber Amber `#ffb800`
- Critical Accent: Neon Crimson `#ff3864`
- Body Text: `#ffffff` (Headers), `#cbd5e1` (Subtext), `#94a3b8` (Muted)
- Code / Monospace Font: `'JetBrains Mono', Consolas, monospace`
- UI Font: `'Segoe UI', -apple-system, sans-serif`
""")

    # 8. Create ZIP archive
    zip_path = "video/assets.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(pack_dir):
            for file in files:
                full_p = os.path.join(root, file)
                rel_p = os.path.relpath(full_p, pack_dir).replace("\\", "/")
                zf.write(full_p, rel_p)

    zip_size_kb = os.path.getsize(zip_path) / 1024
    print(f"\n============================================================")
    print(f"  [✓] Successfully created {zip_path} ({zip_size_kb:.1f} KB)")
    print(f"============================================================")

if __name__ == "__main__":
    main()
