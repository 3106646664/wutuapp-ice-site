from pathlib import Path
import re
for p in Path('research').glob('*.js'):
 s=p.read_text(encoding='utf-8')
 print(p.name,len(s))
 print('\n'.join(sorted(set(re.findall(r'"([^"\n]{0,160}\.(?:js|wasm|drc|ktx2|ogg|mp3|json|png|jpg|woff2?))"',s)))))
 print('EXTERNAL',sorted(set(re.findall(r'https?[^"\s`<>]+',s)))[:50])
