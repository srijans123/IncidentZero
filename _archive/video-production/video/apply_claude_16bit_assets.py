import os
import shutil

def apply_assets():
    base_src = "video/claude_fixed"
    
    # 1. Copy 15 Diagrams (.svg)
    diag_src = os.path.join(base_src, "01_15_diagrams")
    diag_dest1 = "video/05_diagrams"
    diag_dest2 = "video/07_remotion/public/diagrams"
    os.makedirs(diag_dest1, exist_ok=True)
    os.makedirs(diag_dest2, exist_ok=True)
    
    for f in os.listdir(diag_src):
        if f.endswith(".svg"):
            shutil.copy2(os.path.join(diag_src, f), os.path.join(diag_dest1, f))
            shutil.copy2(os.path.join(diag_src, f), os.path.join(diag_dest2, f))
    print("[✓] 15 Diagrams copied to video/05_diagrams & public/diagrams")

    # 2. Copy diagram_svgs.json
    shutil.copy2(os.path.join(diag_src, "diagram_svgs.json"), "video/07_remotion/public/diagram_svgs.json")
    print("[✓] diagram_svgs.json copied to public/diagram_svgs.json")

    # 3. Copy code_snippets_master.json -> public/code_snippets.json
    code_master = os.path.join(base_src, "02_34_code_cards", "code_snippets_master.json")
    shutil.copy2(code_master, "video/07_remotion/public/code_snippets.json")
    print("[✓] code_snippets_master.json copied to public/code_snippets.json")

    # 4. Copy terminal_outputs_master.json -> public/terminal_outputs.json
    term_master = os.path.join(base_src, "03_07_terminals", "terminal_outputs_master.json")
    shutil.copy2(term_master, "video/07_remotion/public/terminal_outputs.json")
    print("[✓] terminal_outputs_master.json copied to public/terminal_outputs.json")

    # 5. Copy and adjust 7 Remotion components to video/07_remotion/src/
    comp_src = os.path.join(base_src, "06_remotion_components")
    remotion_src = "video/07_remotion/src"
    
    for cf in os.listdir(comp_src):
        if cf.endswith(".jsx"):
            src_file = os.path.join(comp_src, cf)
            dest_file = os.path.join(remotion_src, cf)
            content = open(src_file, "r", encoding="utf-8").read()
            
            # Adjust import path in DiagramScene.jsx
            if cf == "DiagramScene.jsx":
                content = content.replace(
                    "import diagramSvgs from '../01_15_diagrams/diagram_svgs.json';",
                    "import diagramSvgs from '../public/diagram_svgs.json';"
                )
            
            with open(dest_file, "w", encoding="utf-8") as out:
                out.write(content)
            print(f"[✓] Installed component: {cf}")

if __name__ == "__main__":
    apply_assets()

