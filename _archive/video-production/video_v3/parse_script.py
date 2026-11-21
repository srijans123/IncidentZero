#!/usr/bin/env python3
"""
video_v3/parse_script.py
Parses SCRIPT.md into video_v3/02_script/storyboard.json according to
ANTIGRAVITY_MASTER_BRIEF.md and SCRIPT.md Section 0.1-0.5.
"""

import os
import re
import json

def get_pinned_sha():
    sha_path = os.path.join(os.path.dirname(__file__), "01_facts", "PINNED_SHA.txt")
    if os.path.exists(sha_path):
        for enc in ["utf-8", "utf-16", "utf-8-sig"]:
            try:
                with open(sha_path, "r", encoding=enc) as f:
                    return f.read().strip()
            except Exception:
                pass
    return "daf3e1d11f8a89d04095eeab068719e7651506e5"

PRONUNCIATION_TABLE = [
    (r"\bGroup 76\b", "Group seventy-six"),
    (r"\bBITS Pilani\b", "Bits Pilani"),
    (r"\bSLA\b", "S L A"),
    (r"\bJPA\b", "J P A"),
    (r"\bREST\b", "rest"),
    (r"\bURL\b", "U R L"),
    (r"\bHTTP\b", "H T T P"),
    (r"\bHTML\b", "H T M L"),
    (r"\bSHA-256\b", "shah two fifty six"),
    (r"\b409\b", "four oh nine"),
    (r"\bP2\b", "P two"),
    (r"\bP1\b", "P one"),
    (r"\bLMS\b", "L M S"),
    (r"\bGitHub\b", "git hub"),
    (r"\breadme\b", "read me"),
    (r"\bdoExecute\b", "do execute"),
]

CAMEL_CASE_SPLIT = [
    ("IncidentState", "Incident State"),
    ("SlaClock", "S L A Clock"),
    ("ClockPort", "Clock Port"),
    ("AssignedState", "Assigned State"),
    ("IncidentCommandService", "Incident Command Service"),
    ("NewState", "New State"),
    ("ResolvedState", "Resolved State"),
    ("AcknowledgedState", "Acknowledged State"),
    ("InProgressState", "In Progress State"),
    ("VerifiedState", "Verified State"),
    ("ClosedState", "Closed State"),
    ("CommandAuthorizer", "Command Authorizer"),
    ("BusinessCalendar", "Business Calendar"),
    ("VirtualAnchoredClock", "Virtual Anchored Clock"),
    ("IntakePipeline", "Intake Pipeline"),
    ("AbstractIntakeStep", "Abstract Intake Step"),
    ("ValidateStep", "Validate Step"),
    ("PriorityAndSlaStep", "Priority And S L A Step"),
    ("ItilMatrixPriorityStrategy", "Itil Matrix Priority Strategy"),
    ("LeastLoadedStrategy", "Least Loaded Strategy"),
    ("RoundRobinStrategy", "Round Robin Strategy"),
    ("SkillMatchStrategy", "Skill Match Strategy"),
    ("IncidentController", "Incident Controller"),
    ("JpaIncidentRepositoryAdapter", "J P A Incident Repository Adapter"),
    ("AuditLedgerInTxListener", "Audit Ledger In Tx Listener"),
    ("AuditHasher", "Audit Hasher"),
    ("SecurityConfig", "Security Config"),
    ("GlobalProblemDetailsHandler", "Global Problem Details Handler"),
    ("AuthContext", "Auth Context"),
    ("PortalReport", "Portal Report"),
    ("WorkbenchDetail", "Workbench Detail"),
]

def make_spoken_text(say_text):
    text = say_text
    # Specific known CamelCase phrases first
    for orig, rep in CAMEL_CASE_SPLIT:
        text = re.sub(r'\b' + orig + r'\b', rep, text)
    # Pronunciation table
    for pat, rep in PRONUNCIATION_TABLE:
        text = re.sub(pat, rep, text)
    return text

def strip_tags(say_text):
    return re.sub(r'\[[a-z0-9-]+\]', '', say_text).strip()

def parse_script(script_path):
    with open(script_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the start of the script at ACT 0
    act_0_match = re.search(r'^## ACT 0 — INTRO', content, re.MULTILINE)
    if not act_0_match:
        raise ValueError("Could not find '## ACT 0 — INTRO' in SCRIPT.md")
    
    # End before section 12 TRACE SUMMARY
    sec_12_match = re.search(r'^## 12\. TRACE SUMMARY', content, re.MULTILINE)
    end_pos = sec_12_match.start() if sec_12_match else len(content)

    script_body = content[act_0_match.start():end_pos]
    lines = script_body.splitlines()

    acts = []
    current_act = None
    current_scene = None
    current_beat = None

    act_re = re.compile(r'^## ACT (\d+) — (.+)$')
    scene_re = re.compile(r'^### (S\d+\.\d+) · (.+?) · (.+)$')
    card_re = re.compile(r'^CARD \*\*([A-Za-z0-9-]+)\*\* · (.+?) · FROM (.+?) · TO (.+)$')
    beat_re = re.compile(r'^- \*\*(a\d+b\d+)\*\* · DO: (.+)$')

    for line in lines:
        stripped = line.strip()
        
        # Check Act
        m_act = act_re.match(stripped)
        if m_act:
            current_act = {
                "act_num": int(m_act.group(1)),
                "title": m_act.group(2).strip(),
                "scenes": []
            }
            acts.append(current_act)
            current_scene = None
            current_beat = None
            continue

        # Check Scene
        m_scene = scene_re.match(stripped)
        if m_scene:
            types_str = m_scene.group(2).strip()
            scene_types = [t.strip() for t in types_str.split('+')]
            current_scene = {
                "scene_id": m_scene.group(1).strip(),
                "types": scene_types,
                "title": m_scene.group(3).strip(),
                "notes": [],
                "cards": [],
                "beats": []
            }
            if current_act is not None:
                current_act["scenes"].append(current_scene)
            current_beat = None
            continue

        # Check Card definition in scene
        m_card = card_re.match(stripped)
        if m_card and current_scene is not None:
            current_scene["cards"].append({
                "id": m_card.group(1).strip(),
                "file": m_card.group(2).strip().strip('`'),
                "from": m_card.group(3).strip().strip('`'),
                "to": m_card.group(4).strip().strip('`')
            })
            continue

        # Check Beat
        m_beat = beat_re.match(stripped)
        if m_beat:
            beat_id = m_beat.group(1).strip()
            action = m_beat.group(2).strip()
            current_beat = {
                "beat_id": beat_id,
                "do": action,
                "say": "",
                "say_spoken": "",
                "subtitles": "",
                "requires": None,
                "alt": None,
                "cut": None
            }
            if current_scene is not None:
                current_scene["beats"].append(current_beat)
            continue

        # Fields under beat
        if current_beat is not None:
            if stripped.startswith("SAY:"):
                say_text = stripped[4:].strip()
                current_beat["say"] = say_text
                current_beat["say_spoken"] = make_spoken_text(say_text)
                current_beat["subtitles"] = strip_tags(say_text)
            elif stripped.startswith("REQUIRES:"):
                current_beat["requires"] = stripped[9:].strip()
            elif stripped.startswith("ALT:"):
                current_beat["alt"] = stripped[4:].strip()
            elif stripped.startswith("CUT:"):
                current_beat["cut"] = int(stripped[4:].strip())
        elif current_scene is not None:
            # Metadata or notes under scene before beats
            if stripped and not stripped.startswith("---") and not stripped.startswith("CARD"):
                current_scene["notes"].append(stripped)

    pinned_sha = get_pinned_sha()
    return {
        "pinned_sha": pinned_sha,
        "total_acts": len(acts),
        "total_scenes": sum(len(a["scenes"]) for a in acts),
        "total_beats": sum(len(s["beats"]) for a in acts for s in a["scenes"]),
        "acts": acts
    }

def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    script_path = os.path.join(repo_root, "SCRIPT.md")
    out_dir = os.path.join(repo_root, "video_v3", "02_script")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "storyboard.json")

    storyboard = parse_script(script_path)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(storyboard, f, indent=2, ensure_ascii=False)

    print(f"Parsed SCRIPT.md -> {out_path}")
    print(f"Total Acts: {storyboard['total_acts']}")
    print(f"Total Scenes: {storyboard['total_scenes']}")
    print(f"Total Beats: {storyboard['total_beats']}")

if __name__ == "__main__":
    main()
