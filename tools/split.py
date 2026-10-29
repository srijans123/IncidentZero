#!/usr/bin/env python3
"""Extracts all '// FILE:', '-- FILE:', and '# FILE:' segments from the master markdown file."""
import pathlib, re, sys

MARKER_RE = re.compile(r"^(?://|--|#|<!--)\s*FILE:\s*(.+?)(?:\s*-->)?\s*$")

def extract_files(md_path: pathlib.Path, out_root: pathlib.Path) -> int:
    lines = md_path.read_text(encoding="utf-8").splitlines()
    in_fence = False
    current_path = None
    buffer = []
    written = 0

    def flush():
        nonlocal current_path, buffer, written
        if current_path is not None and buffer:
            target = out_root / current_path
            target.parent.mkdir(parents=True, exist_ok=True)
            content = "\n".join(buffer).rstrip() + "\n"
            target.write_text(content, encoding="utf-8")
            if target.suffix == ".sh":
                target.chmod(0o755)
            written += 1
        current_path = None
        buffer = []

    for line in lines:
        if line.startswith("```"):
            if in_fence:
                flush()
                in_fence = False
            else:
                in_fence = True
            continue
        if in_fence:
            m = MARKER_RE.match(line)
            if m:
                flush()
                current_path = m.group(1).strip()
            elif current_path is not None:
                buffer.append(line)
    flush()
    print(f"Extracted {written} files from {md_path.name}")
    return written

if __name__ == "__main__":
    md = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path("incident_zero_master_implementation_procedure_v2_2.md")
    root = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else pathlib.Path(".")
    extract_files(md, root)
