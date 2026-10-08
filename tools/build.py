from pathlib import Path
import json, zipfile
root = Path(__file__).resolve().parents[1]
version = (root / 'VERSION').read_text().strip()
manifest = json.loads((root / 'extension/manifest.json').read_text())
assert manifest['version'] == version.split('-')[0]
dest = root / 'downloads' / f'haivision-streamhub-controller-v{version}.zip'
dest.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted((root / 'extension').rglob('*')):
        if file.is_file():
            archive.write(file, Path('streamhub-virtual-panel') / file.relative_to(root / 'extension'))
print(dest)
