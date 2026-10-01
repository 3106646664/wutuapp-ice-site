from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote
root = Path('/var/www/wudaoapp/current')
count = 0
for item in root.rglob('*'):
    if not item.is_file():
        continue
    path = '/' + item.relative_to(root).as_posix()
    req = Request('http://127.0.0.1' + quote(path), method='HEAD', headers={'Host': 'wutuapp.com'})
    with urlopen(req, timeout=10) as response:
        assert response.status == 200, path
        assert int(response.headers['Content-Length']) == item.stat().st_size, path
    count += 1
print(f'All {count} deployed files served correctly.')
