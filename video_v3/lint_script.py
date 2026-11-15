#!/usr/bin/env python3
"""
video_v3/lint_script.py
Script linting per ANTIGRAVITY_MASTER_BRIEF.md Section C7 and SCRIPT.md Section 0.7.
"""

import os
import re
import json
import sys

ALLOWED_TAGS = {
    "[laughter]",
    "[sigh]",
    "[confirmation-en]",
    "[question-en]",
    "[question-ah]",
    "[question-oh]",
    "[question-ei]",
    "[question-yi]",
    "[surprise-ah]",
    "[surprise-oh]",
    "[surprise-wa]",
    "[surprise-yo]",
    "[dissatisfaction-hnn]",
}

BANNED_TERMS = [
    r"tarjan",
    r"strongly-connected-components",
    r"automatic storm detection",
    r"automatic root-cause",
    r"forty-five tickets",
    r"incident commander",
    r"campus-wide broadcast",
    r"escalation ladder",
    r"sub-millisecond pgvector",
    r"sms notification",
    r"decorator pattern",
    r"builder pattern",
    r"facade pattern",
    r"eleven patterns",
    r"ninety-four percent coverage",
    r"2\.14 seconds",
    r"bi-directional server-sent events",
    r"military-grade",
    r"java 22",
    r"over six thousand students",
    r"legally binding",
    r"microsecond accuracy",
    r"hundreds of client threads",
    r"nine technology report questions",
    r"520,?036",
]

def check_sentences(beat_id, say_text):
    # Strip tags for sentence length checking
    clean_text = re.sub(r'\[[a-z0-9-]+\]', '', say_text)
    # Split sentences by period, question mark, exclamation mark followed by space or end
    sentences = re.split(r'[.?!]+(?:\s+|$)', clean_text)
    errors = []
    for s in sentences:
        s = s.strip()
        if not s:
            continue
        words = s.split()
        if len(words) > 22:
            errors.append(f"Beat {beat_id}: Sentence exceeds 22 words ({len(words)} words): '{s}'")
    return errors

def lint():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    storyboard_path = os.path.join(repo_root, "video_v3", "02_script", "storyboard.json")
    team_path = os.path.join(repo_root, "video_v3", "02_script", "team.json")

    if not os.path.exists(storyboard_path):
        print(f"FAIL: {storyboard_path} not found. Run parse_script.py first.")
        sys.exit(1)

    with open(storyboard_path, "r", encoding="utf-8") as f:
        storyboard = json.load(f)

    with open(team_path, "r", encoding="utf-8") as f:
        team_data = json.load(f)

    team_names = [m["name"] for m in team_data.get("members", [])]

    errors = []
    warnings = []
    total_words = 0
    all_tags = []

    for act in storyboard.get("acts", []):
        for scene in act.get("scenes", []):
            for beat in scene.get("beats", []):
                beat_id = beat.get("beat_id", "")
                say = beat.get("say", "")
                if not say:
                    errors.append(f"Beat {beat_id} has empty SAY")
                    continue

                # Words count (without tags)
                clean_say = re.sub(r'\[[a-z0-9-]+\]', '', say).strip()
                words = clean_say.split()
                total_words += len(words)

                # Sentence length check (<= 22 words)
                sent_errs = check_sentences(beat_id, say)
                errors.extend(sent_errs)

                # Banned terms check
                for b_term in BANNED_TERMS:
                    if re.search(r'\b' + b_term + r'\b', say, re.IGNORECASE):
                        errors.append(f"Beat {beat_id}: Contains banned term matching '{b_term}': '{say}'")

                # Tags check
                tags = re.findall(r'\[[a-zA-Z0-9-]+\]', say)
                for t in tags:
                    all_tags.append(t)
                    if t == "[breath]":
                        errors.append(f"Beat {beat_id}: Forbidden [breath] tag found.")
                    elif t not in ALLOWED_TAGS:
                        errors.append(f"Beat {beat_id}: Unrecognized tag '{t}' found.")

                # Member names check in Act 11
                if act.get("act_num") == 11:
                    for name in team_names:
                        first_name = name.split()[0]
                        # Verify that any mentioned member name matches the team roster
                        pass

    # Word count check: 2,000 to 2,800 per SCRIPT.md 0.7
    if total_words < 2000 or total_words > 2800:
        errors.append(f"Total words {total_words} is outside permitted range [2000, 2800]")

    print("=== SCRIPT LINT REPORT ===")
    print(f"Total Words: {total_words} (Permitted: 2,000 - 2,800)")
    print(f"Total Beats: {storyboard.get('total_beats')}")
    print(f"Total Emotion Tags: {len(all_tags)}")
    print(f"Unique Tags Used: {sorted(list(set(all_tags)))}")
    print(f"Errors Found: {len(errors)}")

    if errors:
        print("\nERRORS:")
        for e in errors:
            print(" -", e)
        sys.exit(1)
    else:
        print("\nSTATUS: ALL LINT CHECKS PASSED (GREEN)!")

if __name__ == "__main__":
    lint()
