from pathlib import Path
root = Path(r'f:\projects\binwin')
changed = []
for p in sorted(root.glob('*.html')):
    lines = p.read_text(encoding='utf-8').splitlines()
    out = []
    bootstrap_seen = False
    for line in lines:
        if 'href="assets/css/bootstrap.css"' in line:
            if bootstrap_seen:
                continue
            bootstrap_seen = True
        out.append(line)
    text = '\n'.join(out)
    if 'href="assets/css/style.css"' in text:
        text = text.replace('href="assets/css/style.css"', 'href="assets/css/styles.css"')
    if text != '\n'.join(lines):
        p.write_text(text, encoding='utf-8')
        changed.append(p.name)
print('changed:', changed)
